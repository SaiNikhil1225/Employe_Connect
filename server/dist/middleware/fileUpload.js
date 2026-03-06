"use strict";
/**
 * File Upload Validation Utilities
 * Provides secure file validation with type checks, size limits, and sanitization
 *
 * This module provides validation utilities that can be used with any file upload handler.
 * For multer integration, install: npm install multer @types/multer
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadConfig = exports.getAllowedFileTypes = exports.handleUploadError = exports.requireFile = exports.validateUploadedFiles = exports.validateFile = exports.isFilenameSecure = exports.sanitizeFilename = exports.generateSecureFilename = exports.validateFileSize = exports.validateFileType = exports.CONFIG = void 0;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Configuration
exports.CONFIG = {
    // Maximum file size in bytes (10MB)
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    // Maximum number of files per request
    MAX_FILES: 5,
    // Allowed MIME types with their extensions
    ALLOWED_TYPES: {
        // Documents
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
        'text/plain': ['.txt'],
        'text/csv': ['.csv'],
        // Images
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'image/svg+xml': ['.svg'],
    },
    // Blocked extensions (double extension attack prevention)
    BLOCKED_EXTENSIONS: [
        '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar',
        '.msi', '.dll', '.com', '.scr', '.hta', '.cpl', '.msc', '.inf',
        '.reg', '.ws', '.wsf', '.wsc', '.wsh', '.psc1', '.scf', '.lnk',
        '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.cgi'
    ],
    // Upload destination
    UPLOAD_DIR: path_1.default.join(__dirname, '../../uploads'),
};
/**
 * Validate file type by checking MIME type and extension
 */
const validateFileType = (file) => {
    const mimeType = file.mimetype.toLowerCase();
    const extension = path_1.default.extname(file.originalname).toLowerCase();
    // Check if MIME type is allowed
    if (!exports.CONFIG.ALLOWED_TYPES[mimeType]) {
        return false;
    }
    // Check if extension matches allowed extensions for this MIME type
    const allowedExtensions = exports.CONFIG.ALLOWED_TYPES[mimeType];
    if (!allowedExtensions.includes(extension)) {
        return false;
    }
    // Check for blocked extensions (double extension attack prevention)
    const fileName = file.originalname.toLowerCase();
    for (const blockedExt of exports.CONFIG.BLOCKED_EXTENSIONS) {
        if (fileName.includes(blockedExt)) {
            return false;
        }
    }
    return true;
};
exports.validateFileType = validateFileType;
/**
 * Validate file size
 */
const validateFileSize = (size) => {
    return size > 0 && size <= exports.CONFIG.MAX_FILE_SIZE;
};
exports.validateFileSize = validateFileSize;
/**
 * Generate secure filename to prevent path traversal attacks
 */
const generateSecureFilename = (originalName) => {
    const extension = path_1.default.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomString = crypto_1.default.randomBytes(16).toString('hex');
    return `${timestamp}-${randomString}${extension}`;
};
exports.generateSecureFilename = generateSecureFilename;
/**
 * Sanitize filename by removing dangerous characters
 */
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace dangerous chars with underscore
        .replace(/\.{2,}/g, '.') // Prevent directory traversal
        .replace(/^\./, '_') // Don't start with dot
        .substring(0, 255); // Limit length
};
exports.sanitizeFilename = sanitizeFilename;
/**
 * Check filename for security issues
 */
const isFilenameSecure = (filename) => {
    // Check for null bytes
    if (filename.includes('\0')) {
        return false;
    }
    // Check for path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return false;
    }
    // Check for hidden files
    if (filename.startsWith('.')) {
        return false;
    }
    return true;
};
exports.isFilenameSecure = isFilenameSecure;
/**
 * Validate a file object
 */
const validateFile = (file) => {
    // Check filename security
    if (!(0, exports.isFilenameSecure)(file.originalname)) {
        return { valid: false, error: 'Invalid filename' };
    }
    // Check file type
    if (!(0, exports.validateFileType)(file)) {
        return {
            valid: false,
            error: 'File type not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, GIF, WEBP, SVG'
        };
    }
    // Check file size
    if (!(0, exports.validateFileSize)(file.size)) {
        if (file.size === 0) {
            return { valid: false, error: 'Empty files are not allowed' };
        }
        return {
            valid: false,
            error: `File too large. Maximum size is ${exports.CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
        };
    }
    return { valid: true };
};
exports.validateFile = validateFile;
/**
 * Middleware to validate files in request (for use after file upload middleware)
 */
const validateUploadedFiles = (req, res, next) => {
    // Get files from request
    let filesToValidate = [];
    if (req.file) {
        filesToValidate = [req.file];
    }
    else if (req.files) {
        if (Array.isArray(req.files)) {
            filesToValidate = req.files;
        }
        else {
            // Handle field-based files object
            filesToValidate = Object.values(req.files).flat();
        }
    }
    // Check file count
    if (filesToValidate.length > exports.CONFIG.MAX_FILES) {
        return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${exports.CONFIG.MAX_FILES} files`,
            code: 'TOO_MANY_FILES'
        });
    }
    // Validate each file
    for (const file of filesToValidate) {
        const result = (0, exports.validateFile)(file);
        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.error,
                code: 'INVALID_FILE'
            });
        }
    }
    next();
};
exports.validateUploadedFiles = validateUploadedFiles;
/**
 * Middleware to require at least one file
 */
const requireFile = (fieldName) => {
    return (req, res, next) => {
        const hasFile = req.file || (req.files && (Array.isArray(req.files) ? req.files.length > 0 : Object.keys(req.files).length > 0));
        if (!hasFile) {
            return res.status(400).json({
                success: false,
                message: `File is required in field: ${fieldName}`,
                code: 'FILE_REQUIRED'
            });
        }
        next();
    };
};
exports.requireFile = requireFile;
/**
 * Error handler middleware for file upload errors
 */
const handleUploadError = (err, _req, res, next) => {
    // Handle common upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${exports.CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
            code: 'FILE_TOO_LARGE'
        });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: `Too many files. Maximum is ${exports.CONFIG.MAX_FILES} files`,
            code: 'TOO_MANY_FILES'
        });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Unexpected file field',
            code: 'UNEXPECTED_FILE'
        });
    }
    if (err.message.includes('File type not allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message,
            code: 'INVALID_FILE_TYPE'
        });
    }
    next(err);
};
exports.handleUploadError = handleUploadError;
/**
 * Get allowed file types for client-side validation
 */
const getAllowedFileTypes = () => {
    const extensions = [];
    const mimeTypes = [];
    for (const [mime, exts] of Object.entries(exports.CONFIG.ALLOWED_TYPES)) {
        mimeTypes.push(mime);
        extensions.push(...exts);
    }
    return {
        extensions: [...new Set(extensions)],
        mimeTypes: [...new Set(mimeTypes)],
        maxSize: exports.CONFIG.MAX_FILE_SIZE,
        maxFiles: exports.CONFIG.MAX_FILES
    };
};
exports.getAllowedFileTypes = getAllowedFileTypes;
/**
 * Export configuration for external use
 */
exports.uploadConfig = exports.CONFIG;
//# sourceMappingURL=fileUpload.js.map