import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return errorResponse(res, 'Not authenticated', 401);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = await User.findById(decoded._id).select('-password -refreshToken');
    if (!req.user) return errorResponse(res, 'User not found', 401);
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};