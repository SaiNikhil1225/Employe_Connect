"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = __importStar(require("./config/database"));
const logger_1 = __importStar(require("./config/logger"));
// MongoDB Route imports
const auth_1 = __importDefault(require("./routes/auth"));
const announcements_1 = __importDefault(require("./routes/announcements"));
const holidays_1 = __importDefault(require("./routes/holidays"));
const celebrations_1 = __importDefault(require("./routes/celebrations"));
const newJoiners_1 = __importDefault(require("./routes/newJoiners"));
const leaves_1 = __importDefault(require("./routes/leaves"));
const employees_1 = __importDefault(require("./routes/employees"));
const profiles_1 = __importDefault(require("./routes/profiles"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const attendanceAdvanced_1 = __importDefault(require("./routes/attendanceAdvanced"));
const helpdesk_1 = __importDefault(require("./routes/helpdesk"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const itSpecialists_1 = __importDefault(require("./routes/itSpecialists"));
const approvals_1 = __importDefault(require("./routes/approvals"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const rmgAnalytics_1 = __importDefault(require("./routes/rmgAnalytics"));
const subCategoryConfig_1 = __importDefault(require("./routes/subCategoryConfig"));
const payroll_1 = __importDefault(require("./routes/payroll"));
const projects_1 = __importDefault(require("./routes/projects"));
const allocations_1 = __importDefault(require("./routes/allocations"));
const superAdmin_1 = __importDefault(require("./routes/superAdmin"));
const customers_1 = __importDefault(require("./routes/customers"));
const customerPOs_1 = __importDefault(require("./routes/customerPOs"));
const financialLines_1 = __importDefault(require("./routes/financialLines"));
const flResources_1 = __importDefault(require("./routes/flResources"));
const config_1 = __importDefault(require("./routes/config"));
const timesheetEntries_1 = __importDefault(require("./routes/timesheetEntries"));
const timesheets_1 = __importDefault(require("./routes/timesheets"));
const udaConfigurations_1 = __importDefault(require("./routes/udaConfigurations"));
const employeeHoursReport_1 = __importDefault(require("./routes/employeeHoursReport"));
const bulkUpload_1 = __importDefault(require("./routes/bulkUpload"));
const training_1 = __importDefault(require("./routes/training"));
const teams_1 = __importDefault(require("./routes/teams"));
const surveys_1 = __importDefault(require("./routes/surveys"));
const events_1 = __importDefault(require("./routes/events"));
const polls_1 = __importDefault(require("./routes/polls"));
const pip_1 = __importDefault(require("./routes/pip"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Increase Mongoose buffering timeout (default 10s is too short for cold starts)
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set('bufferTimeoutMS', 30000);
// Security Middleware
app.use((0, helmet_1.default)({
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
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
// General API rate limiting - relaxed for development
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per minute
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware
const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
const getAllowedOrigins = () => {
    if (process.env.NODE_ENV !== 'production')
        return devOrigins;
    const origins = [];
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
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        logger_1.default.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
        return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
// Import validation middleware
const validation_1 = require("./middleware/validation");
// Apply global validation middleware
app.use(validation_1.sanitizeInputs); // Sanitize all inputs
app.use(validation_1.validateContentType); // Validate Content-Type for POST/PUT/PATCH
app.use((0, validation_1.validateRequestSize)(10 * 1024 * 1024)); // Max 10MB request size
// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
// CSRF Protection (optional - uncomment to enable for state-changing operations)
// Note: Requires frontend to request and include CSRF tokens
// import { csrfProtection, getCSRFToken } from './middleware/csrf';
// app.get('/api/csrf-token', getCSRFToken);
// app.use('/api/', csrfProtection); // Apply to all POST/PUT/DELETE requests
// Routes - MongoDB Based
app.use('/api/auth', auth_1.default);
app.use('/api/announcements', announcements_1.default);
app.use('/api/holidays', holidays_1.default);
app.use('/api/celebrations', celebrations_1.default);
app.use('/api/new-joiners', newJoiners_1.default);
app.use('/api/leaves', leaves_1.default);
app.use('/api/employees', employees_1.default);
app.use('/api/profiles', profiles_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/attendance', attendanceAdvanced_1.default);
app.use('/api/helpdesk', helpdesk_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/it-specialists', itSpecialists_1.default);
app.use('/api/approvals', approvals_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/rmg-analytics', rmgAnalytics_1.default);
app.use('/api/subcategory-config', subCategoryConfig_1.default);
app.use('/api/payroll', payroll_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/allocations', allocations_1.default);
app.use('/api/superadmin', superAdmin_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/financial-lines', financialLines_1.default);
app.use('/api/customer-pos', customerPOs_1.default);
app.use('/api/flresources', flResources_1.default);
app.use('/api/config', config_1.default);
app.use('/api/timesheet-entries', timesheetEntries_1.default);
app.use('/api/timesheets', timesheets_1.default);
app.use('/api/uda-configurations', udaConfigurations_1.default);
app.use('/api/employee-hours-reports', employeeHoursReport_1.default);
app.use('/api/employees/bulk-upload', bulkUpload_1.default);
app.use('/api/training', training_1.default);
app.use('/api/teams', teams_1.default);
app.use('/api/surveys', surveys_1.default);
app.use('/api/events', events_1.default);
app.use('/api/polls', polls_1.default);
app.use('/api/pip', pip_1.default);
// Health check with DB status
app.get('/api/health', (req, res) => {
    const dbState = mongoose_1.default.connection.readyState;
    const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        status: 'ok',
        message: 'Server is running',
        database: dbStates[dbState] || 'unknown',
        dbReadyState: dbState,
        lastDbError: database_1.lastDbError || null,
        dbConnectionAttempts: database_1.dbConnectionAttempts,
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'not set',
        mongoUriSet: !!process.env.MONGODB_URI,
        port: process.env.PORT || 'not set'
    });
});
// Retry DB connection endpoint
app.get('/api/retry-db', async (req, res) => {
    try {
        await (0, database_1.default)();
        const dbState = mongoose_1.default.connection.readyState;
        res.json({ status: dbState === 1 ? 'connected' : 'failed', readyState: dbState, lastError: database_1.lastDbError || null });
    }
    catch (err) {
        res.json({ status: 'error', message: err?.message });
    }
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    logger_1.default.error('Unhandled error:', { message: err.message, stack: err.stack });
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
const PORT = process.env.PORT || 5000;
// Start listening FIRST so Azure sees port open immediately, then connect DB
const server = app.listen(PORT, () => {
    logger_1.default.info(`🚀 Server listening on port ${PORT}`);
    logger_1.default.info(`📊 Database: MongoDB (rmg-portal)`);
    logger_1.default.info(`🔐 JWT Authentication enabled`);
    // Connect to DB after server is listening (non-blocking for Azure health check)
    (0, database_1.default)()
        .then(() => logger_1.default.info('✅ Database connected successfully'))
        .catch((err) => logger_1.default.error('⚠️ Database connection failed:', err));
});
// Graceful shutdown for ts-node-dev restarts and process termination
const gracefulShutdown = (signal) => {
    logger_1.default.info(`🛑 ${signal} received. Closing server...`);
    server.close(() => {
        logger_1.default.info('✅ Server closed.');
        process.exit(0);
    });
    // Force close after 3s if still not closed
    setTimeout(() => process.exit(0), 3000).unref();
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // ts-node-dev uses SIGUSR2
exports.default = app;
//# sourceMappingURL=server.js.map