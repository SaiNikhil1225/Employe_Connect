import apiClient from './api';

export interface LeaveAttendanceKPIs {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  attendanceRate: number;
  leaveUtilizationRate: number;
  lateArrivalsMTD: number;
  overtimeHoursMTD: number;
}

export interface LeaveBreakdown {
  leaveType: string;
  count: number;
  totalDays: number;
  percentage: string;
}

export interface MonthlyTrend {
  month: string;
  present: number;
  absent: number;
  late: number;
  leaves: number;
}

export interface LateArrival {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  notes?: string;
}

export interface LeaveRequestForApproval {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  location: string;
  employmentType: string;
  designation: string;
  leavePlan: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedOn: string;
  approvedBy?: string;
  approvedOn?: string;
  rejectedBy?: string;
  rejectedOn?: string;
  rejectionReason?: string;
}

export interface LeaveBalanceData {
  [leaveType: string]: {
    allocated: number;
    available: number;
    used: number;
    pending: number;
  };
}

export interface LeaveBreakdownItem {
  leaveType: string;
  count: number;
  totalDays: number;
}

export interface EmployeeLeaveAttendanceDetail {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  employmentType: string;
  reportingManager?: string;
  dateOfJoining: string;
  todayStatus: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalLeaveDays: number;
  attendanceRate: number;
  leaveBalance: LeaveBalanceData | null;
  leaveBreakdown: LeaveBreakdownItem[];
}


export const leaveAttendanceOverviewService = {
  // Get KPI statistics
  getKPIs: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<LeaveAttendanceKPIs>(
      `/leave-attendance/kpis?${params.toString()}`
    );
    return response.data;
  },

  // Get leave breakdown by type
  getLeaveBreakdown: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<LeaveBreakdown[]>(
      `/leave-attendance/leave-breakdown?${params.toString()}`
    );
    return response.data;
  },

  // Get monthly attendance and leave trend
  getMonthlyTrend: async (year?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    const response = await apiClient.get<MonthlyTrend[]>(
      `/leave-attendance/monthly-trend?${params.toString()}`
    );
    return response.data;
  },

  // Get late arrival details
  getLateArrivals: async (startDate?: string, endDate?: string, limit = 10) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<LateArrival[]>(
      `/leave-attendance/late-arrivals?${params.toString()}`
    );
    return response.data;
  },

  // Get leave requests (for HR admin approval)
  getLeaveRequests: async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    department?: string;
    location?: string;
    leaveType?: string;
    employmentType?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.leaveType) params.append('leaveType', filters.leaveType);
    if (filters?.employmentType) params.append('employmentType', filters.employmentType);
    
    const response = await apiClient.get<LeaveRequestForApproval[]>(
      `/leave-attendance/leave-requests?${params.toString()}`
    );
    return response.data;
  },

  // Update leave request status (approve/reject)
  updateLeaveStatus: async (
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    remarks?: string
  ) => {
    const response = await apiClient.patch<LeaveRequestForApproval>(
      `/leave-attendance/leave-requests/${id}`,
      { status, rejectionReason, remarks }
    );
    return response.data;
  },

  // Get employee details with leave and attendance data
  getEmployeeDetails: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<EmployeeLeaveAttendanceDetail[]>(
      `/leave-attendance/employee-details?${params.toString()}`
    );
    return response.data;
  },
};
