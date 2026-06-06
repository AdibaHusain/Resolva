import { Router } from 'express';
import { protect }        from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  getAllComplaints,
  getDashboardStats,
  getStaffList,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, authorizeRoles('admin')); // Saare admin routes protected

router.get('/complaints',  getAllComplaints);
router.get('/stats',       getDashboardStats);
router.get('/staff',       getStaffList);

export default router;