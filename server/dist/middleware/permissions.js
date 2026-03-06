"use strict";
/**
 * Module Permissions Middleware
 * Enforces granular module-level permissions configured by Super Admin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserPermissions = exports.checkAnyModulePermission = exports.checkModulePermission = void 0;
const ModulePermission_1 = require("../models/ModulePermission");
/**
 * Middleware to check if user has permission for a specific module and action
 * Usage: checkModulePermission({ module: 'LEAVE', action: 'add' })
 */
const checkModulePermission = (check) => {
    return async (req, res, next) => {
        try {
            const employeeId = req.user?.employeeId;
            const userRole = req.user?.role;
            if (!employeeId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User not authenticated'
                });
            }
            // Allow all authenticated users to access LEAVE module
            // Leave is a universal employee feature - every user can view/apply for their own leaves
            if (check.module.toUpperCase() === 'LEAVE') {
                console.log(`✅ ${userRole} role - allowing LEAVE module access (universal)`);
                return next();
            }
            // Check if user has permission for this module
            const permission = await ModulePermission_1.ModulePermission.findOne({
                employeeId,
                module: check.module.toUpperCase(),
                enabled: true
            });
            console.log('🔍 Permission Check:', {
                employeeId,
                userRole,
                module: check.module,
                action: check.action,
                permissionFound: !!permission,
                permissions: permission?.permissions
            });
            // If no permission record exists, allow by default (backward compatibility)
            if (!permission) {
                console.log('✅ No permission record - allowing by default');
                return next();
            }
            // Check specific action permission
            const hasPermission = permission.permissions[check.action];
            console.log('🔑 Permission result:', { action: check.action, hasPermission });
            if (!hasPermission) {
                console.log('❌ Permission denied');
                return res.status(403).json({
                    success: false,
                    message: `You do not have permission to ${check.action} in ${check.module} module`
                });
            }
            console.log('✅ Permission granted');
            next();
        }
        catch (error) {
            console.error('Error checking module permission:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};
exports.checkModulePermission = checkModulePermission;
/**
 * Helper function to check multiple permissions (OR logic)
 * User needs at least one of the provided permissions
 */
const checkAnyModulePermission = (checks) => {
    return async (req, res, next) => {
        try {
            const employeeId = req.user?.employeeId;
            if (!employeeId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized - User not authenticated'
                });
            }
            // Get all permissions for this user
            const permissions = await ModulePermission_1.ModulePermission.find({
                employeeId,
                enabled: true
            });
            // If no permissions exist, allow by default
            if (permissions.length === 0) {
                return next();
            }
            // Check if user has any of the required permissions
            for (const check of checks) {
                const permission = permissions.find(p => p.module === check.module.toUpperCase());
                if (permission && permission.permissions[check.action]) {
                    return next();
                }
            }
            return res.status(403).json({
                success: false,
                message: 'You do not have the required permissions for this action'
            });
        }
        catch (error) {
            console.error('Error checking module permissions:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions'
            });
        }
    };
};
exports.checkAnyModulePermission = checkAnyModulePermission;
/**
 * Middleware to get user's permissions for response headers
 * Useful for frontend to know what actions are available
 */
const attachUserPermissions = async (req, res, next) => {
    try {
        const employeeId = req.user?.employeeId;
        if (employeeId) {
            const permissions = await ModulePermission_1.ModulePermission.find({
                employeeId,
                enabled: true
            }).select('module permissions');
            // Attach to response locals for potential use in routes
            res.locals.userPermissions = permissions;
            // Add to response header
            res.setHeader('X-User-Permissions', JSON.stringify(permissions));
        }
        next();
    }
    catch (error) {
        console.error('Error attaching user permissions:', error);
        next();
    }
};
exports.attachUserPermissions = attachUserPermissions;
//# sourceMappingURL=permissions.js.map