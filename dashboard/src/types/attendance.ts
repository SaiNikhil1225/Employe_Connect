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
  lateMinutes: number;
  hasTimeEntry: boolean;
  workLocation: 'office' | 'wfh' | 'hybrid';
  regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  regularizationRequestId?: string;
  remarks?: string;
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
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
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
