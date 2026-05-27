import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateTokens = (userId) => ({
  accessToken:  jwt.sign({ _id: userId }, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: '15m' }),
  refreshToken: jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }),
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department, hostelBlock } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 'Email already registered', 409);

    const user = await User.create({ name, email, password, role, rollNumber, department, hostelBlock });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return successResponse(res, { user: user.toSafeObject(), accessToken }, 'Registered successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return successResponse(res, { user: user.toSafeObject(), accessToken }, 'Logged in');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return errorResponse(res, 'No refresh token', 401);
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== token) return errorResponse(res, 'Invalid refresh token', 401);
    const { accessToken } = generateTokens(user._id);
    return successResponse(res, { accessToken });
  } catch {
    return errorResponse(res, 'Token refresh failed', 401);
  }
};

export const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out');
};