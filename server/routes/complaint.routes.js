import { Router } from 'express';
import { protect }         from '../middleware/auth.middleware.js';
import { authorizeRoles }  from '../middleware/role.middleware.js';
import { upload }          from '../middleware/upload.middleware.js';
import { validate, createComplaintSchema, updateComplaintSchema } from '../utils/validators.js';
import {
  createComplaint, getComplaint, getMyComplaints,
  getAllComplaints, voteComplaint, assignComplaint,
  changeStatus, uploadProof, getComplaintTimeline,
} from '../controllers/complaint.controller.js';

const router = Router();

// ── Public (auth required, any role) ─────────────────────────────────────────
router.get('/',        protect, getAllComplaints);
router.get('/mine',    protect, authorizeRoles('student'), getMyComplaints);
router.get('/:id',     protect, getComplaint);
router.get('/:id/timeline', protect, getComplaintTimeline);

// ── Student actions ───────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  authorizeRoles('student'),
  upload.array('media', 5),
  validate(createComplaintSchema),
  createComplaint
);
router.post('/:id/vote', protect, authorizeRoles('student'), voteComplaint);

// ── Admin actions ─────────────────────────────────────────────────────────────
router.patch('/:id/assign', protect, authorizeRoles('admin'), assignComplaint);
router.patch('/:id/status', protect, authorizeRoles('admin', 'staff'), changeStatus);

// ── Staff actions ─────────────────────────────────────────────────────────────
router.post(
  '/:id/proof',
  protect,
  authorizeRoles('staff'),
  upload.array('proof', 5),
  uploadProof
);

export default router;