/**
 * Request Body Validation Middleware
 * Provides validation schemas and middleware for all API endpoints
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to handle validation errors
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Common validation rules
 */
export declare const commonValidations: {
    email: import("express-validator").ValidationChain;
    password: import("express-validator").ValidationChain;
    employeeId: import("express-validator").ValidationChain;
    mongoId: import("express-validator").ValidationChain;
    employeeIdParam: import("express-validator").ValidationChain;
    mongoIdOrEmployeeId: import("express-validator").ValidationChain;
    name: import("express-validator").ValidationChain;
    phoneNumber: import("express-validator").ValidationChain;
    date: (fieldName: string) => import("express-validator").ValidationChain;
    positiveNumber: (fieldName: string) => import("express-validator").ValidationChain;
};
/**
 * Authentication validation schemas
 */
export declare const authValidation: {
    login: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    register: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    changePassword: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Employee validation schemas
 */
export declare const employeeValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    update: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    updateByEmployeeId: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    delete: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Helpdesk ticket validation schemas
 */
export declare const helpdeskValidation: {
    createTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    updateTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    assignTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    addMessage: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    updateProgress: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    completeWork: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    confirmCompletion: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    pauseTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    resumeTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    closeTicket: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Leave request validation schemas
 */
export declare const leaveValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    update: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Attendance validation schemas
 */
export declare const attendanceValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Announcement validation schemas
 */
export declare const announcementValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    update: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Project allocation validation schemas
 */
export declare const allocationValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    update: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Payroll validation schemas
 */
export declare const payrollValidation: {
    create: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Query parameter validation
 */
export declare const queryValidation: {
    pagination: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    dateRange: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
    search: (((req: Request, res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
};
/**
 * Sanitization middleware
 * Removes potentially dangerous characters from all string inputs
 */
export declare const sanitizeInputs: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Content-Type validation middleware
 * Ensures request has proper Content-Type header for POST/PUT/PATCH with body
 */
export declare const validateContentType: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Request size validation
 * Prevents oversized payloads
 */
export declare const validateRequestSize: (maxSize: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map