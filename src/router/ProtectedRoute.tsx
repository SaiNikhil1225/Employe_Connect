import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEmployeeStore } from '@/store/employeeStore';
import { hasPermission } from './roleConfig';
import { getModuleForPath } from '@/utils/moduleRouteUtils';
import { type UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

// Map activeProfile to UserRole for permission checking
function getEffectiveRoleFromProfile(activeProfile: string, actualRole: UserRole): UserRole {
  switch (activeProfile) {
    case 'HR_USER':
      return 'EMPLOYEE'; // HR User sees employee-level access
    case 'HR_ADMIN':
      return 'HR'; // HR Admin gets full HR access
    case 'RMG_USER':
      return 'EMPLOYEE'; // RMG User sees employee-level access
    case 'RMG_ADMIN':
      return 'RMG'; // RMG Admin gets full RMG access
    case 'SUPER_ADMIN':
      return 'SUPER_ADMIN';
    case 'MANAGER':
      return 'MANAGER';
    case 'IT_ADMIN':
      return 'IT_ADMIN';
    case 'IT_EMPLOYEE':
      return 'IT_EMPLOYEE';
    case 'L1_APPROVER':
      return 'L1_APPROVER';
    case 'L2_APPROVER':
      return 'L2_APPROVER';
    case 'L3_APPROVER':
      return 'L3_APPROVER';
    case 'EMPLOYEE':
      return 'EMPLOYEE';
    default:
      return actualRole; // Use actual role as fallback
  }
}

export function ProtectedRoute({ children, requiredPath }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { employees } = useEmployeeStore();
  
  // Get active profile from localStorage (ProfileProvider stores it there)
  // This avoids the need for the ProfileProvider context in ProtectedRoute
  const storedProfile = localStorage.getItem('activeProfile');
  const activeProfile = storedProfile || user?.role || 'EMPLOYEE';

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Use the effective role based on active profile for permission checks
  const effectiveRole = getEffectiveRoleFromProfile(activeProfile, user.role);
  
  // Check permission with effective role first, then fall back to actual role
  const hasEffectivePermission = hasPermission(effectiveRole, requiredPath);
  const hasActualPermission = hasPermission(user.role, requiredPath);

  // Dynamic manager check: an EMPLOYEE whose employeeId appears as reportingManagerId
  // in any other employee record is treated as a Manager and gets access to manager routes.
  const isManagerRoute = requiredPath.startsWith('/manager/');
  const isDynamicManager =
    isManagerRoute &&
    !!user.employeeId &&
    employees.some((emp) => emp.reportingManagerId === user.employeeId);

  // Module-admin bypass: if SuperAdmin granted isAdmin=true for the module
  // that owns this route, the user gets full access regardless of their role.
  // Strategy: if the role check fails but the path belongs to a known module,
  // defer the /403 decision to ModulePermissionsProvider (inside DashboardLayout),
  // which loads permissions and will grant or deny after fetching from the backend.
  // This avoids timing issues with an empty localStorage cache on first load.
  const moduleForPath = getModuleForPath(requiredPath);

  // Defer to inner module check when: role fails + path belongs to a module
  // (ModulePermissionsProvider will grant access if isAdmin=true, or deny if disabled)
  const deferToModulePermissions =
    !hasEffectivePermission && !hasActualPermission && moduleForPath !== null;

  // Allow access if: effective role has permission OR actual role has permission
  //                  OR dynamic manager OR deferred to module-permission layer
  if (!hasEffectivePermission && !hasActualPermission && !isDynamicManager && !deferToModulePermissions) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
