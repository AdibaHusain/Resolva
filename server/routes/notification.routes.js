import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import Notification from '../models/Notification.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

// Meri saari notifications
router.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await Notification
    .find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  return successResponse(res, notifications);
}));

// Saari read mark karo
router.patch('/read-all', protect, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  return successResponse(res, null, 'All notifications marked as read');
}));

export default router;