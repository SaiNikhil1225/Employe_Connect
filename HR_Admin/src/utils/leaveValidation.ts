import type {
  LeaveFormData,
  LeaveValidationResult,
  LeaveBalance,
  LeaveRequest,
} from '@/types/leave';

/**
 * Calculate number of weekdays between two dates (excluding weekends)
 */
export const calculateLeaveDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Get available balance for a specific leave type
 */
const getAvailableBalance = (balance: LeaveBalance, leaveType: string): number => {
  const leaveTypeBalance = balance.leaveTypes?.find(lt => lt.type === leaveType);
  return leaveTypeBalance?.available || 0;
};

/**
 * Validate leave request based on leave type and business rules
 */
export const validateLeaveRequest = (
  formData: LeaveFormData,
  balance: LeaveBalance,
  existingLeaves: LeaveRequest[]
): LeaveValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!formData.startDate || !formData.endDate) {
    errors.push('Start date and end date are required');
    return { isValid: false, errors, warnings };
  }

  if (isPastDate(formData.startDate)) {
    errors.push('Start date cannot be in the past');
  }

  if (new Date(formData.endDate) < new Date(formData.startDate)) {
    errors.push('End date must be after start date');
  }

  const days = calculateLeaveDays(formData.startDate, formData.endDate);

  if (days === 0) {
    errors.push('Leave period must include at least one weekday');
  }

  if (!formData.justification || formData.justification.trim().length < 10) {
    errors.push('Justification must be at least 10 characters');
  }

  // Get available balance for the selected leave type
  const availableBalance = getAvailableBalance(balance, formData.leaveType);

  // Type-specific validation
  switch (formData.leaveType) {
    case 'Earned Leave':
      if (availableBalance < days) {
        errors.push(
          `Insufficient Earned Leave balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
      if (days > 5) {
        warnings.push('Earned Leave requests exceeding 5 days may require additional approval');
      }
      break;

    case 'Sabbatical Leave':
      if (availableBalance < days) {
        errors.push(
          `Insufficient Sabbatical Leave balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
      if (days < 30) {
        errors.push('Sabbatical Leave must be minimum 30 days');
      }
      if (days > 182) {
        errors.push('Sabbatical Leave cannot exceed 182 days (6 months)');
      }
      if (formData.justification.length < 50) {
        errors.push('Sabbatical Leave requires detailed justification (minimum 50 characters)');
      }
      const daysUntilStart = Math.floor(
        (new Date(formData.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilStart < 30) {
        errors.push('Sabbatical Leave must be planned at least 30 days in advance');
      }
      break;

    case 'Comp Off':
      if (availableBalance < days) {
        errors.push(
          `Insufficient Comp Off balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
      if (availableBalance === 0) {
        errors.push('No Comp Off days available. Comp Off must be earned by working on holidays/weekends');
      }
      break;

    case 'Paternity Leave':
      if (availableBalance < days) {
        errors.push(
          `Insufficient Paternity Leave balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
      if (days > 3) {
        errors.push('Paternity Leave cannot exceed 3 days');
      }
      if (!formData.attachments || formData.attachments.length === 0) {
        errors.push('Birth certificate attachment is required for Paternity Leave');
      }
      break;

    case 'Casual Leave':
    case 'Sick Leave':
    case 'Marriage Leave':
    case 'Bereavement Leave':
    case 'Maternity Leave':
    case 'Compensatory Off':
    case 'Annual Leave':
      // Check balance for other leave types
      if (availableBalance < days) {
        errors.push(
          `Insufficient ${formData.leaveType} balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
      break;

    case 'Unpaid Leave':
      // Unpaid leave doesn't require balance check
      warnings.push('This is unpaid leave and will not be compensated');
      break;

    default:
      // For any other leave type, check if balance is sufficient
      if (availableBalance < days) {
        errors.push(
          `Insufficient ${formData.leaveType} balance. Available: ${availableBalance} days, Requested: ${days} days`
        );
      }
  }

  // Check for overlapping leaves
  const hasOverlap = existingLeaves.some((leave) => {
    if (leave.status === 'rejected' || leave.status === 'cancelled') {
      return false;
    }

    const existingStart = new Date(leave.startDate);
    const existingEnd = new Date(leave.endDate);
    const newStart = new Date(formData.startDate);
    const newEnd = new Date(formData.endDate);

    return (
      (newStart >= existingStart && newStart <= existingEnd) ||
      (newEnd >= existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });

  if (hasOverlap) {
    errors.push('Leave dates overlap with an existing leave request');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};
