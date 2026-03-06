import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/services/api';
import { toast } from 'sonner';
import type { 
  AttendanceLog, 
  AttendanceStats, 
  AdminAttendanceStats,
  DailyTimings,
  RegularizationRequest,
  WFHRequest,
  AttendancePolicy
} from '../types/attendance';

const API_BASE = '/attendance';

// Legacy local attendance record (for backward compatibility)
export interface AttendanceRecord {
  date: string; // YYYY-MM-DD format
  checkIn: string | null; // HH:MM AM/PM format
  checkOut: string | null; // HH:MM AM/PM format
  effectiveHours: string; // "8h 42m" format
  grossHours: string; // "8h 42m" format
  status: 'Present' | 'WFH' | 'W-Off' | 'Leave' | 'Holiday' | 'Absent';
  userId: string;
  checkInTimestamp?: number;
  checkOutTimestamp?: number;
}

interface AttendanceState {
  // State
  stats: AttendanceStats | null;
  adminStats: AdminAttendanceStats | null;
  dailyTimings: DailyTimings | null;
  logs: AttendanceLog[];
  teamLogs: AttendanceLog[];
  regularizationRequests: RegularizationRequest[];
  wfhRequests: WFHRequest[];
  policy: AttendancePolicy | null;
  loading: boolean;
  lastLogsUpdate: number; // Timestamp to track when logs were last updated
  
  // Legacy local records (for backward compatibility with Dashboard pages)
  records: AttendanceRecord[];
  
  // Employee Actions
  fetchStats: (employeeId?: string, includeTeam?: boolean) => Promise<void>;
  fetchDailyTimings: (employeeId: string, date: string) => Promise<void>;
  fetchLogs: (employeeId?: string, filters?: any) => Promise<void>;
  submitRegularization: (data: Partial<RegularizationRequest>) => Promise<void>;
  submitWFHRequest: (data: { date: string; reason: string }) => Promise<void>;
  webClockIn: (employeeId?: string) => Promise<void>;
  webClockOut: (employeeId?: string) => Promise<void>;
  fetchRegularizationRequests: (status?: string) => Promise<void>;
  fetchWFHRequests: (status?: string) => Promise<void>;
  
  // Admin Actions
  fetchAdminStats: (filters?: any) => Promise<void>;
  fetchTeamLogs: (filters?: any) => Promise<void>;
  approveRegularization: (id: string) => Promise<void>;
  rejectRegularization: (id: string, reason: string) => Promise<void>;
  approveWFHRequest: (id: string) => Promise<void>;
  rejectWFHRequest: (id: string, reason: string) => Promise<void>;
  bulkApprove: (requestIds: string[], requestType: 'regularization' | 'wfh') => Promise<void>;
  bulkReject: (requestIds: string[], requestType: 'regularization' | 'wfh', reason: string) => Promise<void>;
  addManualEntry: (data: any) => Promise<void>;
  exportData: (filters?: any) => Promise<void>;
  
  // Utility Actions
  fetchPolicy: () => Promise<void>;
  
  // Legacy local methods (for backward compatibility)
  checkIn: (userId: string) => void;
  checkOut: (userId: string) => void;
  getTodayRecord: (userId: string) => AttendanceRecord | undefined;
  getRecordsByUserId: (userId: string) => AttendanceRecord[];
  updateRecord: (date: string, userId: string, updates: Partial<AttendanceRecord>) => void;
  deleteRecord: (date: string, userId: string) => void;
}

// Helper functions for legacy local methods
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const calculateHoursDiff = (startTimestamp: number, endTimestamp: number): string => {
  const diffMs = endTimestamp - startTimestamp;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      // Initial state
      stats: null,
      adminStats: null,
      dailyTimings: null,
      logs: [],
      teamLogs: [],
      regularizationRequests: [],
      wfhRequests: [],
      policy: null,
      loading: false,
      lastLogsUpdate: 0, // Track last logs update timestamp
      records: [], // Legacy local records

  // Fetch stats
  fetchStats: async (employeeId?: string, includeTeam = false) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (includeTeam) params.append('includeTeam', 'true');
      
      const response = await apiClient.get(`${API_BASE}/stats?${params.toString()}`);
      set({ stats: response.data, loading: false });
    } catch (error: any) {
      set({ loading: false });
      // Only show error toast if it's not an auth error (401/403)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch attendance stats');
      }
      console.error('Error fetching stats:', error);
    }
  },

  // Fetch daily timings
  fetchDailyTimings: async (employeeId: string, date: string) => {
    set({ loading: true });
    try {
      const response = await apiClient.get(`${API_BASE}/timings/${employeeId}/${date}`);
      set({ dailyTimings: response.data, loading: false });
    } catch (error: any) {
      set({ loading: false });
      // Only show error toast if it's not an auth error (401/403)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch timings');
      }
      console.error('Error fetching daily timings:', error);
    }
  },

  // Fetch logs
  fetchLogs: async (employeeId?: string, filters?: any) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`${API_BASE}/logs?${params.toString()}`);
      console.log('[Store fetchLogs] Fetched', response.data.logs?.length || 0, 'attendance logs');
      console.log('[Store fetchLogs] Full response:', JSON.stringify(response.data, null, 2));
      
      // Force a new array reference and update timestamp to trigger re-renders
      const newLogs = response.data.logs || [];
      const timestamp = Date.now();
      
      // Log each log entry for debugging
      console.log('[Store fetchLogs] Detailed logs:');
      newLogs.forEach((log: any, idx: number) => {
        console.log(`  Log ${idx + 1}:`, {
          date: log.date,
          checkInTime: log.checkInTime,
          checkOutTime: log.checkOutTime,
          hasOpenSession: !!log.checkInTime && !log.checkOutTime
        });
      });
      
      set({ 
        logs: [...newLogs], // Create new array reference
        lastLogsUpdate: timestamp,
        loading: false 
      });
      
      console.log('[Store fetchLogs] State updated with', newLogs.length, 'logs at timestamp:', timestamp);
    } catch (error: any) {
      // Don't show error toast for auth errors - handled by interceptors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch attendance logs');
      }
      console.error('[Store fetchLogs] Error:', error);
      set({ logs: [], loading: false });
      throw error;
    }
  },

  // Submit regularization
  submitRegularization: async (data: Partial<RegularizationRequest>) => {
    set({ loading: true });
    try {
      await apiClient.post(`${API_BASE}/regularize`, data);
      toast.success('Regularization request submitted successfully');
      
      await get().fetchRegularizationRequests();
      await get().fetchLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit regularization');
      set({ loading: false });
      throw error;
    }
  },

  // Submit WFH request
  submitWFHRequest: async (data: { date: string; reason: string }) => {
    set({ loading: true });
    try {
      await apiClient.post(`${API_BASE}/wfh-request`, data);
      toast.success('WFH request submitted successfully');
      
      await get().fetchWFHRequests();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit WFH request');
      set({ loading: false });
      throw error;
    }
  },

  // Web clock-in
  webClockIn: async (employeeId?: string) => {
    set({ loading: true });
    try {
      console.log('[Store webClockIn] Starting for employeeId:', employeeId);
      const response = await apiClient.post(`${API_BASE}/clock-in`);
      console.log('[Store webClockIn] API response:', response.data);
      
      // Show session-aware success message
      const sessionInfo = response.data.sessionNumber 
        ? ` - Session #${response.data.sessionNumber}` 
        : '';
      const remainingInfo = response.data.remainingHours 
        ? ` (${parseFloat(response.data.remainingHours).toFixed(1)}h remaining today)` 
        : '';
      toast.success(`Clocked in successfully${sessionInfo}${remainingInfo}`);
      
      // Immediately refresh logs to ensure all pages see the update
      if (employeeId) {
        console.log('[Store webClockIn] Refreshing logs for employeeId:', employeeId);
        await get().fetchLogs(employeeId);
        console.log('[Store webClockIn] Logs refreshed successfully');
      }
      
      await get().fetchStats(undefined, true);
      set({ loading: false });
    } catch (error: any) {
      console.error('[Store webClockIn] Error:', error);
      console.error('[Store webClockIn] Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to clock in';
      toast.error(errorMessage);
      set({ loading: false });
      throw error;
    }
  },

  // Web clock-out
  webClockOut: async (employeeId?: string) => {
    set({ loading: true });
    try {
      console.log('[Store webClockOut] Starting for employeeId:', employeeId);
      const response = await apiClient.post(`${API_BASE}/clock-out`);
      console.log('[Store webClockOut] API response:', response.data);
      
      // Show session-aware success message
      const sessionInfo = response.data.sessionNumber 
        ? ` - Session #${response.data.sessionNumber} completed` 
        : '';
      const hoursInfo = response.data.sessionHours 
        ? ` (${parseFloat(response.data.sessionHours).toFixed(1)}h)` 
        : '';
      const totalInfo = response.data.cumulativeHours 
        ? `. Total today: ${parseFloat(response.data.cumulativeHours).toFixed(1)}h` 
        : '';
      
      let message = `Clocked out successfully${sessionInfo}${hoursInfo}${totalInfo}`;
      
      if (response.data.autoCapped) {
        message = response.data.message || message;
        toast.warning(message, { duration: 5000 });
      } else if (response.data.maxHoursReached) {
        toast.success(`${message} - Daily limit reached! 🎉`, { duration: 4000 });
      } else {
        toast.success(message);
      }
      
      // Immediately refresh logs to ensure all pages see the update
      if (employeeId) {
        console.log('[Store webClockOut] Refreshing logs for employeeId:', employeeId);
        await get().fetchLogs(employeeId);
        console.log('[Store webClockOut] Logs refreshed successfully');
      }
      
      await get().fetchStats(undefined, true);
      set({ loading: false });
    } catch (error: any) {
      console.error('[Store webClockOut] Error:', error);
      console.error('[Store webClockOut] Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clock out';
      toast.error(errorMessage);
      
      // Log detailed error info
      if (error.response?.data?.debug) {
        console.error('[Store webClockOut] Debug info:', error.response.data.debug);
      }
      
      set({ loading: false });
      throw error;
    }
  },

  // Fetch regularization requests
  fetchRegularizationRequests: async (status?: string) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await apiClient.get(`${API_BASE}/regularization-requests?${params.toString()}`);
      set({ regularizationRequests: response.data, loading: false });
    } catch (error: any) {
      // Don't show error toast for auth errors - handled by interceptors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch regularization requests');
      }
      console.error('Error fetching regularization requests:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Fetch WFH requests
  fetchWFHRequests: async (status?: string) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      
      const response = await apiClient.get(`${API_BASE}/wfh-requests?${params.toString()}`);
      set({ wfhRequests: response.data, loading: false });
    } catch (error: any) {
      // Don't show error toast for auth errors - handled by interceptors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch WFH requests');
      }
      console.error('Error fetching WFH requests:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Fetch admin stats
  fetchAdminStats: async (filters?: any) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.designation) params.append('designation', filters.designation);
      
      const response = await apiClient.get(`${API_BASE}/admin/stats?${params.toString()}`);
      set({ adminStats: response.data, loading: false });
    } catch (error: any) {
      // Don't show error toast for auth errors - handled by interceptors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch admin stats');
      }
      console.error('Error fetching admin stats:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Fetch team logs
  fetchTeamLogs: async (filters?: any) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.designation) params.append('designation', filters.designation);
      if (filters?.employeeName) params.append('employeeName', filters.employeeName);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      const response = await apiClient.get(`${API_BASE}/admin/team-logs?${params.toString()}`);
      set({ teamLogs: response.data.logs, loading: false });
    } catch (error: any) {
      // Don't show error toast for auth errors - handled by interceptors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to fetch team logs');
      }
      console.error('Error fetching team logs:', error);
      set({ loading: false });
      throw error;
    }
  },

  // Approve regularization
  approveRegularization: async (id: string) => {
    set({ loading: true });
    try {
      await apiClient.patch(`${API_BASE}/regularization-requests/${id}/approve`);
      toast.success('Regularization approved');
      
      await get().fetchRegularizationRequests();
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve regularization');
      set({ loading: false });
      throw error;
    }
  },

  // Reject regularization
  rejectRegularization: async (id: string, reason: string) => {
    set({ loading: true });
    try {
      await apiClient.patch(`${API_BASE}/regularization-requests/${id}/reject`, { rejectionReason: reason });
      toast.success('Regularization rejected');
      
      await get().fetchRegularizationRequests();
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject regularization');
      set({ loading: false });
      throw error;
    }
  },

  // Approve WFH request
  approveWFHRequest: async (id: string) => {
    set({ loading: true });
    try {
      await apiClient.patch(`${API_BASE}/wfh-requests/${id}/approve`);
      toast.success('WFH request approved');
      
      await get().fetchWFHRequests();
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve WFH request');
      set({ loading: false });
      throw error;
    }
  },

  // Reject WFH request
  rejectWFHRequest: async (id: string, reason: string) => {
    set({ loading: true });
    try {
      await apiClient.patch(`${API_BASE}/wfh-requests/${id}/reject`, { rejectionReason: reason });
      toast.success('WFH request rejected');
      
      await get().fetchWFHRequests();
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject WFH request');
      set({ loading: false });
      throw error;
    }
  },

  // Bulk approve
  bulkApprove: async (requestIds: string[], requestType: 'regularization' | 'wfh') => {
    set({ loading: true });
    try {
      await apiClient.post(`${API_BASE}/bulk-approve`, { requestIds, requestType });
      toast.success(`${requestIds.length} requests approved successfully`);
      
      if (requestType === 'regularization') {
        await get().fetchRegularizationRequests();
      } else {
        await get().fetchWFHRequests();
      }
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve requests');
      set({ loading: false });
      throw error;
    }
  },

  // Bulk reject
  bulkReject: async (requestIds: string[], requestType: 'regularization' | 'wfh', reason: string) => {
    set({ loading: true });
    try {
      await apiClient.post(`${API_BASE}/bulk-reject`, { requestIds, requestType, rejectionReason: reason });
      toast.success(`${requestIds.length} requests rejected successfully`);
      
      if (requestType === 'regularization') {
        await get().fetchRegularizationRequests();
      } else {
        await get().fetchWFHRequests();
      }
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject requests');
      set({ loading: false });
      throw error;
    }
  },

  // Add manual entry
  addManualEntry: async (data: any) => {
    set({ loading: true });
    try {
      await apiClient.post(`${API_BASE}/manual-entry`, data);
      toast.success('Manual entry added successfully');
      
      await get().fetchTeamLogs();
      set({ loading: false });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add manual entry');
      set({ loading: false });
      throw error;
    }
  },

  // Export data
  exportData: async (filters?: any) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (filters?.format) params.append('format', filters.format);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.employeeIds) params.append('employeeIds', filters.employeeIds.join(','));
      
      const response = await apiClient.get(`${API_BASE}/export?${params.toString()}`);
      
      console.log('Export data:', response.data);
      toast.success('Data exported successfully');
      set({ loading: false });
    } catch (error: any) {
      toast.error('Failed to export data');
      set({ loading: false });
      throw error;
    }
  },

  // Fetch policy
  fetchPolicy: async () => {
    try {
      const response = await apiClient.get(`${API_BASE}/policy`);
      set({ policy: response.data });
    } catch (error: any) {
      console.error('Failed to fetch policy:', error);
    }
  },

  // ===== Legacy Local Methods (for backward compatibility with Dashboard pages) =====
  
  checkIn: (userId: string) => {
    const today = getTodayDateString();
    const existingRecord = get().records.find(
      r => r.date === today && r.userId === userId
    );

    // If already checked in and not checked out, don't allow re-check-in
    if (existingRecord?.checkIn && !existingRecord?.checkOut) {
      return;
    }

    const now = new Date();
    const checkInTime = formatTime(now);
    const checkInTimestamp = now.getTime();

    // If checked out, create a new record for the new check-in session
    if (existingRecord?.checkOut) {
      const newRecord: AttendanceRecord = {
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        effectiveHours: '0h 0m',
        grossHours: '0h 0m',
        status: 'Present',
        userId,
        checkInTimestamp,
      };
      set(state => ({ records: [...state.records, newRecord] }));
    } else if (existingRecord) {
      // Update existing record if no check-in yet
      set(state => ({
        records: state.records.map(r =>
          r.date === today && r.userId === userId
            ? { ...r, checkIn: checkInTime, checkInTimestamp, status: 'Present' }
            : r
        )
      }));
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        effectiveHours: '0h 0m',
        grossHours: '0h 0m',
        status: 'Present',
        userId,
        checkInTimestamp,
      };
      set(state => ({ records: [...state.records, newRecord] }));
    }
  },

  checkOut: (userId: string) => {
    const today = getTodayDateString();
    // Find the most recent record for today that doesn't have a checkout
    const todayRecords = get().records.filter(
      r => r.date === today && r.userId === userId
    );
    const record = todayRecords
      .sort((a, b) => (b.checkInTimestamp || 0) - (a.checkInTimestamp || 0))
      .find(r => r.checkIn && !r.checkOut);

    if (!record) {
      return;
    }

    const now = new Date();
    const checkOutTime = formatTime(now);
    const checkOutTimestamp = now.getTime();
    
    const effectiveHours = calculateHoursDiff(
      record.checkInTimestamp!,
      checkOutTimestamp
    );

    set(state => ({
      records: state.records.map(r =>
        r.date === today && r.userId === userId && r.checkInTimestamp === record.checkInTimestamp
          ? {
              ...r,
              checkOut: checkOutTime,
              checkOutTimestamp,
              effectiveHours,
              grossHours: effectiveHours,
            }
          : r
      )
    }));
  },

  getTodayRecord: (userId: string) => {
    const today = getTodayDateString();
    // Get the most recent record for today (in case of multiple check-ins)
    const todayRecords = get().records
      .filter(r => r.date === today && r.userId === userId)
      .sort((a, b) => (b.checkInTimestamp || 0) - (a.checkInTimestamp || 0));
    return todayRecords[0];
  },

  getRecordsByUserId: (userId: string) => {
    return get().records
      .filter(r => r.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  updateRecord: (date: string, userId: string, updates: Partial<AttendanceRecord>) => {
    set(state => ({
      records: state.records.map(r =>
        r.date === date && r.userId === userId
          ? { ...r, ...updates }
          : r
      )
    }));
  },

  deleteRecord: (date: string, userId: string) => {
    set(state => ({
      records: state.records.filter(
        r => !(r.date === date && r.userId === userId)
      )
    }));
  }
}),
{
  name: 'attendance-storage',
  partialize: (state) => ({ records: state.records }), // Only persist legacy records
}
)
);
