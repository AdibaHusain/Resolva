import Complaint  from '../models/Complaint.model.js';
import AuditLog   from '../models/AuditLog.model.js';
import Vote       from '../models/Vote.model.js';
import asyncHandler      from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { computeSLADeadline }             from '../services/sla.service.js';
import { analyzeComplaint }               from '../services/ai.service.js';
import { getIO }                          from '../sockets/index.js';

// ─── Student: submit new complaint ───────────────────────────────────────────
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, location, isAnonymous } = req.body;

  const mediaUrls = (req.files || []).map(f => f.path);

  const complaint = await Complaint.create({
    title,
    description,
    category,
    location,
    isAnonymous,
    mediaUrls,
    raisedBy:      req.user._id,
    status:        'open',
    priority:      'medium',
    severityScore: 5,
  });

  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'created',
    toStatus:    'open',
    remark:      'Complaint submitted',
  });

  const safe = complaint.toObject();
  if (safe.isAnonymous) delete safe.raisedBy;

  // ── 201 turant bhejo ──────────────────────────────────────────────────────
  res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: safe });

  // ── Admin ko batao nayi complaint aayi ────────────────────────────────────
  getIO().to('admin-room').emit('new_complaint', {
    _id:       complaint._id,
    title:     complaint.title,
    category:  complaint.category,
    priority:  complaint.priority,
    location:  complaint.location,
    createdAt: complaint.createdAt,
  });

  // ── AI background mein chale ──────────────────────────────────────────────
  setImmediate(async () => {
    try {
      const aiResult = await analyzeComplaint(title, description, category);
      if (!aiResult) return;

      const updates = {
        priority:            aiResult.priority,
        severityScore:       aiResult.severityScore,
        suggestedDepartment: aiResult.suggestedDepartment,
        aiReason:            aiResult.aiReason,
      };

      if (aiResult.category && aiResult.category !== category) {
        updates.category = aiResult.category;
      }

      await Complaint.findByIdAndUpdate(complaint._id, updates);

      await AuditLog.create({
        complaint:   complaint._id,
        performedBy: req.user._id,
        action:      'ai_analyzed',
        remark:      `AI: severity ${aiResult.severityScore}/10 — ${aiResult.aiReason}`,
      });

      // Admin ko AI result bhejo
      getIO().to('admin-room').emit('complaint_ai_updated', {
        _id:          complaint._id,
        priority:     aiResult.priority,
        severityScore: aiResult.severityScore,
        aiReason:     aiResult.aiReason,
      });

      // Student ko bhi batao agar anonymous nahi hai
      if (!complaint.isAnonymous) {
        getIO().to(`student:${complaint.raisedBy}`).emit('complaint_ai_updated', {
          _id:      complaint._id,
          priority: aiResult.priority,
          aiReason: aiResult.aiReason,
        });
      }

    } catch (err) {
      console.error('[AI] Background update failed:', err.message);
    }
  });
});

// ─── Anyone: get single complaint ────────────────────────────────────────────
export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint
    .findById(req.params.id)
    .populate('assignedTo', 'name email role')
    .populate('department', 'name code');

  if (!complaint) return errorResponse(res, 'Complaint not found', 404);

  const safe = complaint.toObject();
  if (safe.isAnonymous) delete safe.raisedBy;

  return successResponse(res, safe);
});

// ─── Student: meri complaints ─────────────────────────────────────────────────
export const getMyComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category } = req.query;
  const filter = { raisedBy: req.user._id };
  if (status)   filter.status   = status;
  if (category) filter.category = category;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Complaint.countDocuments(filter),
  ]);

  return successResponse(res, {
    complaints,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ─── Public: saari complaints ─────────────────────────────────────────────────
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status, category, priority, search } = req.query;
  const filter = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search)   filter.$text    = { $search: search };

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .select('-raisedBy')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Complaint.countDocuments(filter),
  ]);

  return successResponse(res, {
    complaints,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ─── Student: upvote complaint ────────────────────────────────────────────────
export const voteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const existing = await Vote.findOne({ complaint: id, user: userId });
  if (existing) return errorResponse(res, 'Already voted', 409);

  await Vote.create({ complaint: id, user: userId, type: 'upvote' });

  const updated = await Complaint.findByIdAndUpdate(
    id,
    { $inc: { voteCount: 1 } },
    { new: true }
  );

  return successResponse(res, { voteCount: updated.voteCount }, 'Vote recorded');
});

// ─── Admin: complaint assign karo ─────────────────────────────────────────────
export const assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo, department, priority, remark } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  const prev = complaint.status;

  complaint.assignedTo  = assignedTo;
  complaint.department  = department;
  if (priority) complaint.priority = priority;
  complaint.status      = 'assigned';
  complaint.slaDeadline = await computeSLADeadline(complaint.category, complaint.priority);

  await complaint.save();

  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'assigned',
    fromStatus:  prev,
    toStatus:    'assigned',
    remark,
  });

  // Staff ko batao task assign hua
  if (assignedTo) {
    getIO().to(`staff:${assignedTo}`).emit('task_assigned', {
      _id:      complaint._id,
      title:    complaint.title,
      priority: complaint.priority,
      location: complaint.location,
    });
  }

  // Student ko batao
  if (!complaint.isAnonymous) {
    getIO().to(`student:${complaint.raisedBy}`).emit('complaint_updated', {
      _id:    complaint._id,
      status: 'assigned',
    });
  }

  return successResponse(res, complaint, 'Complaint assigned');
});

// ─── Admin / Staff: status change karo ───────────────────────────────────────
export const changeStatus = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  const prev        = complaint.status;
  complaint.status  = status;
  if (status === 'resolved') complaint.resolvedAt = new Date();

  if (complaint.slaDeadline && complaint.slaDeadline < new Date()) {
    complaint.slaBreach = true;
  }

  await complaint.save();

  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'status_changed',
    fromStatus:  prev,
    toStatus:    status,
    remark,
  });

  // Student ko batao
  if (!complaint.isAnonymous) {
    getIO().to(`student:${complaint.raisedBy}`).emit('complaint_updated', {
      _id:    complaint._id,
      status: complaint.status,
      remark: remark || '',
    });
  }

  // Admin ko bhi batao
  getIO().to('admin-room').emit('complaint_updated', {
    _id:    complaint._id,
    status: complaint.status,
  });

  return successResponse(res, complaint, 'Status updated');
});

// ─── Staff: proof upload karo ─────────────────────────────────────────────────
export const uploadProof = asyncHandler(async (req, res) => {
  const proofUrls = (req.files || []).map(f => f.path);
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  complaint.mediaUrls.push(...proofUrls);
  complaint.status     = 'resolved';
  complaint.resolvedAt = new Date();
  await complaint.save();

  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'status_changed',
    fromStatus:  'in_progress',
    toStatus:    'resolved',
    remark:      'Resolution proof uploaded',
  });

  // Student ko batao
  if (!complaint.isAnonymous) {
    getIO().to(`student:${complaint.raisedBy}`).emit('complaint_updated', {
      _id:    complaint._id,
      status: 'resolved',
    });
  }

  return successResponse(res, complaint, 'Proof uploaded, marked resolved');
});

// ─── Complaint ki timeline ────────────────────────────────────────────────────
export const getComplaintTimeline = asyncHandler(async (req, res) => {
  const logs = await AuditLog
    .find({ complaint: req.params.id })
    .populate('performedBy', 'name role')
    .sort({ createdAt: 1 });

  return successResponse(res, logs);
});