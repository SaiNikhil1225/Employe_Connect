/**
 * File Upload Validation Utilities
 * Provides secure file validation with type checks, size limits, and sanitization
 *
 * This module provides validation utilities that can be used with any file upload handler.
 * For multer integration, install: npm install multer @types/multer
 */
import { Request, Response, NextFunction } from 'express';
export interface FileInfo {
    fieldname?: string;
    originalname: string;
    encoding?: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer?: Buffer;
}
export declare const CONFIG: {
    MAX_FILE_SIZE: number;
    MAX_FILES: number;
    ALLOWED_TYPES: Record<string, string[]>;
    BLOCKED_EXTENSIONS: string[];
    UPLOAD_DIR: string;
};
/**
 * Validate file type by checking MIME type and extension
 */
export declare const validateFileType: (file: {
    mimetype: string;
    originalname: string;
}) => boolean;
/**
 * Validate file size
 */
export declare const validateFileSize: (size: number) => boolean;
/**
 * Generate secure filename to prevent path traversal attacks
 */
export declare const generateSecureFilename: (originalName: string) => string;
/**
 * Sanitize filename by removing dangerous characters
 */
export declare const sanitizeFilename: (filename: string) => string;
/**
 * Check filename for security issues
 */
export declare const isFilenameSecure: (filename: string) => boolean;
/**
 * Validate a file object
 */
export declare const validateFile: (file: FileInfo) => {
    valid: boolean;
    error?: string;
};
/**
 * Middleware to validate files in request (for use after file upload middleware)
 */
export declare const validateUploadedFiles: (req: Request & {
    file?: FileInfo;
    files?: FileInfo[] | Record<string, FileInfo[]>;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to require at least one file
 */
export declare const requireFile: (fieldName: string) => (req: Request & {
    file?: FileInfo;
    files?: FileInfo[] | Record<string, FileInfo[]>;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Error handler middleware for file upload errors
 */
export declare const handleUploadError: (err: Error & {
    code?: string;
}, _req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Get allowed file types for client-side validation
 */
export declare const getAllowedFileTypes: () => {
    extensions: string[];
    mimeTypes: string[];
    maxSize: number;
    maxFiles: number;
};
/**
 * Export configuration for external use
 */
export declare const uploadConfig: {
    MAX_FILE_SIZE: number;
    MAX_FILES: number;
    ALLOWED_TYPES: Record<string, string[]>;
    BLOCKED_EXTENSIONS: string[];
    UPLOAD_DIR: string;
};
//# sourceMappingURL=fileUpload.d.ts.map