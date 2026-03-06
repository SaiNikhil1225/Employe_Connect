export type ShiftType = 'General' | 'USA' | 'UK' | 'MiddleEast';

export interface Shift {
  name: ShiftType;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  workingHours: number;
  graceMinutes: number;
}

export interface AttendanceLog {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakDuration: number;
  effectiveHours: number;
  grossHours: number;
  status: 'present' | 'absent' | 'wfh' | 'leave' | 'weekly-off' | 'late' | 'half-day';
  isLate: boolean;
  isEarlyLogout: boolean;
  lateMinutes: number;
  hasTimeEntry: boolean;
  workLocation: 'office' | 'wfh' | 'hybrid';
  regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  regularizationRequestId?: string;
  remarks?: string;
  ipAddress?: string;
  shift?: ShiftType;
  shiftTiming?: string;
  approvedBy?: string;
  canRegularize?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegularizationRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  requestType: 'late-arrival' | 'early-departure' | 'missing-punch' | 'wfh-conversion';
  reason: string;
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WFHRequest {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendancePolicy {
  _id: string;
  policyName: string;
  workingHoursPerDay: number;
  standardCheckIn: string;
  standardCheckOut: string;
  graceMinutes: number;
  weeklyOffDays: string[];
  breakDuration: number;
  isActive: boolean;
  applicableTo: string[];
  description?: string;
}

// Enhanced KPIs for Employee View
export interface EmployeeAttendanceKPIs {
  attendanceRate: number;          // (Total Days Present ÷ Total Working Days) × 100
  punctualityRate: number;          // (On-Time Check-ins ÷ Total Working Days) × 100
  lateArrivalFrequency: number;     // Count of late instances
  earlyLogoutFrequency: number;     // Count of early logout instances
  totalRequests: number;            // Total regularization + WFH requests
  totalWorkingDays: number;
  totalDaysPresent: number;
  onTimeCheckIns: number;
}

// Enhanced KPIs for Manager/HR View
export interface ManagerAttendanceKPIs {
  totalEmployees: number;           // Count of team employees
  totalWorkingDays: number;         // Working days within selected filter
  lateArrivalPercentage: number;    // (Total Late Instances ÷ Team Working Days) × 100
  earlyLogoutPercentage: number;    // (Total Early Logout Instances ÷ Team Working Days) × 100
  totalRequests: number;            // Total regularization + WFH requests for team
  avgAttendanceRate: number;        // Average attendance rate across team
  presentToday: number;
  absentToday: number;
  wfhToday: number;
}

export interface AttendanceStats {
  me: {
    avgHoursPerDay: number;
    onTimeArrivalPercentage: number;
    totalDays: number;
    presentDays: number;
    lateDays: number;
  };
  myTeam?: {
    avgHoursPerDay: number;
    onTimeArrivalPercentage: number;
    totalEmployees: number;
    presentToday: number;
  };
}

export interface AdminAttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  wfhToday: number;
  lateArrivals: number;
  lateArrivalPercentage: number;
}

export interface DailyTimings {
  date: string;
  dayOfWeek: string;
  checkIn: string | null;
  checkOut: string | null;
  totalHours: string;
  breakDuration: string;
  workingHours: string;
  progress: {
    total: number;
    worked: number;
    break: number;
    remaining: number;
  };
}
