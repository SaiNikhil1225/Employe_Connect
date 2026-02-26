import apiClient from './api';
import type { 
  LeaveRequest, 
  LeaveBalance, 
  LeavePlanConfig, 
  EmployeeWithBalance,
  LeaveBalanceAdjustment,
  AllocateLeaveRequest,
  AdjustLeaveRequest,
  BulkAllocateRequest
} from '@/types/leave';

export const leaveService = {
  // Get all leaves
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: LeaveRequest[] }>(
      '/leaves'
    );
    return response.data.data;
  },

  // Get leaves by user ID
  getByUserId: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; data: LeaveRequest[] }>(
      `/leaves/user/${userId}`
    );
    return response.data.data;
  },

  // Get pending leaves (for HR/Manager)
  getPending: async () => {
    const response = await apiClient.get<{ success: boolean; data: LeaveRequest[] }>(
      '/leaves/pending'
    );
    return response.data.data;
  },

  // Get leave balance for a user
  getBalance: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; data: LeaveBalance }>(
      `/leaves/balance/${userId}`
    );
    return response.data.data;
  },

  // Create leave request
  create: async (leaveData: Omit<LeaveRequest, '_id' | 'id' | 'status' | 'createdAt' | 'expiresAt' | 'hrNotified'>) => {
    const response = await apiClient.post<{ success: boolean; data: LeaveRequest }>(
      '/leaves',
      leaveData
    );
    return response.data.data;
  },

  // Update leave request
  update: async (id: string, data: Partial<LeaveRequest>) => {
    const response = await apiClient.put<{ success: boolean; data: LeaveRequest }>(
      `/leaves/${id}`,
      data
    );
    return response.data.data;
  },

  // Approve leave
  approve: async (id: string, approvedBy: string) => {
    const response = await apiClient.patch<{ success: boolean; data: LeaveRequest }>(
      `/leaves/${id}/approve`,
      { approvedBy }
    );
    return response.data.data;
  },

  // Reject leave
  reject: async (id: string, rejectedBy: string, rejectionReason: string) => {
    const response = await apiClient.patch<{ success: boolean; data: LeaveRequest }>(
      `/leaves/${id}/reject`,
      { rejectedBy, rejectionReason }
    );
    return response.data.data;
  },

  // Cancel leave
  cancel: async (id: string) => {
    const response = await apiClient.patch<{ success: boolean; data: LeaveRequest }>(
      `/leaves/${id}/cancel`,
      {}
    );
    return response.data.data;
  },

  // Delete leave
  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/leaves/${id}`
    );
    return response.data;
  },
};

export const leavePlanService = {
  // Get all leave plans
  getAllPlans: async () => {
    const response = await apiClient.get<{ success: boolean; data: LeavePlanConfig[] }>(
      '/leave-plans'
    );
    return response.data.data;
  },

  // Get specific leave plan
  getPlan: async (identifier: string) => {
    const response = await apiClient.get<{ success: boolean; data: LeavePlanConfig }>(
      `/leave-plans/${identifier}`
    );
    return response.data.data;
  },

  // Get employees assigned to a leave plan
  getPlanEmployees: async (planName: string) => {
    const response = await apiClient.get<{ success: boolean; data: EmployeeWithBalance[] }>(
      `/leave-plans/${planName}/employees`
    );
    return response.data.data;
  },

  // Create leave plan
  createPlan: async (planData: Partial<LeavePlanConfig>) => {
    const response = await apiClient.post<{ success: boolean; data: LeavePlanConfig }>(
      '/leave-plans',
      planData
    );
    return response.data.data;
  },

  // Update leave plan
  updatePlan: async (id: string, planData: Partial<LeavePlanConfig>) => {
    const response = await apiClient.put<{ success: boolean; data: LeavePlanConfig }>(
      `/leave-plans/${id}`,
      planData
    );
    return response.data.data;
  },

  // Add leave type to plan
  addLeaveType: async (planId: string, leaveTypeData: any) => {
    const response = await apiClient.post<{ success: boolean; data: LeavePlanConfig }>(
      `/leave-plans/${planId}/leave-types`,
      leaveTypeData
    );
    return response.data.data;
  },

  // Update leave type in plan
  updateLeaveType: async (planId: string, leaveTypeId: string, leaveTypeData: any) => {
    const response = await apiClient.put<{ success: boolean; data: LeavePlanConfig }>(
      `/leave-plans/${planId}/leave-types/${leaveTypeId}`,
      leaveTypeData
    );
    return response.data.data;
  },

  // Delete leave type from plan
  deleteLeaveType: async (planId: string, leaveTypeId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: LeavePlanConfig }>(
      `/leave-plans/${planId}/leave-types/${leaveTypeId}`
    );
    return response.data.data;
  },

  // Allocate leave to employee
  allocateLeave: async (data: AllocateLeaveRequest) => {
    const response = await apiClient.post<{ success: boolean; data: LeaveBalance }>(
      '/leave-plans/allocate',
      data
    );
    return response.data.data;
  },

  // Adjust leave balance
  adjustLeave: async (data: AdjustLeaveRequest) => {
    const response = await apiClient.post<{ success: boolean; data: LeaveBalance }>(
      '/leave-plans/adjust',
      data
    );
    return response.data.data;
  },

  // Bulk allocate leave
  bulkAllocate: async (data: BulkAllocateRequest) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(
      '/leave-plans/bulk-allocate',
      data
    );
    return response.data.data;
  },

  // Get adjustment history
  getAdjustments: async (employeeId: string, year?: number) => {
    const params = year ? { year } : {};
    const response = await apiClient.get<{ success: boolean; data: LeaveBalanceAdjustment[] }>(
      `/leave-plans/adjustments/${employeeId}`,
      { params }
    );
    return response.data.data;
  },
};
