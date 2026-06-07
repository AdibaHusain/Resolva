import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes         from './routes/auth.routes.js';
import complaintRoutes    from './routes/complaint.routes.js';
import adminRoutes        from './routes/admin.routes.js';
import staffRoutes        from './routes/staff.routes.js';
import departmentRoutes   from './routes/department.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { errorResponse }  from './utils/apiResponse.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth',          authRoutes);
app.use('/api/complaints',    complaintRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack); // terminal mein dikhega
  errorResponse(res, err.message, err.status || 500);
});

export default app;