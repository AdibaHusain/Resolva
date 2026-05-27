import Complaint  from '../models/Complaint.model.js';
import AuditLog   from '../models/AuditLog.model.js';
import Vote       from '../models/Vote.model.js';
import asyncHandler      from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { computeSLADeadline }             from '../services/sla.service.js';

// ─── Student: submit new complaint ───────────────────────────────────────────
export const createComplaint = asyncHandler(async (req, res) => {
  const { title, description, category, location, isAnonymous } = req.body;

  // Collect uploaded media URLs from Cloudinary (set by upload middleware)
  const mediaUrls = (req.files || []).map(f => f.path);

  const complaint = await Complaint.create({
    title,
    description,
    category,
    location,
    isAnonymous,
    mediaUrls,
    raisedBy: req.user._id,   // always stored, never exposed if anonymous
    status:   'open',
    priority: 'medium',       // AI will overwrite this in Phase 2
    severityScore: 5,
  });

  // Write the first audit entry — this seeds the transparency timeline
  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'created',
    toStatus:    'open',
    remark:      'Complaint submitted',
  });

  // Sanitize before returning — hide raisedBy if anonymous
  const safe = complaint.toObject();
  if (safe.isAnonymous) delete safe.raisedBy;

  return successResponse(res, safe, 'Complaint submitted successfully', 201);
});

// ─── Anyone: get single complaint with populated refs ────────────────────────
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

// ─── Student: my complaints ───────────────────────────────────────────────────
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

// ─── Public: get all complaints (feed for campus trends) ─────────────────────
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, status, category, priority, search } = req.query;
  const filter = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (search)   filter.$text    = { $search: search };

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .select('-raisedBy')           // never expose author on public feed
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

// ─── Student: upvote / confirm complaint ─────────────────────────────────────
export const voteComplaint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const existing = await Vote.findOne({ complaint: id, user: userId });
  if (existing) return errorResponse(res, 'You already voted on this complaint', 409);

  await Vote.create({ complaint: id, user: userId, type: 'upvote' });

  // Increment voteCount atomically — no race conditions
  const updated = await Complaint.findByIdAndUpdate(
    id,
    { $inc: { voteCount: 1 } },
    { new: true }
  );

  return successResponse(res, { voteCount: updated.voteCount }, 'Vote recorded');
});

// ─── Admin: assign complaint ──────────────────────────────────────────────────
export const assignComplaint = asyncHandler(async (req, res) => {
  const { assignedTo, department, priority, remark } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  const prev = complaint.status;

  complaint.assignedTo = assignedTo;
  complaint.department = department;
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

  return successResponse(res, complaint, 'Complaint assigned');
});

// ─── Admin / Staff: change status ────────────────────────────────────────────
export const changeStatus = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  const prev = complaint.status;
  complaint.status = status;
  if (status === 'resolved') complaint.resolvedAt = new Date();

  // Check SLA breach at the moment of resolution
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

  return successResponse(res, complaint, 'Status updated');
});

// ─── Staff: upload proof of resolution ───────────────────────────────────────
export const uploadProof = asyncHandler(async (req, res) => {
  const proofUrls = (req.files || []).map(f => f.path);
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  complaint.mediaUrls.push(...proofUrls);
  complaint.status = 'resolved';
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

  return successResponse(res, complaint, 'Proof uploaded, marked resolved');
});

// ─── Get timeline (audit log) for a complaint ────────────────────────────────
export const getComplaintTimeline = asyncHandler(async (req, res) => {
  const logs = await AuditLog
    .find({ complaint: req.params.id })
    .populate('performedBy', 'name role')
    .sort({ createdAt: 1 });

  return successResponse(res, logs);
});