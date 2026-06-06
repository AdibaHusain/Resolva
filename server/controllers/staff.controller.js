import Complaint from '../models/Complaint.model.js';
import AuditLog  from '../models/AuditLog.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ── Staff ke assigned tasks ───────────────────────────────────────────────────
export const getMyTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { assignedTo: req.user._id };
  if (status) filter.status = status;

  const tasks = await Complaint.find(filter)
    .sort({ priority: -1, slaDeadline: 1 })
    .populate('department', 'name');

  return successResponse(res, tasks);
});

// ── Task complete karo ────────────────────────────────────────────────────────
export const completeTask = asyncHandler(async (req, res) => {
  const { remark } = req.body;
  const complaint  = await Complaint.findById(req.params.id);
  if (!complaint) return errorResponse(res, 'Not found', 404);

  // Sirf apna assigned task complete kar sakta hai staff
  if (String(complaint.assignedTo) !== String(req.user._id)) {
    return errorResponse(res, 'Not your task', 403);
  }

  const prev         = complaint.status;
  complaint.status   = 'resolved';
  complaint.resolvedAt = new Date();

  if (complaint.slaDeadline && complaint.slaDeadline < new Date()) {
    complaint.slaBreach = true;
  }

  await complaint.save();

  await AuditLog.create({
    complaint:   complaint._id,
    performedBy: req.user._id,
    action:      'status_changed',
    fromStatus:  prev,
    toStatus:    'resolved',
    remark:      remark || 'Task completed by staff',
  });

  return successResponse(res, complaint, 'Task marked as resolved');
});