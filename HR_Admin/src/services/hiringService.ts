import apiClient from './api';
import type { 
  HiringRequest, 
  HiringStatistics, 
  HiringFilters, 
  CreateHiringRequestDTO,
  UpdateHiringRequestDTO 
} from '../types/hiring';

const API_BASE = '/hiring';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class HiringService {
  /**
   * Get hiring manager's own requests
   */
  async getMyRequests(filters?: Partial<HiringFilters>): Promise<HiringRequest[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ApiResponse<HiringRequest[]>>(
      `${API_BASE}/requests/my-requests`, 
      { params }
    );
    return response.data.data;
  }

  /**
   * Get all requests (HR only)
   */
  async getAllRequests(filters?: Partial<HiringFilters>): Promise<HiringRequest[]> {
    const params = this.buildQueryParams(filters);
    const response = await apiClient.get<ApiResponse<HiringRequest[]>>(
      `${API_BASE}/requests`, 
      { params }
    );
    return response.data.data;
  }

  /**
   * Get request by ID
   */
  async getRequestById(id: string): Promise<HiringRequest> {
    const response = await apiClient.get<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}`
    );
    return response.data.data;
  }

  /**
   * Create new hiring request
   */
  async createRequest(data: CreateHiringRequestDTO): Promise<HiringRequest> {
    const response = await apiClient.post<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests`, 
      data
    );
    return response.data.data;
  }

  /**
   * Update hiring request
   */
  async updateRequest(id: string, data: UpdateHiringRequestDTO): Promise<HiringRequest> {
    const response = await apiClient.patch<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}`, 
      data
    );
    return response.data.data;
  }

  /**
   * Delete hiring request (draft only)
   */
  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete(`${API_BASE}/requests/${id}`);
  }

  /**
   * Submit request to HR
   */
  async submitRequest(id: string): Promise<HiringRequest> {
    const response = await apiClient.post<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}/submit`
    );
    return response.data.data;
  }

  /**
   * Update request status (HR only)
   */
  async updateStatus(id: string, status: string): Promise<HiringRequest> {
    const response = await apiClient.patch<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}/status`, 
      { status }
    );
    return response.data.data;
  }

  /**
   * Assign recruiter to request (HR only)
   */
  async assignRecruiter(id: string, recruiterId: string): Promise<HiringRequest> {
    const response = await apiClient.patch<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}/assign`, 
      { recruiterId }
    );
    return response.data.data;
  }

  /**
   * Close request (HR only)
   */
  async closeRequest(
    id: string, 
    closureReason: string, 
    closureType: string
  ): Promise<HiringRequest> {
    const response = await apiClient.post<ApiResponse<HiringRequest>>(
      `${API_BASE}/requests/${id}/close`, 
      { closureReason, closureType }
    );
    return response.data.data;
  }

  /**
   * Get hiring statistics (HR only)
   */
  async getStatistics(): Promise<HiringStatistics> {
    const response = await apiClient.get<ApiResponse<HiringStatistics>>(
      `${API_BASE}/statistics`
    );
    return response.data.data;
  }

  /**
   * Build query parameters from filters
   */
  private buildQueryParams(filters?: Partial<HiringFilters>): Record<string, string> {
    if (!filters) return {};

    const params: Record<string, string> = {};

    if (filters.status && filters.status.length > 0) {
      params.status = filters.status.join(',');
    }

    if (filters.department) {
      params.department = filters.department;
    }

    if (filters.employmentType && filters.employmentType.length > 0) {
      params.employmentType = filters.employmentType.join(',');
    }

    if (filters.dateRange?.start) {
      params.startDate = filters.dateRange.start.toISOString();
    }

    if (filters.dateRange?.end) {
      params.endDate = filters.dateRange.end.toISOString();
    }

    if (filters.searchQuery) {
      params.search = filters.searchQuery;
    }

    return params;
  }
}

export default new HiringService();
