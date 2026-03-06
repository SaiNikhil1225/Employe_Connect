/**
 * ModulePermissionsContext
 *
 * Fetches the current user's module permissions from the backend (set by SuperAdmin),
 * and exposes helpers used by Sidebar (hide nav items) and ProtectedRoute (block access).
 *
 * Rules:
 *   - SUPER_ADMIN → always full access (skip all module checks)
 *   - No permission record for a module → fall back to role-based access (no restriction)
 *   - Permission record with enabled=true  → grant access regardless of role
 *   - Permission record with enabled=false → deny access regardless of role
 */

import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getModuleForPath, MODULE_PERMS_STORAGE_KEY } from '@/utils/moduleRouteUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface UserModulePermission {
  module: string;
  enabled: boolean;
  isAdmin: boolean;
  permissions: { view: boolean; add: boolean; modify: boolean };
}

interface ModulePermissionsContextValue {
  /** Raw list of module permissions for this user */
  modulePermissions: UserModulePermission[];
  /** Modules where enabled=true AND isAdmin=true for the current user */
  adminModules: string[];
  /** True while the first fetch is in progress */
  isLoading: boolean;
  /**
   * Check whether the current user can access a given route path.
   * Returns `true`  → allow (or SUPER_ADMIN, or no module restriction)
   * Returns `false` → deny (module explicitly disabled)
   */
  canAccessPath: (path: string) => boolean;
  /**
   * True if the user has `enabled=true` for the given module key (e.g. 'RMG').
   */
  hasModuleEnabled: (moduleKey: string) => boolean;
  /** Re-fetch permissions (e.g. after SuperAdmin makes a change) */
  refreshPermissions: () => void;
}

// exported so the hook file (src/hooks/useModulePermissions.ts) can call useContext()
// eslint-disable-next-line react-refresh/only-export-components
export const ModulePermissionsContext = createContext<ModulePermissionsContextValue>({
  modulePermissions: [],
  adminModules: [],
  isLoading: false,
  canAccessPath: () => true,
  hasModuleEnabled: () => true,
  refreshPermissions: () => undefined,
});

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────
export const ModulePermissionsProvider = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  const [modulePermissions, setModulePermissions] = useState<UserModulePermission[]>([]);
  // Start as true (pending) so the layout guard waits before blocking access.
  // SUPER_ADMIN and unauthenticated start as false (no fetch needed).
  const [isLoading, setIsLoading] = useState(
    () => !!user?.employeeId && user?.role !== 'SUPER_ADMIN'
  );

  const fetchPermissions = useCallback(async () => {
    if (!user?.employeeId) return;
    // SUPER_ADMIN doesn't need restrictions — skip fetching
    if (user.role === 'SUPER_ADMIN') return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(
        `${API_URL}/employees/my-module-permissions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const perms = data.data || [];
          setModulePermissions(perms);
          // Cache to localStorage so ProtectedRoute can read synchronously
          localStorage.setItem(MODULE_PERMS_STORAGE_KEY, JSON.stringify(perms));
        }
      }
    } catch {
      // Silently fail — role-based access remains in effect
    } finally {
      setIsLoading(false);
    }
  }, [user?.employeeId, user?.role]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // ── canAccessPath ──────────────────────────────────────────────────────────
  const canAccessPath = useCallback(
    (path: string): boolean => {
      // SuperAdmins bypass everything
      if (user?.role === 'SUPER_ADMIN') return true;

      const module = getModuleForPath(path);
      // Path is not in any module → let role-based access decide
      if (!module) return true;

      const record = modulePermissions.find((p) => p.module === module);
      // No record → no explicit restriction → allow (role-based access still applies)
      if (!record) return true;

      // isAdmin=true implies full access even if enabled flag was not set correctly
      if (record.isAdmin) return true;

      // Otherwise respect the enabled flag
      return record.enabled;
    },
    [user?.role, modulePermissions],
  );

  // ── hasModuleEnabled ────────────────────────────────────────────────────────
  const hasModuleEnabled = useCallback(
    (moduleKey: string): boolean => {
      if (user?.role === 'SUPER_ADMIN') return true;
      const record = modulePermissions.find((p) => p.module === moduleKey);
      if (!record) return true; // no record → don't restrict
      return record.enabled;
    },
    [user?.role, modulePermissions],
  );

  // ── adminModules ────────────────────────────────────────────────────────────
  // Modules where SuperAdmin granted isAdmin=true access to this user
  // isAdmin=true implies enabled access regardless of the enabled flag in DB
  const adminModules = user?.role === 'SUPER_ADMIN'
    ? [] // SUPER_ADMIN already has full access via role
    : modulePermissions
        .filter((p) => p.isAdmin) // isAdmin=true is sufficient — implies enabled
        .map((p) => p.module);

  return (
    <ModulePermissionsContext.Provider
      value={{
        modulePermissions,
        adminModules,
        isLoading,
        canAccessPath,
        hasModuleEnabled,
        refreshPermissions: fetchPermissions,
      }}
    >
      {children}
    </ModulePermissionsContext.Provider>
  );
};

// Hook moved to src/hooks/useModulePermissions.ts for Vite fast-refresh compatibility.
