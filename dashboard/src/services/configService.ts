import apiClient from './api';

export interface ConfigMaster {
  _id?: string;
  type: 'revenue-type' | 'client-type' | 'lead-source' | 'billing-type' | 'project-currency';
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateConfigData {
  name: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateConfigData {
  name: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}

export const configService = {
  // Get all config items by type
  getByType: async (
    type: string,
    params?: {
      status?: string;
      activeOnly?: boolean;
    }
  ): Promise<ConfigMaster[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.activeOnly) queryParams.append('activeOnly', 'true');

    const response = await apiClient.get<{ success: boolean; data: ConfigMaster[] }>(
      `/config/${type}${queryParams.toString() ? `?${queryParams}` : ''}`
    );
    return response.data.data;
  },

  // Get active items only by type (for dropdowns)
  getActiveByType: async (type: string): Promise<ConfigMaster[]> => {
    const response = await apiClient.get<{ success: boolean; data: ConfigMaster[] }>(
      `/config/${type}?activeOnly=true`
    );
    return response.data.data;
  },

  // Get single config item
  getById: async (type: string, id: string): Promise<ConfigMaster> => {
    const response = await apiClient.get<{ success: boolean; data: ConfigMaster }>(
      `/config/${type}/${id}`
    );
    return response.data.data;
  },

  // Create new config item
  create: async (type: string, data: CreateConfigData): Promise<ConfigMaster> => {
    const response = await apiClient.post<{ success: boolean; data: ConfigMaster }>(
      `/config/${type}`,
      data
    );
    return response.data.data;
  },

  // Update config item
  update: async (type: string, id: string, data: UpdateConfigData): Promise<ConfigMaster> => {
    const response = await apiClient.put<{ success: boolean; data: ConfigMaster }>(
      `/config/${type}/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete config item
  delete: async (type: string, id: string): Promise<void> => {
    await apiClient.delete(`/config/${type}/${id}`);
  },

  // Bulk update status
  bulkUpdateStatus: async (type: string, ids: string[], status: 'Active' | 'Inactive'): Promise<void> => {
    await apiClient.patch(`/config/${type}/bulk-status`, { ids, status });
  }
};

// Helper function to get config type label
export const getConfigTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'revenue-type': 'Revenue Type',
    'client-type': 'Client Type',
    'lead-source': 'Lead Source',
    'billing-type': 'Billing Type',
    'project-currency': 'Project Currency'
  };
  return labels[type] || type;
};

// List of all config types
export const CONFIG_TYPES = [
  { value: 'revenue-type', label: 'Revenue Type' },
  { value: 'client-type', label: 'Client Type' },
  { value: 'lead-source', label: 'Lead Source' },
  { value: 'billing-type', label: 'Billing Type' },
  { value: 'project-currency', label: 'Project Currency' }
] as const;
