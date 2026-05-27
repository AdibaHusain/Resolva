import { errorResponse } from '../utils/apiResponse.js';

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, `Role '${req.user.role}' is not authorized`, 403);
  }
  next();
};