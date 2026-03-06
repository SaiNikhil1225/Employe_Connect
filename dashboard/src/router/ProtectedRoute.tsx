import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from './roleConfig';
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
  
  // Allow access if either the effective role OR the actual role has permission
  // This ensures HR users can access pages when switching profiles
  if (!hasEffectivePermission && !hasActualPermission) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
