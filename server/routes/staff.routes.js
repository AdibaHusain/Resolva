import { Router } from 'express';
import { protect }        from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { getMyTasks, completeTask } from '../controllers/staff.controller.js';

const router = Router();

router.use(protect, authorizeRoles('staff'));

router.get('/tasks',           getMyTasks);
router.patch('/tasks/:id/complete', completeTask);

export default router;