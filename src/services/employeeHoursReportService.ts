import api from './api';

export interface ReportFilters {
  role: 'EMPLOYEE' | 'MANAGER' | 'RMG';
  employeeId?: string;
  managerId?: string;
  month?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  department?: string;
}

export interface EmployeeHoursData {
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  projectName?: string;
  allocationHours: number;
  actualBillableHours: number;
  actualNonBillableHours: number;
  billableApprovedHours: number;
  nonBillableApprovedHours: number;
  actualHours: number;
  approvedHours: number;
  pendingApprovedHours: number;
  rejectedHours: number;
  revisionRequestedHours: number;
  pendingDetails?: Array<{ date: string; projectName: string; projectId: string; projectManagerName: string }>;
}

export interface ReportSummary {
  totalAllocationHours: number;
  totalActualBillableHours: number;
  totalActualNonBillableHours: number;
  totalBillableApprovedHours: number;
  totalNonBillableApprovedHours: number;
  totalActualHours: number;
  totalApprovedHours: number;
  employeeCount: number;
}

export interface ReportResponse {
  employees: EmployeeHoursData[];
  summary: ReportSummary;
  filters: Partial<ReportFilters>;
}

export interface ProjectOption {
  projectId: string;
  projectName: string;
  projectCode: string;
}

class EmployeeHoursReportService {
  /**
   * Get employee hours report
   */
  async getReport(filters: ReportFilters): Promise<ReportResponse> {
    const params = new URLSearchParams();
    
    // Add all filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`/employee-hours-reports?${params.toString()}`);
    return response.data;
  }

  /**
   * Get available projects based on role
   */
  async getProjects(role: string, managerId?: string): Promise<ProjectOption[]> {
    const params = new URLSearchParams({ role });
    if (managerId) {
      params.append('managerId', managerId);
    }

    const response = await api.get(`/employee-hours-reports/projects?${params.toString()}`);
    return response.data;
  }

  /**
   * Get all departments (RMG only)
   */
  async getDepartments(): Promise<string[]> {
    const response = await api.get('/employee-hours-reports/departments');
    return response.data;
  }
}

export const employeeHoursReportService = new EmployeeHoursReportService();
