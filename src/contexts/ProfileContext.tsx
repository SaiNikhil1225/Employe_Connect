import { createContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { type UserRole } from '@/types';
import { toast } from 'sonner';

// Profile types representing different views/modes
interface Profile {
  value: string;
  label: string;
  icon: string;
  description: string;
  badge: string;
  color: string;
}

// Profile definitions for different access modes
const PROFILE_DEFINITIONS: Record<string, Profile> = {
  EMPLOYEE: {
    value: 'EMPLOYEE',
    label: 'Employee',
    icon: '👤',
    description: 'Personal employee view',
    badge: 'Personal',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  HR_USER: {
    value: 'HR_USER',
    label: 'My Workplace',
    icon: '👁️',
    description: 'View-only HR access',
    badge: 'View Only',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  HR_ADMIN: {
    value: 'HR_ADMIN',
    label: 'HR process',
    icon: '⚙️',
    description: 'Full HR administrative access',
    badge: 'Full Access',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  SUPER_ADMIN: {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
    icon: '👑',
    description: 'Complete system control',
    badge: 'Super Admin',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  MANAGER: {
    value: 'MANAGER',
    label: 'Manager',
    icon: '📊',
    description: 'Team management view',
    badge: 'Manager',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  IT_ADMIN: {
    value: 'IT_ADMIN',
    label: 'IT Admin',
    icon: '🔧',
    description: 'IT administrative access',
    badge: 'IT Admin',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  },
  IT_EMPLOYEE: {
    value: 'IT_EMPLOYEE',
    label: 'IT Employee',
    icon: '💻',
    description: 'IT support view',
    badge: 'IT Support',
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  },
  L1_APPROVER: {
    value: 'L1_APPROVER',
    label: 'L1 Approver',
    icon: '✓',
    description: 'Level 1 approval authority',
    badge: 'L1',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  },
  L2_APPROVER: {
    value: 'L2_APPROVER',
    label: 'L2 Approver',
    icon: '✓✓',
    description: 'Level 2 approval authority',
    badge: 'L2',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  },
  L3_APPROVER: {
    value: 'L3_APPROVER',
    label: 'L3 Approver',
    icon: '✓✓✓',
    description: 'Level 3 approval authority',
    badge: 'L3',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  RMG_USER: {
    value: 'RMG_USER',
    label: 'My Workplace',
    icon: '👤',
    description: 'Personal employee view',
    badge: 'Personal',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  RMG_ADMIN: {
    value: 'RMG_ADMIN',
    label: 'RMG Process',
    icon: '📊',
    description: 'Full RMG administrative access',
    badge: 'Full Access',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
  },
};

// Maps a DB module key to the extra profiles to add when that module is admin-granted
const MODULE_EXTRA_PROFILES: Record<string, Profile[]> = {
  RMG: [PROFILE_DEFINITIONS.RMG_USER, PROFILE_DEFINITIONS.RMG_ADMIN],
  HR:  [PROFILE_DEFINITIONS.HR_USER,  PROFILE_DEFINITIONS.HR_ADMIN],
};

// Get available profiles based on user role
function getAvailableProfilesForRole(role: UserRole): Profile[] {
  switch (role) {
    case 'HR':
      return [PROFILE_DEFINITIONS.HR_USER, PROFILE_DEFINITIONS.HR_ADMIN];
    case 'SUPER_ADMIN':
      return [
        PROFILE_DEFINITIONS.EMPLOYEE,
        PROFILE_DEFINITIONS.HR_USER,
        PROFILE_DEFINITIONS.HR_ADMIN,
        PROFILE_DEFINITIONS.SUPER_ADMIN,
      ];
    case 'MANAGER':
      return [PROFILE_DEFINITIONS.MANAGER];
    case 'IT_ADMIN':
      return [PROFILE_DEFINITIONS.IT_ADMIN];
    case 'IT_EMPLOYEE':
      return [PROFILE_DEFINITIONS.IT_EMPLOYEE];
    case 'L1_APPROVER':
      return [PROFILE_DEFINITIONS.L1_APPROVER];
    case 'L2_APPROVER':
      return [PROFILE_DEFINITIONS.L2_APPROVER];
    case 'L3_APPROVER':
      return [PROFILE_DEFINITIONS.L3_APPROVER];
    case 'RMG':
      return [PROFILE_DEFINITIONS.RMG_USER, PROFILE_DEFINITIONS.RMG_ADMIN];
    case 'EMPLOYEE':
    default:
      return [PROFILE_DEFINITIONS.EMPLOYEE];
  }
}

interface ProfileContextType {
  actualRole: UserRole;
  activeProfile: string;
  availableProfiles: Profile[];
  switchProfile: (profile: string) => void;
  permissions: {
    // Employee management
    canViewEmployees: boolean;
    canEditEmployees: boolean;
    canDeleteEmployees: boolean;

    // Leave management
    canViewLeave: boolean;
    canApproveLeave: boolean;
    canAccessLeavePlans: boolean;
    canAllocateLeave: boolean;

    // Announcements
    canViewAnnouncements: boolean;
    canCreateAnnouncements: boolean;
    canEditAnnouncements: boolean;
    canDeleteAnnouncements: boolean;

    // Other HR functions
    canManageAttendance: boolean;
    canProcessPayroll: boolean;
    canManagePerformance: boolean;
    canAccessSettings: boolean;

    // Profile flags
    isHRUser: boolean;
    isHRAdmin: boolean;
    isSuperAdmin: boolean;
  };
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();
  const { adminModules, isLoading: modulePermsLoading } = useModulePermissions();
  const actualRole = (user?.role || 'EMPLOYEE') as UserRole;

  // Initialize from localStorage or fallback to actual role
  const [activeProfile, setActiveProfile] = useState<string>(() => {
    const stored = localStorage.getItem('activeProfile');
    // Only use stored profile if it's available for the current user
    if (stored && getAvailableProfilesForRole(actualRole).some(p => p.value === stored)) {
      return stored;
    }
    // Default to HR_ADMIN for HR users, RMG_ADMIN for RMG users, otherwise use actual role
    if (actualRole === 'HR') return 'HR_ADMIN';
    if (actualRole === 'RMG') return 'RMG_ADMIN';
    return actualRole;
  });

  // Get available profiles based on actual role
  const availableProfiles = useMemo(() => {
    const base = getAvailableProfilesForRole(actualRole);
    if (modulePermsLoading) return base; // wait for permissions to load
    // Inject extra profiles for modules where SuperAdmin granted isAdmin access
    const existingValues = new Set(base.map((p) => p.value));
    const extras: Profile[] = [];
    adminModules.forEach((moduleKey) => {
      const extraProfiles = MODULE_EXTRA_PROFILES[moduleKey] || [];
      extraProfiles.forEach((p) => {
        if (!existingValues.has(p.value)) {
          existingValues.add(p.value);
          extras.push(p);
        }
      });
    });
    // For EMPLOYEE role with assigned modules, show only the assigned module
    // profiles (My Workplace + assigned module) — hide the generic Employee entry.
    if (actualRole === 'EMPLOYEE' && extras.length > 0) {
      return extras;
    }
    return [...base, ...extras];
  }, [actualRole, adminModules, modulePermsLoading]);

  // When permissions finish loading and the stored profile is now valid, apply it.
  // This handles the case where user refreshes and adminModules arrive after init.
  useEffect(() => {
    if (modulePermsLoading) return;
    const stored = localStorage.getItem('activeProfile');
    if (stored && availableProfiles.some((p) => p.value === stored)) {
      setActiveProfile(stored);
    } else {
      // If the current active profile is no longer in the available list
      // (e.g. EMPLOYEE profile removed when modules are assigned), fall back
      // to the first available profile.
      setActiveProfile((current) => {
        if (!availableProfiles.some((p) => p.value === current)) {
          return availableProfiles[0]?.value ?? current;
        }
        return current;
      });
    }
  }, [modulePermsLoading, availableProfiles]);

  // Switch profile handler
  const switchProfile = (profile: string) => {
    if (!availableProfiles.some(p => p.value === profile)) {
      toast.error('You do not have permission to switch to this profile');
      return;
    }

    setActiveProfile(profile);
    localStorage.setItem('activeProfile', profile);
    
    const profileDef = availableProfiles.find(p => p.value === profile);
    if (profileDef) {
      toast.success(`Switched to ${profileDef.label} mode`, {
        description: profileDef.description,
        icon: profileDef.icon,
      });
    }

    // Redirect to dashboard after profile switch to avoid access denied on current page
    // Use window.location for a clean navigation that re-evaluates permissions
    window.location.href = '/dashboard';
  };

  // Calculate permissions based on active profile
  const permissions = useMemo(() => {
    const profile = activeProfile;
    
    return {
      // Employee management
      canViewEmployees: ['HR_USER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canEditEmployees: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canDeleteEmployees: profile === 'SUPER_ADMIN',

      // Leave management
      canViewLeave: ['HR_USER', 'HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(profile),
      canApproveLeave: ['HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(profile),
      canAccessLeavePlans: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canAllocateLeave: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),

      // Announcements
      canViewAnnouncements: true,
      canCreateAnnouncements: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canEditAnnouncements: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canDeleteAnnouncements: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),

      // Other HR functions
      canManageAttendance: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canProcessPayroll: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),
      canManagePerformance: ['HR_ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(profile),
      canAccessSettings: ['HR_ADMIN', 'SUPER_ADMIN'].includes(profile),

      // Profile flags
      isHRUser: profile === 'HR_USER',
      isHRAdmin: profile === 'HR_ADMIN',
      isSuperAdmin: profile === 'SUPER_ADMIN',
    };
  }, [activeProfile]);

  return (
    <ProfileContext.Provider
      value={{
        actualRole,
        activeProfile,
        availableProfiles,
        switchProfile,
        permissions,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Hook moved to src/hooks/useProfile.ts for Vite fast-refresh compatibility.
