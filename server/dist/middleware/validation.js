"use strict";
/**
 * Request Body Validation Middleware
 * Provides validation schemas and middleware for all API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequestSize = exports.validateContentType = exports.sanitizeInputs = exports.queryValidation = exports.payrollValidation = exports.allocationValidation = exports.announcementValidation = exports.attendanceValidation = exports.leaveValidation = exports.helpdeskValidation = exports.employeeValidation = exports.authValidation = exports.commonValidations = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../utils/errorHandler");
/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
        }));
        const error = new errorHandler_1.ApiError(400, 'Validation failed', 'VALIDATION_ERROR');
        // Add validation details to response
        res.status(400).json({
            success: false,
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: formattedErrors,
            },
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
/**
 * Common validation rules
 */
exports.commonValidations = {
    email: (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    password: (0, express_validator_1.body)('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    employeeId: (0, express_validator_1.body)('employeeId')
        .trim()
        .matches(/^(ACUA|ACUC|ACUI|ACUM)[0-9]{4}$/)
        .withMessage('Employee ID must match format ACUA0000, ACUC0000, ACUI0000, or ACUM0000'),
    mongoId: (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
    employeeIdParam: (0, express_validator_1.param)('employeeId')
        .trim()
        .matches(/^[A-Z]{2,8}[0-9]+$/)
        .withMessage('Invalid employee ID format'),
    // Flexible validation: accepts either MongoDB ObjectId OR employeeId format
    mongoIdOrEmployeeId: (0, express_validator_1.param)('id')
        .trim()
        .custom((value) => {
        // Check if it's a valid MongoDB ObjectId (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(value)) {
            return true;
        }
        // Check if it's a valid employeeId format (any uppercase letters + digits, e.g. EMP001, HR001, ACUA0001)
        if (/^[A-Z]{2,8}\d+$/.test(value)) {
            return true;
        }
        throw new Error('Invalid ID format - must be either MongoDB ObjectId or a valid Employee ID (e.g. EMP001, HR001)');
    }),
    name: (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s.'-]+$/)
        .withMessage('Name can only contain letters, spaces, dots, hyphens and apostrophes'),
    phoneNumber: (0, express_validator_1.body)('phoneNumber')
        .optional()
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be 10 digits'),
    date: (fieldName) => (0, express_validator_1.body)(fieldName)
        .isISO8601()
        .withMessage(`${fieldName} must be a valid date`),
    positiveNumber: (fieldName) => (0, express_validator_1.body)(fieldName)
        .isFloat({ min: 0 })
        .withMessage(`${fieldName} must be a positive number`),
};
/**
 * Authentication validation schemas
 */
exports.authValidation = {
    login: [
        (0, express_validator_1.body)('email')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required'),
        exports.handleValidationErrors,
    ],
    register: [
        exports.commonValidations.email,
        exports.commonValidations.password,
        exports.commonValidations.name,
        (0, express_validator_1.body)('employeeId')
            .trim()
            .notEmpty()
            .withMessage('Employee ID is required'),
        exports.handleValidationErrors,
    ],
    changePassword: [
        (0, express_validator_1.body)('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        (0, express_validator_1.body)('newPassword')
            .isLength({ min: 8, max: 128 })
            .withMessage('New password must be between 8 and 128 characters'),
        exports.handleValidationErrors,
    ],
};
/**
 * Employee validation schemas
 */
exports.employeeValidation = {
    create: [
        exports.commonValidations.name,
        exports.commonValidations.email,
        // Employee ID is auto-generated on server, so make it optional for creation
        (0, express_validator_1.body)('employeeId')
            .optional()
            .trim()
            .matches(/^(ACUA|ACUC|ACUI|ACUM)[0-9]{4}$/)
            .withMessage('Employee ID must match format ACUA0000, ACUC0000, ACUI0000, or ACUM0000'),
        (0, express_validator_1.body)('department')
            .trim()
            .notEmpty()
            .withMessage('Department is required'),
        (0, express_validator_1.body)('designation')
            .trim()
            .notEmpty()
            .withMessage('Designation is required'),
        (0, express_validator_1.body)('dateOfJoining')
            .isISO8601()
            .withMessage('Valid date of joining is required'),
        (0, express_validator_1.body)('salary')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Salary must be a positive number'),
        exports.handleValidationErrors,
    ],
    update: [
        exports.commonValidations.mongoIdOrEmployeeId,
        (0, express_validator_1.body)('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Valid email is required'),
        (0, express_validator_1.body)('department')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Department cannot be empty'),
        exports.handleValidationErrors,
    ],
    updateByEmployeeId: [
        exports.commonValidations.employeeIdParam,
        (0, express_validator_1.body)('name')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Valid email is required'),
        (0, express_validator_1.body)('department')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Department cannot be empty'),
        exports.handleValidationErrors,
    ],
    delete: [
        exports.commonValidations.mongoIdOrEmployeeId,
        exports.handleValidationErrors,
    ],
};
/**
 * Helpdesk ticket validation schemas
 */
exports.helpdeskValidation = {
    createTicket: [
        (0, express_validator_1.body)('userId')
            .trim()
            .notEmpty()
            .withMessage('User ID is required'),
        (0, express_validator_1.body)('userName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('User name must be between 2 and 100 characters'),
        // Note: Removed strict regex to allow Unicode characters (e.g., José, Müller, 日本語)
        (0, express_validator_1.body)('userEmail')
            .trim()
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        (0, express_validator_1.body)('subject')
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Subject must be between 5 and 200 characters')
            .escape(), // Prevent XSS
        (0, express_validator_1.body)('description')
            .trim()
            .isLength({ min: 10, max: 10000 })
            .withMessage('Description must be between 10 and 10000 characters'),
        (0, express_validator_1.body)('highLevelCategory')
            .trim()
            .notEmpty()
            .withMessage('Category is required')
            .isIn(['IT', 'Facilities', 'Finance'])
            .withMessage('Invalid category'),
        (0, express_validator_1.body)('subCategory')
            .trim()
            .notEmpty()
            .withMessage('Subcategory is required')
            .isLength({ max: 100 })
            .withMessage('Subcategory must be at most 100 characters'),
        (0, express_validator_1.body)('urgency')
            .optional()
            .isIn(['low', 'medium', 'high', 'critical'])
            .withMessage('Invalid urgency level'),
        (0, express_validator_1.body)('requiresApproval')
            .optional()
            .isBoolean()
            .withMessage('requiresApproval must be a boolean'),
        (0, express_validator_1.body)('attachments')
            .optional()
            .isArray()
            .withMessage('Attachments must be an array')
            .custom((arr) => arr.length <= 10)
            .withMessage('Maximum 10 attachments allowed'),
        exports.handleValidationErrors,
    ],
    updateTicket: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('status')
            .optional()
            .isIn([
            'open', 'pending', 'in-progress', 'resolved', 'closed', 'cancelled',
            'Pending Level-1 Approval', 'Pending Level-2 Approval', 'Pending Level-3 Approval',
            'Approved', 'Rejected', 'Cancelled', 'Routed', 'In Queue', 'Assigned',
            'In Progress', 'Paused', 'On Hold', 'Completed',
            'Confirmed', 'Closed', 'Auto-Closed'
        ])
            .withMessage('Invalid status'),
        exports.handleValidationErrors,
    ],
    assignTicket: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('employeeId')
            .trim()
            .notEmpty()
            .withMessage('Employee ID is required'),
        (0, express_validator_1.body)('employeeName')
            .trim()
            .notEmpty()
            .withMessage('Employee name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Employee name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('assignedById')
            .trim()
            .notEmpty()
            .withMessage('Assigned by ID is required'),
        (0, express_validator_1.body)('assignedByName')
            .trim()
            .notEmpty()
            .withMessage('Assigned by name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Assigned by name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('notes')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Notes must be at most 1000 characters'),
        exports.handleValidationErrors,
    ],
    addMessage: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('sender')
            .isIn(['employee', 'manager', 'specialist', 'itadmin', 'system'])
            .withMessage('Invalid sender type'),
        (0, express_validator_1.body)('senderName')
            .trim()
            .notEmpty()
            .withMessage('Sender name is required')
            .isLength({ min: 2, max: 100 })
            .withMessage('Sender name must be between 2 and 100 characters'),
        (0, express_validator_1.body)('message')
            .trim()
            .isLength({ min: 1, max: 5000 })
            .withMessage('Message must be between 1 and 5000 characters'),
        (0, express_validator_1.body)('attachments')
            .optional()
            .isArray()
            .withMessage('Attachments must be an array'),
        exports.handleValidationErrors,
    ],
    updateProgress: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('progressStatus')
            .isIn(['Not Started', 'In Progress', 'On Hold', 'Completed'])
            .withMessage('Invalid progress status'),
        (0, express_validator_1.body)('notes')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Notes must be at most 2000 characters'),
        exports.handleValidationErrors,
    ],
    completeWork: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('resolutionNotes')
            .trim()
            .isLength({ min: 10, max: 5000 })
            .withMessage('Resolution notes must be between 10 and 5000 characters'),
        (0, express_validator_1.body)('completedBy')
            .trim()
            .notEmpty()
            .withMessage('Completed by is required'),
        exports.handleValidationErrors,
    ],
    confirmCompletion: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('confirmedBy')
            .trim()
            .notEmpty()
            .withMessage('Confirmed by is required'),
        (0, express_validator_1.body)('feedback')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Feedback must be at most 2000 characters'),
        exports.handleValidationErrors,
    ],
    pauseTicket: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('pausedBy')
            .trim()
            .notEmpty()
            .withMessage('Paused by is required'),
        (0, express_validator_1.body)('reason')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Reason must be at most 1000 characters'),
        exports.handleValidationErrors,
    ],
    resumeTicket: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('resumedBy')
            .trim()
            .notEmpty()
            .withMessage('Resumed by is required'),
        exports.handleValidationErrors,
    ],
    closeTicket: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('closedBy')
            .trim()
            .notEmpty()
            .withMessage('Closed by is required'),
        (0, express_validator_1.body)('closingNotes')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Closing notes must be at most 2000 characters'),
        exports.handleValidationErrors,
    ],
};
/**
 * Leave request validation schemas
 */
exports.leaveValidation = {
    create: [
        (0, express_validator_1.body)('leaveType')
            .isIn(['Casual Leave', 'Paid Leave', 'Paternity Leave', 'Earned Leave', 'Sabbatical Leave', 'Comp Off'])
            .withMessage('Invalid leave type'),
        (0, express_validator_1.body)('startDate')
            .isISO8601()
            .withMessage('Valid start date is required'),
        (0, express_validator_1.body)('endDate')
            .isISO8601()
            .withMessage('Valid end date is required')
            .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
        // Accept either 'reason' or 'justification' field
        (0, express_validator_1.body)('justification')
            .optional()
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Justification must be between 10 and 500 characters'),
        (0, express_validator_1.body)('reason')
            .optional()
            .trim()
            .isLength({ min: 10, max: 500 })
            .withMessage('Reason must be between 10 and 500 characters'),
        // Custom validation to ensure at least one of reason or justification is provided
        (0, express_validator_1.body)().custom((value, { req }) => {
            const reason = req.body.reason?.trim();
            const justification = req.body.justification?.trim();
            if (!reason && !justification) {
                throw new Error('Either reason or justification is required (minimum 10 characters)');
            }
            if ((reason && reason.length < 10) && (!justification || justification.length < 10)) {
                throw new Error('Reason/justification must be at least 10 characters');
            }
            return true;
        }),
        exports.handleValidationErrors,
    ],
    update: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('status')
            .optional()
            .isIn(['Pending', 'Approved', 'Rejected', 'pending', 'approved', 'rejected', 'cancelled'])
            .withMessage('Invalid status'),
        exports.handleValidationErrors,
    ],
};
/**
 * Attendance validation schemas
 */
exports.attendanceValidation = {
    create: [
        (0, express_validator_1.body)('date')
            .isISO8601()
            .withMessage('Valid date is required'),
        (0, express_validator_1.body)('checkIn')
            .optional()
            .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .withMessage('Check-in time must be in HH:MM format'),
        (0, express_validator_1.body)('checkOut')
            .optional()
            .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
            .withMessage('Check-out time must be in HH:MM format'),
        (0, express_validator_1.body)('status')
            .isIn(['Present', 'Absent', 'Half Day', 'Leave'])
            .withMessage('Invalid attendance status'),
        exports.handleValidationErrors,
    ],
};
/**
 * Announcement validation schemas
 */
exports.announcementValidation = {
    create: [
        (0, express_validator_1.body)('title')
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Title must be between 1 and 200 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .trim()
            .isLength({ max: 5000 })
            .withMessage('Description must be at most 5000 characters'),
        (0, express_validator_1.body)('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'Low', 'Medium', 'High', 'Critical'])
            .withMessage('Priority must be low, medium, or high'),
        (0, express_validator_1.body)('imageUrl')
            .optional()
            .custom((value) => {
            // Allow both URLs and base64 data URIs
            if (!value)
                return true;
            if (value.startsWith('data:image/'))
                return true; // Base64 image
            if (value.startsWith('http://') || value.startsWith('https://'))
                return true; // URL
            throw new Error('Image must be a valid URL or base64 data');
        }),
        exports.handleValidationErrors,
    ],
    update: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('title')
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Title must be between 1 and 200 characters'),
        (0, express_validator_1.body)('description')
            .optional()
            .trim()
            .isLength({ max: 5000 })
            .withMessage('Description must be at most 5000 characters'),
        (0, express_validator_1.body)('priority')
            .optional()
            .isIn(['low', 'medium', 'high', 'Low', 'Medium', 'High', 'Critical'])
            .withMessage('Priority must be low, medium, or high'),
        (0, express_validator_1.body)('imageUrl')
            .optional()
            .custom((value) => {
            if (!value)
                return true;
            if (value.startsWith('data:image/'))
                return true;
            if (value.startsWith('http://') || value.startsWith('https://'))
                return true;
            throw new Error('Image must be a valid URL or base64 data');
        }),
        exports.handleValidationErrors,
    ],
};
/**
 * Project allocation validation schemas
 */
exports.allocationValidation = {
    create: [
        (0, express_validator_1.body)('employeeId')
            .isMongoId()
            .withMessage('Valid employee ID is required'),
        (0, express_validator_1.body)('projectId')
            .isMongoId()
            .withMessage('Valid project ID is required'),
        (0, express_validator_1.body)('allocation')
            .isInt({ min: 0, max: 100 })
            .withMessage('Allocation must be between 0 and 100'),
        (0, express_validator_1.body)('startDate')
            .isISO8601()
            .withMessage('Valid start date is required'),
        (0, express_validator_1.body)('endDate')
            .optional()
            .isISO8601()
            .withMessage('Valid end date is required')
            .custom((value, { req }) => {
            if (value && new Date(value) < new Date(req.body.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
        (0, express_validator_1.body)('billable')
            .optional()
            .isBoolean()
            .withMessage('Billable must be a boolean'),
        exports.handleValidationErrors,
    ],
    update: [
        exports.commonValidations.mongoId,
        (0, express_validator_1.body)('allocation')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('Allocation must be between 0 and 100'),
        exports.handleValidationErrors,
    ],
};
/**
 * Payroll validation schemas
 */
exports.payrollValidation = {
    create: [
        (0, express_validator_1.body)('employeeId')
            .isMongoId()
            .withMessage('Valid employee ID is required'),
        (0, express_validator_1.body)('month')
            .isInt({ min: 1, max: 12 })
            .withMessage('Month must be between 1 and 12'),
        (0, express_validator_1.body)('year')
            .isInt({ min: 2000, max: 2100 })
            .withMessage('Year must be between 2000 and 2100'),
        (0, express_validator_1.body)('basicSalary')
            .isFloat({ min: 0 })
            .withMessage('Basic salary must be a positive number'),
        (0, express_validator_1.body)('allowances')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Allowances must be a positive number'),
        (0, express_validator_1.body)('deductions')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Deductions must be a positive number'),
        exports.handleValidationErrors,
    ],
};
/**
 * Query parameter validation
 */
exports.queryValidation = {
    pagination: [
        (0, express_validator_1.query)('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),
        (0, express_validator_1.query)('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        exports.handleValidationErrors,
    ],
    dateRange: [
        (0, express_validator_1.query)('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be valid'),
        (0, express_validator_1.query)('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be valid'),
        exports.handleValidationErrors,
    ],
    search: [
        (0, express_validator_1.query)('q')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Search query must be between 1 and 100 characters'),
        exports.handleValidationErrors,
    ],
};
/**
 * Sanitization middleware
 * Removes potentially dangerous characters from all string inputs
 */
const sanitizeInputs = (req, res, next) => {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // Remove null bytes and control characters
            // eslint-disable-next-line no-control-regex
            return value.replace(/\x00/g, '').replace(/[\x00-\x1F\x7F]/g, '');
        }
        if (Array.isArray(value)) {
            return value.map(sanitizeValue);
        }
        if (value && typeof value === 'object') {
            const sanitized = {};
            for (const [key, val] of Object.entries(value)) {
                sanitized[key] = sanitizeValue(val);
            }
            return sanitized;
        }
        return value;
    };
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }
    if (req.params) {
        req.params = sanitizeValue(req.params);
    }
    next();
};
exports.sanitizeInputs = sanitizeInputs;
/**
 * Content-Type validation middleware
 * Ensures request has proper Content-Type header for POST/PUT/PATCH with body
 */
const validateContentType = (req, res, next) => {
    const methods = ['POST', 'PUT', 'PATCH'];
    if (methods.includes(req.method)) {
        const contentType = req.get('Content-Type');
        const contentLength = req.get('Content-Length');
        // Only require Content-Type if there's actual content
        const hasContent = contentLength && parseInt(contentLength, 10) > 0;
        const hasBody = req.body && Object.keys(req.body).length > 0;
        // Allow application/json or multipart/form-data
        const isValidContentType = contentType && (contentType.includes('application/json') ||
            contentType.includes('multipart/form-data'));
        // If there's content but no valid content type, reject
        if ((hasContent || hasBody) && !isValidContentType) {
            const error = new errorHandler_1.ApiError(415, 'Content-Type must be application/json or multipart/form-data', 'INVALID_CONTENT_TYPE');
            return (0, errorHandler_1.handleError)(res, error, 'Invalid Content-Type header');
        }
    }
    next();
};
exports.validateContentType = validateContentType;
/**
 * Request size validation
 * Prevents oversized payloads
 */
const validateRequestSize = (maxSize) => {
    return (req, res, next) => {
        const contentLength = req.get('Content-Length');
        if (contentLength && parseInt(contentLength) > maxSize) {
            const error = new errorHandler_1.ApiError(413, `Request body too large. Maximum size is ${maxSize / 1024 / 1024}MB`, 'PAYLOAD_TOO_LARGE');
            return (0, errorHandler_1.handleError)(res, error, 'Request body size exceeded');
        }
        next();
    };
};
exports.validateRequestSize = validateRequestSize;
//# sourceMappingURL=validation.js.map