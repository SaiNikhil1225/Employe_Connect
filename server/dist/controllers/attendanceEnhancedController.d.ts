import { Request, Response } from 'express';
/**
 * Get enhanced employee KPIs
 * GET /api/attendance/enhanced-stats
 */
export declare const getEnhancedEmployeeStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get enhanced team KPIs (for managers/HR)
 * GET /api/attendance/enhanced-team-stats
 */
export declare const getEnhancedTeamStats: (req: Request, res: Response) => Promise<void>;
/**
 * Get enhanced attendance logs with shift-based validation
 * GET /api/attendance/enhanced-logs
 */
export declare const getEnhancedLogs: (req: Request, res: Response) => Promise<void>;
/**
 * Validate shift-based regularization eligibility
 * POST /api/attendance/validate-regularization
 */
export declare const validateRegularization: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=attendanceEnhancedController.d.ts.map