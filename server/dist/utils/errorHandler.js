"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.handleError = handleError;
exports.asyncHandler = asyncHandler;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../config/logger"));
/**
 * Centralized error handler for consistent error responses
 */
class ApiError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
/**
 * Format error response with appropriate details
 */
function handleError(res, error, defaultMessage) {
    // Log the error with structured logging
    logger_1.default.error('API Error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        defaultMessage,
    });
    // Check if it's our custom ApiError
    if (error instanceof ApiError) {
        const response = {
            success: false,
            message: error.message,
            code: error.code,
        };
        if (process.env.NODE_ENV === 'development') {
            response.error = error.stack;
        }
        res.status(error.statusCode).json(response);
        return;
    }
    // Handle Mongoose validation errors
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            error: validationErrors.join(', '),
        });
        return;
    }
    // Handle Mongoose cast errors (invalid ObjectId, etc.)
    if (error instanceof mongoose_1.default.Error.CastError) {
        res.status(400).json({
            success: false,
            message: `Invalid ${error.path}: ${error.value}`,
            code: 'INVALID_ID',
        });
        return;
    }
    // Handle duplicate key errors (MongoDB E11000)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
        const duplicateError = error;
        const field = Object.keys(duplicateError.keyPattern || {})[0];
        res.status(409).json({
            success: false,
            message: `${field || 'Resource'} already exists`,
            code: 'DUPLICATE_ERROR',
        });
        return;
    }
    // Handle generic errors
    const response = {
        success: false,
        message: defaultMessage,
        code: 'INTERNAL_ERROR',
    };
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        response.error = error.message;
    }
    res.status(500).json(response);
}
/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            handleError(res, error, 'An unexpected error occurred');
        });
    };
}
//# sourceMappingURL=errorHandler.js.map