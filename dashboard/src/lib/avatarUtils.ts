/**
 * Avatar Utilities
 * Handles avatar color generation and initials extraction
 */

import { getInitials as getInitialsFromName } from '@/constants/design-system';

// Predefined color palette (12 colors with good contrast)
export const AVATAR_COLORS = [
  { bg: '#3B82F6', text: '#FFFFFF' }, // Blue
  { bg: '#10B981', text: '#FFFFFF' }, // Green
  { bg: '#8B5CF6', text: '#FFFFFF' }, // Purple
  { bg: '#F59E0B', text: '#FFFFFF' }, // Orange
  { bg: '#EC4899', text: '#FFFFFF' }, // Pink
  { bg: '#14B8A6', text: '#FFFFFF' }, // Teal
  { bg: '#EF4444', text: '#FFFFFF' }, // Red
  { bg: '#6366F1', text: '#FFFFFF' }, // Indigo
  { bg: '#059669', text: '#FFFFFF' }, // Emerald
  { bg: '#D97706', text: '#FFFFFF' }, // Amber
  { bg: '#06B6D4', text: '#FFFFFF' }, // Cyan
  { bg: '#F43F5E', text: '#FFFFFF' }, // Rose
];

/**
 * Generate a consistent hash number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get avatar color based on employee ID (consistent hash-based)
 */
export function getAvatarColor(employeeId: string): { bg: string; text: string } {
  const hash = hashString(employeeId || 'default');
  const index = hash % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Extract initials from name
 * Format: First Name First Letter + Last Name First Letter (or first 2 initials if multiple names)
 * Uses centralized getInitials from design-system for consistency
 */
export function getInitials(firstName?: string, lastName?: string, fullName?: string): string {
  // Build the full name string from available parts
  let nameToUse = '';
  
  if (fullName) {
    // If fullName is provided, use it directly
    nameToUse = fullName.trim();
  } else if (firstName || lastName) {
    // Build from firstName and lastName
    nameToUse = `${firstName || ''} ${lastName || ''}`.trim();
  }
  
  // If we have a name, use the centralized function
  if (nameToUse) {
    return getInitialsFromName(nameToUse);
  }
  
  // Fallback
  return '??';
}

/**
 * Avatar size configurations (in pixels)
 */
export const AVATAR_SIZES = {
  xs: { size: 24, fontSize: 10 },
  sm: { size: 32, fontSize: 12 },
  md: { size: 40, fontSize: 14 },
  lg: { size: 56, fontSize: 20 },
  xl: { size: 80, fontSize: 28 },
  '2xl': { size: 120, fontSize: 40 },
  '3xl': { size: 160, fontSize: 56 },
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

/**
 * Get avatar data for an employee
 */
export interface AvatarData {
  initials: string;
  backgroundColor: string;
  textColor: string;
  hasCustomPicture: boolean;
  pictureUrl?: string;
}

export function getAvatarData(employee: {
  employeeId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profilePhoto?: string;
}): AvatarData {
  const initials = getInitials(employee.firstName, employee.lastName, employee.name);
  const colors = getAvatarColor(employee.employeeId);
  
  return {
    initials,
    backgroundColor: colors.bg,
    textColor: colors.text,
    hasCustomPicture: !!employee.profilePhoto,
    pictureUrl: employee.profilePhoto,
  };
}
