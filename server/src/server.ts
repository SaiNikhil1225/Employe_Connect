import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import logger, { morganStream } from './config/logger';

// MongoDB Route imports
import authRoutes from './routes/auth';
import announcementRoutes from './routes/announcements';
import holidayRoutes from './routes/holidays';
import celebrationRoutes from './routes/celebrations';
import newJoinerRoutes from './routes/newJoiners';
import leaveRoutes from './routes/leaves';
import employeeRoutes from './routes/employees';
import profileRoutes from './routes/profiles';
import attendanceRoutes from './routes/attendance';
import helpdeskRoutes from './routes/helpdesk';
import notificationRoutes from './routes/notifications';
import itSpecialistsRoutes from './routes/itSpecialists';
import approvalsRoutes from './routes/approvals';
import subCategoryConfigRoutes from './routes/subCategoryConfig';
import payrollRoutes from './routes/payroll';
import projectsRoutes from './routes/projects';
import allocationsRoutes from './routes/allocations';
import superAdminRoutes from './routes/superAdmin';

dotenv.config();

const app: Application = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting - relaxed for development
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: morganStream }));

// Import validation middleware
import { sanitizeInputs, validateContentType, validateRequestSize } from './middleware/validation';

// Apply global validation middleware
app.use(sanitizeInputs); // Sanitize all inputs
app.use(validateContentType); // Validate Content-Type for POST/PUT/PATCH
app.use(validateRequestSize(10 * 1024 * 1024)); // Max 10MB request size

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// CSRF Protection (optional - uncomment to enable for state-changing operations)
// Note: Requires frontend to request and include CSRF tokens
// import { csrfProtection, getCSRFToken } from './middleware/csrf';
// app.get('/api/csrf-token', getCSRFToken);
// app.use('/api/', csrfProtection); // Apply to all POST/PUT/DELETE requests

// Routes - MongoDB Based
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/celebrations', celebrationRoutes);
app.use('/api/new-joiners', newJoinerRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/it-specialists', itSpecialistsRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/subcategory-config', subCategoryConfigRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/allocations', allocationsRoutes);
app.use('/api/superadmin', superAdminRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  logger.error('Unhandled error:', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 MongoDB Server running on http://localhost:${PORT}`);
  logger.info(`📊 Database: MongoDB (rmg-portal)`);
  logger.info(`🔐 JWT Authentication enabled`);
});

export default app;
