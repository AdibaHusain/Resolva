import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateTokens = (userId) => ({
  accessToken:  jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: '15m' }),
  refreshToken: jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }),
});

// ── Register ──────────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, rollNumber, department, hostelBlock } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return errorResponse(res, 'Email already registered', 409);

  const user = await User.create({ name, email, password, role, rollNumber, department, hostelBlock });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, { user: user.toSafeObject(), accessToken }, 'Registered successfully', 201);
});

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return errorResponse(res, 'Invalid credentials', 401);

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

  return successResponse(res, { user: user.toSafeObject(), accessToken }, 'Logged in');
});

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return errorResponse(res, 'No refresh token', 401);

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user    = await User.findById(decoded._id);
  if (!user || user.refreshToken !== token)
    return errorResponse(res, 'Invalid refresh token', 401);

  const { accessToken } = generateTokens(user._id);
  return successResponse(res, { accessToken });
});

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out');
});