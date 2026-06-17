import { createServer } from 'http';
import cors from 'cors';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://resolva.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const startServer = async () => {
  try {
    await connectDB();

    // ── HTTP server banao Express ke upar ──────────────────────────────────
    const httpServer = createServer(app);

    // ── Socket.io attach karo HTTP server pe ───────────────────────────────
    initSocket(httpServer);

    // ── Ab httpServer listen kare — app nahi ───────────────────────────────
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.io ready`);
    });
  } catch (err) {
    console.error('Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();