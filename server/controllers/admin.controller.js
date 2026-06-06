import Complaint  from '../models/Complaint.model.js';
import AuditLog   from '../models/AuditLog.model.js';
import User       from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ── Saari complaints with filters ────────────────────────────────────────────
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category, priority, department } = req.query;
  const filter = {};
  if (status)     filter.status     = status;
  if (category)   filter.category   = category;
  if (priority)   filter.priority   = priority;
  if (department) filter.department = department;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .populate('department', 'name code')
      .sort({ severityScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Complaint.countDocuments(filter),
  ]);

  return successResponse(res, {
    complaints,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// ── Dashboard stats ───────────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [total, open, inProgress, resolved, critical, breached] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'open' }),
    Complaint.countDocuments({ status: 'in_progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ priority: 'critical' }),
    Complaint.countDocuments({ slaBreach: true }),
  ]);

  return successResponse(res, { total, open, inProgress, resolved, critical, breached });
});

// ── Saare staff members ───────────────────────────────────────────────────────
export const getStaffList = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff', isActive: true })
    .select('name email department');
  return successResponse(res, staff);
});