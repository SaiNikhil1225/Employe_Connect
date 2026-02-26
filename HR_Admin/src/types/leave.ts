export type LeaveType =
  | 'Casual Leave'
  | 'Earned Leave'
  | 'Sick Leave'
  | 'Compensatory Off'
  | 'Maternity Leave'
  | 'Paternity Leave'
  | 'Bereavement Leave'
  | 'Marriage Leave'
  | 'Loss of Pay'
  | 'Annual Leave'
  // Legacy support
  | 'Sabbatical Leave'
  | 'Comp Off'
  | 'Unpaid Leave';

export type LeavePlan = 'Probation' | 'Acuvate' | 'Confirmation' | 'Consultant' | 'UK';

export type LeaveReason = 'Personal' | 'Medical' | 'Family';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveAttachment {
  fileName: string;
  url: string;
  type: 'medical' | 'birth_certificate' | 'justification';
  uploadedAt: string;
}

export interface LeaveTypeBalance {
  type: LeaveType;
  allocated: number;
  accrued: number;
  used: number;
  pending: number;
  available: number;
  carriedForward: number;
  carryForwardExpiry: string | null;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  leavePlan: LeavePlan;
  leaveTypes: LeaveTypeBalance[];
  lastUpdated: string;
  lastAccrualDate: string | null;
}

export interface LeaveRequest {
  _id?: string;
  id: string;
  oderId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  employeeId?: string;
  employeeName?: string;
  leavePlan?: LeavePlan;
  leaveType: LeaveType;
  leaveReason?: LeaveReason;
  startDate: string;
  endDate: string;
  days: number;
  isHalfDay?: boolean;
  halfDayType?: 'first_half' | 'second_half' | null;
  durationType?: 'full-day' | 'half-day-first' | 'half-day-second';
  status: LeaveStatus;
  createdAt: string;
  expiresAt: string | null;
  attachments: LeaveAttachment[];
  justification: string;
  managerId: string;
  managerName?: string;
  hrNotified: boolean;
  notes: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notifyPeople?: Array<{ id: string; name: string; email: string }>;
}

export interface LeaveFormData {
  leaveType: LeaveType;
  leaveReason?: LeaveReason;
  startDate: string;
  endDate: string;
  justification: string;
  attachments?: File[];
  isHalfDay?: boolean;
  halfDayType?: 'first_half' | 'second_half' | null;
  durationType?: 'full-day' | 'half-day-first' | 'half-day-second';
  notifyPeople?: Array<{ id: string; name: string; email: string }>;
}

export interface LeaveValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Leave plan badge colors
export const LEAVE_PLAN_COLORS: Record<LeavePlan, string> = {
  'Probation': 'bg-orange-100 text-orange-700 border-orange-200',
  'Acuvate': 'bg-blue-100 text-blue-700 border-blue-200',
  'UK': 'bg-purple-100 text-purple-700 border-purple-200',
  'Consultant': 'bg-gray-100 text-gray-700 border-gray-200',
  'Confirmation': 'bg-yellow-100 text-yellow-700 border-yellow-200'
};

// Leave type icons
export const LEAVE_TYPE_ICONS: Record<string, string> = {
  'Casual Leave': 'Palmtree',
  'Earned Leave': 'Plane',
  'Sick Leave': 'Heart',
  'Compensatory Off': 'Award',
  'Maternity Leave': 'Baby',
  'Paternity Leave': 'Briefcase',
  'Bereavement Leave': 'AlertCircle',
  'Marriage Leave': 'Sparkles',
  'Loss of Pay': 'Circle',
  'Annual Leave': 'Calendar'
};

// Leave Plan Configuration Types
export interface LeaveTypeConfig {
  _id?: string;
  type: LeaveType;
  annualAllocation: number;
  accrualType: 'monthly' | 'annual' | 'quarterly' | 'on-demand';
  accrualRate: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  carryForwardExpiry: string | null;
  encashmentAllowed: boolean;
  maxEncashment: number;
  noticePeriodDays: number;
  maxConsecutiveDays: number;
  requiresMedicalCertificate: boolean;
  paidLeave: boolean;
}

export interface LeavePlanConfig {
  _id?: string;
  planName: LeavePlan;
  description: string;
  eligibility: string;
  leaveTypes: LeaveTypeConfig[];
  isActive: boolean;
  employeeCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeWithBalance {
  _id?: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  leavePlan: LeavePlan;
  leaveBalance: LeaveBalance | null;
}

export interface LeaveBalanceAdjustment {
  _id?: string;
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  adjustmentType: 'Add' | 'Deduct' | 'Allocate' | 'Reset' | 'Carry Forward';
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
  balanceBefore: {
    allocated: number;
    accrued: number;
    used: number;
    pending: number;
    available: number;
  };
  balanceAfter: {
    allocated: number;
    accrued: number;
    used: number;
    pending: number;
    available: number;
  };
  effectiveDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AllocateLeaveRequest {
  employeeId: string;
  year?: number;
  leaveType: LeaveType;
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
}

export interface AdjustLeaveRequest {
  employeeId: string;
  year?: number;
  leaveType: LeaveType;
  adjustmentType: 'Add' | 'Deduct';
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
}

export interface BulkAllocateRequest {
  employeeIds: string[];
  year?: number;
  leaveType: LeaveType;
  days: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
}
