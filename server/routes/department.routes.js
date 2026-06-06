import { Router } from 'express';
import { protect }        from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import Department from '../models/Department.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  const departments = await Department.find({ });
  return successResponse(res, departments);
}));

router.post('/', protect, authorizeRoles('admin'), asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  return successResponse(res, dept, 'Department created', 201);
}));

export default router;