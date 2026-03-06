import { Request, Response, NextFunction, RequestHandler } from 'express';
/**
 * Centralized error handler for consistent error responses
 */
export declare class ApiError extends Error {
    statusCode: number;
    code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
/**
 * Format error response with appropriate details
 */
export declare function handleError(res: Response, error: unknown, defaultMessage: string): void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler;
//# sourceMappingURL=errorHandler.d.ts.map