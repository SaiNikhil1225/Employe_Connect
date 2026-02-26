/**
 * Experience calculation and formatting utilities for employee management
 */

export interface ExperienceData {
  years: number;
  months: number;
  totalMonths: number;
  formatted: string;
}

export interface ExperienceBreakdown {
  previousExperience: ExperienceData;
  acuvateExperience: ExperienceData;
  totalExperience: ExperienceData;
}

/**
 * Calculate Acuvate experience (time since joining) from date of joining
 */
export function calculateAcuvateExperience(dateOfJoining: string | Date | undefined): ExperienceData {
  if (!dateOfJoining) {
    return {
      years: 0,
      months: 0,
      totalMonths: 0,
      formatted: '0 Months'
    };
  }

  const start = new Date(dateOfJoining);
  const now = new Date();

  // If start date is in future, return 0
  if (start > now) {
    return {
      years: 0,
      months: 0,
      totalMonths: 0,
      formatted: '0 Months'
    };
  }

  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();
  const days = now.getDate() - start.getDate();

  let totalMonths = years * 12 + months;

  // If current day is before start day, subtract 1 month
  if (days < 0) {
    totalMonths -= 1;
  }

  totalMonths = Math.max(0, totalMonths);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
    formatted: formatExperience(Math.floor(totalMonths / 12), totalMonths % 12)
  };
}

/**
 * Format experience as human-readable string
 */
export function formatExperience(years: number, months: number): string {
  if (years === 0 && months === 0) return '0 Months';
  if (years === 0) return `${months} Month${months > 1 ? 's' : ''}`;
  if (months === 0) return `${years} Year${years > 1 ? 's' : ''}`;
  return `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`;
}

/**
 * Convert total months to years and months
 */
export function parseExperience(totalMonths: number): { years: number; months: number } {
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12
  };
}

/**
 * Get experience data from years and months
 */
export function getExperienceData(years: number = 0, months: number = 0): ExperienceData {
  const totalMonths = years * 12 + months;
  return {
    years,
    months,
    totalMonths,
    formatted: formatExperience(years, months)
  };
}

/**
 * Calculate total experience from previous and acuvate experience
 */
export function calculateTotalExperience(
  previousExperience: { years?: number; months?: number } | undefined,
  dateOfJoining: string | Date | undefined
): ExperienceData {
  const previous = getExperienceData(
    previousExperience?.years || 0,
    previousExperience?.months || 0
  );
  const acuvate = calculateAcuvateExperience(dateOfJoining);

  const totalMonths = previous.totalMonths + acuvate.totalMonths;

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    totalMonths,
    formatted: formatExperience(Math.floor(totalMonths / 12), totalMonths % 12)
  };
}

/**
 * Get all experience breakdown for an employee
 */
export function getExperienceBreakdown(
  previousExperience: { years?: number; months?: number } | undefined,
  dateOfJoining: string | Date | undefined
): ExperienceBreakdown {
  const previous = getExperienceData(
    previousExperience?.years || 0,
    previousExperience?.months || 0
  );
  const acuvate = calculateAcuvateExperience(dateOfJoining);
  const total = calculateTotalExperience(previousExperience, dateOfJoining);

  return {
    previousExperience: previous,
    acuvateExperience: acuvate,
    totalExperience: total
  };
}

/**
 * Get experience category label for filtering
 * Used for filter dropdown options
 */
export function getExperienceCategory(totalMonths: number): string {
  if (totalMonths < 6) return '0-6 Months';
  if (totalMonths < 12) return '6-12 Months';
  if (totalMonths < 24) return '1-2 Years';
  if (totalMonths < 36) return '2-3 Years';
  if (totalMonths < 60) return '3-5 Years';
  if (totalMonths < 120) return '5-10 Years';
  return '10+ Years';
}

/**
 * Get all available experience categories for filters
 */
export const EXPERIENCE_CATEGORIES = [
  { label: 'All Experience', value: 'all', minMonths: 0, maxMonths: Infinity },
  { label: '0-6 Months', value: '0-6m', minMonths: 0, maxMonths: 5 },
  { label: '6-12 Months', value: '6-12m', minMonths: 6, maxMonths: 11 },
  { label: '1-2 Years', value: '1-2y', minMonths: 12, maxMonths: 23 },
  { label: '2-3 Years', value: '2-3y', minMonths: 24, maxMonths: 35 },
  { label: '3-5 Years', value: '3-5y', minMonths: 36, maxMonths: 59 },
  { label: '5-10 Years', value: '5-10y', minMonths: 60, maxMonths: 119 },
  { label: '10+ Years', value: '10+y', minMonths: 120, maxMonths: Infinity }
];

/**
 * Filter employees by experience range
 */
export function filterByExperience(
  totalMonths: number,
  category: string
): boolean {
  if (category === 'all') return true;

  const range = EXPERIENCE_CATEGORIES.find(cat => cat.value === category);
  if (!range) return true;

  return totalMonths >= range.minMonths && totalMonths <= range.maxMonths;
}

/**
 * Sort employees by experience
 */
export function sortByExperience<T extends { totalMonths?: number }>(
  employees: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...employees].sort((a, b) => {
    const aMonths = a.totalMonths || 0;
    const bMonths = b.totalMonths || 0;
    return order === 'asc' ? aMonths - bMonths : bMonths - aMonths;
  });
}

/**
 * Format experience for export (Excel/CSV)
 */
export function formatExperienceForExport(years: number, months: number): string {
  return `${years}.${months}`;
}

/**
 * Parse experience from export format
 */
export function parseExperienceFromExport(value: string): { years: number; months: number } {
  const [years, months] = value.split('.').map(Number);
  return {
    years: years || 0,
    months: months || 0
  };
}

/**
 * Validate experience input
 */
export function validateExperience(years: number, months: number): { valid: boolean; error?: string } {
  if (years < 0) {
    return { valid: false, error: 'Years cannot be negative' };
  }
  if (years > 50) {
    return { valid: false, error: 'Years cannot exceed 50' };
  }
  if (months < 0) {
    return { valid: false, error: 'Months cannot be negative' };
  }
  if (months > 11) {
    return { valid: false, error: 'Months must be between 0-11' };
  }
  return { valid: true };
}

/**
 * Generate years options for dropdown (0-50)
 */
export function getYearsOptions(): { label: string; value: number }[] {
  return Array.from({ length: 51 }, (_, i) => ({
    label: i === 0 ? '0 Years' : i === 1 ? '1 Year' : `${i} Years`,
    value: i
  }));
}

/**
 * Generate months options for dropdown (0-11)
 */
export function getMonthsOptions(): { label: string; value: number }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    label: i === 0 ? '0 Months' : i === 1 ? '1 Month' : `${i} Months`,
    value: i
  }));
}
