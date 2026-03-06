/**
 * Module Permissions Middleware
 * Enforces granular module-level permissions configured by Super Admin
 */
import { Request, Response, NextFunction } from 'express';
export interface ModulePermissionCheck {
    module: string;
    action: 'view' | 'add' | 'modify';
}
/**
 * Middleware to check if user has permission for a specific module and action
 * Usage: checkModulePermission({ module: 'LEAVE', action: 'add' })
 */
export declare const checkModulePermission: (check: ModulePermissionCheck) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Helper function to check multiple permissions (OR logic)
 * User needs at least one of the provided permissions
 */
export declare const checkAnyModulePermission: (checks: ModulePermissionCheck[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to get user's permissions for response headers
 * Useful for frontend to know what actions are available
 */
export declare const attachUserPermissions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permissions.d.ts.map