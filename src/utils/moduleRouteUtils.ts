/**
 * Shared module → route prefix mapping.
 * Used by ModulePermissionsContext (sidebar/layout guard) and ProtectedRoute.
 */

export const MODULE_ROUTE_PREFIXES: Record<string, string[]> = {
  RMG: [
    '/rmg/',
    '/rmg',
    '/utilization',
  ],
  HELPDESK: [
    '/helpdesk',
    '/itadmin/',
    '/facilitiesadmin/',
    '/financeadmin/',
  ],
  LEAVE: [
    '/leave',
  ],
  HR: [
    '/hr/',
    '/employees',
    '/payroll-management',
    '/performance-management',
    '/new-announcement',
    '/admin-announcements',
  ],
};

/** Returns the module key for a given pathname, or null if it doesn't belong to any module. */
export function getModuleForPath(path: string): string | null {
  for (const [module, prefixes] of Object.entries(MODULE_ROUTE_PREFIXES)) {
    if (prefixes.some((prefix) => path === prefix || path.startsWith(prefix))) {
      return module;
    }
  }
  return null;
}

/** localStorage key used to cache the current user's module permissions. */
export const MODULE_PERMS_STORAGE_KEY = 'modulePermissions';
