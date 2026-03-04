import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB, { lastDbError, dbConnectionAttempts } from './config/database';
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
import attendanceAdvancedRoutes from './routes/attendanceAdvanced';
import helpdeskRoutes from './routes/helpdesk';
import notificationRoutes from './routes/notifications';
import itSpecialistsRoutes from './routes/itSpecialists';
import approvalsRoutes from './routes/approvals';
import analyticsRoutes from './routes/analytics';
import rmgAnalyticsRoutes from './routes/rmgAnalytics';
import subCategoryConfigRoutes from './routes/subCategoryConfig';
import payrollRoutes from './routes/payroll';
import projectsRoutes from './routes/projects';
import allocationsRoutes from './routes/allocations';
import superAdminRoutes from './routes/superAdmin';
import customerRoutes from './routes/customers';
import customerPORoutes from './routes/customerPOs';
import financialLineRoutes from './routes/financialLines';
import flResourceRoutes from './routes/flResources';
import configRoutes from './routes/config';
import timesheetEntryRoutes from './routes/timesheetEntries';
import timesheetRoutes from './routes/timesheets';
import udaConfigurationRoutes from './routes/udaConfigurations';
import employeeHoursReports from './routes/employeeHoursReport';
import bulkUploadRoutes from './routes/bulkUpload';
import trainingRoutes from './routes/training';
import teamsRoutes from './routes/teams';
import surveysRoutes from './routes/surveys';
import eventsRoutes from './routes/events';
import pollsRoutes from './routes/polls';

dotenv.config();

const app: Application = express();

// Increase Mongoose buffering timeout (default 10s is too short for cold starts)
import mongoose from 'mongoose';
mongoose.set('bufferTimeoutMS', 30000);

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
const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const getAllowedOrigins = (): string[] => {
  if (process.env.NODE_ENV !== 'production') return devOrigins;
  const origins: string[] = [];
  // Support comma-separated list in CORS_ORIGIN
  if (process.env.CORS_ORIGIN) {
    origins.push(...process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean));
  }
  if (process.env.ALLOWED_ORIGINS) {
    origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean));
  }
  // Hardcoded fallback for the known Static Web App URL
  origins.push('https://white-island-0c747ea00.4.azurestaticapps.net');
  return [...new Set(origins)];
};

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
app.use('/api/attendance', attendanceAdvancedRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/it-specialists', itSpecialistsRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rmg-analytics', rmgAnalyticsRoutes);
app.use('/api/subcategory-config', subCategoryConfigRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/allocations', allocationsRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/financial-lines', financialLineRoutes);
app.use('/api/customer-pos', customerPORoutes);
app.use('/api/flresources', flResourceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/timesheet-entries', timesheetEntryRoutes);
app.use('/api/timesheets', timesheetRoutes);
app.use('/api/uda-configurations', udaConfigurationRoutes);
app.use('/api/employee-hours-reports', employeeHoursReports);
app.use('/api/employees/bulk-upload', bulkUploadRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/polls', pollsRoutes);

// Health check with DB status
app.get('/api/health', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStates: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: dbStates[dbState] || 'unknown',
    dbReadyState: dbState,
    lastDbError: lastDbError || null,
    dbConnectionAttempts,
    nodeVersion: process.version,
    env: process.env.NODE_ENV || 'not set',
    mongoUriSet: !!process.env.MONGODB_URI,
    port: process.env.PORT || 'not set'
  });
});

// Retry DB connection endpoint
app.get('/api/retry-db', async (req: Request, res: Response) => {
  try {
    await connectDB();
    const dbState = mongoose.connection.readyState;
    res.json({ status: dbState === 1 ? 'connected' : 'failed', readyState: dbState, lastError: lastDbError || null });
  } catch (err: any) {
    res.json({ status: 'error', message: err?.message });
  }
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

// Start listening FIRST so Azure sees port open immediately, then connect DB
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server listening on port ${PORT}`);
  logger.info(`📊 Database: MongoDB (rmg-portal)`);
  logger.info(`🔐 JWT Authentication enabled`);
  
  // Connect to DB after server is listening (non-blocking for Azure health check)
  connectDB()
    .then(() => logger.info('✅ Database connected successfully'))
    .catch((err) => logger.error('⚠️ Database connection failed:', err));
});

// Graceful shutdown for ts-node-dev restarts and process termination
const gracefulShutdown = (signal: string) => {
  logger.info(`🛑 ${signal} received. Closing server...`);
  server.close(() => {
    logger.info('✅ Server closed.');
    process.exit(0);
  });
  // Force close after 3s if still not closed
  setTimeout(() => process.exit(0), 3000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // ts-node-dev uses SIGUSR2

export default app;
