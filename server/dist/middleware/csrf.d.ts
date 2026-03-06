import { Request, Response, NextFunction } from 'express';
interface CSRFRequest extends Request {
    csrfToken: () => string;
    session?: {
        id: string;
    };
}
/**
 * Generate a CSRF token
 */
export declare function generateCSRFToken(sessionId: string): string;
/**
 * Validate CSRF token
 */
export declare function validateCSRFToken(sessionId: string, token: string): boolean;
/**
 * Middleware to generate CSRF token
 */
export declare function csrfProtection(req: CSRFRequest, res: Response, next: NextFunction): void;
/**
 * Endpoint to get CSRF token
 */
export declare function getCSRFToken(req: Request, res: Response): void;
export {};
//# sourceMappingURL=csrf.d.ts.map