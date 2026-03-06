import apiClient from './api';

export interface AttendanceStats {
  offToday: number;
  notInYet: number;
  onTime: number;
  lateArrivals: number;
  wfhOnDuty: number;
  remoteClockIns: number;
}

export interface AttendanceStatus {
  employeeId: string;
  status: string;
  date?: string;
}

export interface MonthlyAttendance {
  employeeId: string;
  name: string;
  month: number;
  year: number;
  days: Record<string, string>;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave' | 'Holiday' | 'Weekend';
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  notes?: string;
}

export const attendanceService = {
  async getStats() {
    const response = await apiClient.get('/attendance/stats');
    return response.data.data as AttendanceStats;
  },

  async getStatus() {
    const response = await apiClient.get('/attendance/status');
    return response.data.data as Record<string, string>;
  },

  async getMonthlyData(month: number, year: number) {
    const response = await apiClient.get(`/attendance/${month}/${year}`);
    return response.data.data as MonthlyAttendance[];
  },

  async markAttendance(data: {
    employeeId: string;
    date: string;
    status: string;
  }) {
    const response = await apiClient.post('/attendance', data);
    return response.data.data;
  },

  async getAttendanceByDate(date: string) {
    const response = await apiClient.get('/attendance', {
      params: { startDate: date, endDate: date }
    });
    return response.data.data as AttendanceRecord[];
  },

  async getAttendanceByEmployeeAndDate(employeeId: string, date: string) {
    const response = await apiClient.get('/attendance', {
      params: { employeeId, startDate: date, endDate: date }
    });
    return response.data.data as AttendanceRecord[];
  }
};
