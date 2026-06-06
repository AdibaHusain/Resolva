import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login',    login);
router.post('/refresh',  refreshAccessToken);
router.post('/logout',   protect, logout);

export default router;