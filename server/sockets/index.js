import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // ── Middleware — har connection pe JWT verify karo ──────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user    = await User.findById(decoded._id).select('-password -refreshToken');
      if (!user) return next(new Error('User not found'));

      socket.user = user; // user attach kar do socket pe
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ── Connection handle karo ───────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`[Socket] Connected: ${user.name} (${user.role})`);

    // Role ke hisaab se room mein daalo
    if (user.role === 'admin') {
      socket.join('admin-room');
      socket.join(`admin:${user._id}`);
      console.log(`[Socket] Admin ${user.name} joined admin-room`);
    }

    if (user.role === 'student') {
      socket.join(`student:${user._id}`);
      console.log(`[Socket] Student ${user.name} joined student:${user._id}`);
    }

    if (user.role === 'staff') {
      socket.join(`staff:${user._id}`);
      console.log(`[Socket] Staff ${user.name} joined staff:${user._id}`);
    }

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${user.name}`);
    });
  });

  return io;
};

// ── Ye function controllers mein use hoga ────────────────────────────────────
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};