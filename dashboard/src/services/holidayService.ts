/**
 * Holiday Calendar Service
 * API service layer for holiday management
 */

import axios from 'axios';
import type {
  Holiday,
  HolidayFormData,
  HolidayFilters,
  HolidaysResponse,
  SingleHolidayResponse,
  Country,
  Region,
  Client,
  Department,
  HolidayType,
  ObservanceType,
  HolidayGroup,
  ConfigListResponse,
  ConfigFormData,
  ApiResponse,
  HolidayStatus
} from '@/types/holiday';
import { HolidayStatus as HolidayStatusEnum } from '@/types/holiday';

const API_BASE = 'http://localhost:5000/api';

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth-token');
};

// Helper to build headers
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// ============================================
//  HOLIDAY CRUD OPERATIONS
// ============================================

/**
 * Get all holidays with filters and pagination
 */
export const getHolidays = async (filters?: HolidayFilters): Promise<HolidaysResponse> => {
  const params = new URLSearchParams(filters as any);
  const response = await axios.get(`${API_BASE}/holidays?${params}`, {
    headers: getHeaders()
  });
  return response.data;
};

/**
 * Get single holiday by ID
 */
export const getHolidayById = async (id: string): Promise<Holiday> => {
  const response = await axios.get<SingleHolidayResponse>(`${API_BASE}/holidays/${id}`, {
    headers: getHeaders()
  });
  return response.data.data;
};

/**
 * Create new holiday (as DRAFT)
 */
export const createHoliday = async (data: HolidayFormData): Promise<Holiday> => {
  const response = await axios.post<SingleHolidayResponse>(
    `${API_BASE}/holidays`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data;
};

/**
 * Update existing holiday
 */
export const updateHoliday = async (id: string, data: Partial<HolidayFormData>): Promise<Holiday> => {
  const response = await axios.put<SingleHolidayResponse>(
    `${API_BASE}/holidays/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data;
};

/**
 * Publish a draft holiday
 */
export const publishHoliday = async (id: string): Promise<Holiday> => {
  const response = await axios.post<SingleHolidayResponse>(
    `${API_BASE}/holidays/${id}/publish`,
    {},
    { headers: getHeaders() }
  );
  return response.data.data;
};

/**
 * Delete holiday (soft delete)
 */
export const deleteHoliday = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/${id}`, {
    headers: getHeaders()
  });
};

/**
 * Get holidays visible to employee
 */
export const getEmployeeVisibleHolidays = async (params: {
  countryId?: string;
  regionId?: string;
  clientId?: string;
  year?: number;
}): Promise<Holiday[]> => {
  const urlParams = new URLSearchParams(params as any);
  const response = await axios.get(`${API_BASE}/holidays/employee/visible?${urlParams}`, {
    headers: getHeaders()
  });
  return response.data.data;
};

// ============================================
//  CONFIGURATION ENDPOINTS
// ============================================

// Country APIs
export const getCountries = async (): Promise<Country[]> => {
  const response = await axios.get<ConfigListResponse<Country>>(
    `${API_BASE}/holidays/config/countries`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createCountry = async (data: ConfigFormData): Promise<Country> => {
  const response = await axios.post<ApiResponse<Country>>(
    `${API_BASE}/holidays/config/countries`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

export const updateCountry = async (id: string, data: Partial<ConfigFormData>): Promise<Country> => {
  const response = await axios.put<ApiResponse<Country>>(
    `${API_BASE}/holidays/config/countries/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// Region APIs
export const getRegions = async (countryId?: string): Promise<Region[]> => {
  const params = countryId ? `?countryId=${countryId}` : '';
  const response = await axios.get<ConfigListResponse<Region>>(
    `${API_BASE}/holidays/config/regions${params}`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createRegion = async (data: ConfigFormData & { countryId?: string }): Promise<Region> => {
  const response = await axios.post<ApiResponse<Region>>(
    `${API_BASE}/holidays/config/regions`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

export const updateRegion = async (id: string, data: Partial<ConfigFormData>): Promise<Region> => {
  const response = await axios.put<ApiResponse<Region>>(
    `${API_BASE}/holidays/config/regions/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// Client APIs
export const getClients = async (regionId?: string, countryId?: string): Promise<Client[]> => {
  let params = '';
  if (regionId) params += `?regionId=${regionId}`;
  if (countryId) params += `${params ? '&' : '?'}countryId=${countryId}`;

  const response = await axios.get<ConfigListResponse<Client>>(
    `${API_BASE}/holidays/config/clients${params}`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createClient = async (data: Omit<Client, '_id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<Client> => {
  const response = await axios.post<ApiResponse<Client>>(
    `${API_BASE}/holidays/config/clients`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

export const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
  const response = await axios.put<ApiResponse<Client>>(
    `${API_BASE}/holidays/config/clients/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// Department APIs
export const getDepartments = async (): Promise<Department[]> => {
  const response = await axios.get<ConfigListResponse<Department>>(
    `${API_BASE}/holidays/config/departments`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createDepartment = async (data: ConfigFormData & { code: string }): Promise<Department> => {
  const response = await axios.post<ApiResponse<Department>>(
    `${API_BASE}/holidays/config/departments`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// Holiday Type APIs
export const getHolidayTypes = async (): Promise<HolidayType[]> => {
  const response = await axios.get<ConfigListResponse<HolidayType>>(
    `${API_BASE}/holidays/config/holiday-types`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createHolidayType = async (data: ConfigFormData): Promise<HolidayType> => {
  const response = await axios.post<ApiResponse<HolidayType>>(
    `${API_BASE}/holidays/config/holiday-types`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};
export const updateHolidayType = async (id: string, data: Partial<ConfigFormData>): Promise<HolidayType> => {
  const response = await axios.put<ApiResponse<HolidayType>>(
    `${API_BASE}/holidays/config/types/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};
// Observance Type APIs
export const getObservanceTypes = async (): Promise<ObservanceType[]> => {
  const response = await axios.get<ConfigListResponse<ObservanceType>>(
    `${API_BASE}/holidays/config/observance-types`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createObservanceType = async (data: ConfigFormData): Promise<ObservanceType> => {
  const response = await axios.post<ApiResponse<ObservanceType>>(
    `${API_BASE}/holidays/config/observance-types`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// Holiday Group APIs
export const getHolidayGroups = async (): Promise<HolidayGroup[]> => {
  const response = await axios.get<ConfigListResponse<HolidayGroup>>(
    `${API_BASE}/holidays/config/holiday-groups`,
    { headers: getHeaders() }
  );
  return response.data.data;
};

export const createHolidayGroup = async (data: Partial<HolidayGroup>): Promise<HolidayGroup> => {
  const response = await axios.post<ApiResponse<HolidayGroup>>(
    `${API_BASE}/holidays/config/holiday-groups`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};
export const updateHolidayGroup = async (id: string, data: Partial<HolidayGroup>): Promise<HolidayGroup> => {
  const response = await axios.put<ApiResponse<HolidayGroup>>(
    `${API_BASE}/holidays/config/groups/${id}`,
    data,
    { headers: getHeaders() }
  );
  return response.data.data!;
};

// ============================================
//  DELETE CONFIG ENTITIES
// ============================================

export const deleteCountry = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/config/countries/${id}`, {
    headers: getHeaders()
  });
};

export const deleteRegion = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/config/regions/${id}`, {
    headers: getHeaders()
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/config/clients/${id}`, {
    headers: getHeaders()
  });
};

export const deleteHolidayType = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/config/types/${id}`, {
    headers: getHeaders()
  });
};

export const deleteHolidayGroup = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/holidays/config/groups/${id}`, {
    headers: getHeaders()
  });
};

// ============================================
//  DEFAULT EXPORT FOR LEGACY COMPATIBILITY
// ============================================

/**
 * Bundled service object for stores that expect a single import
 * Legacy compatibility layer
 */
export const holidayService = {
  getAll: async () => {
    // Filter for published holidays only for backward compatibility
    const response = await getHolidays({ status: HolidayStatusEnum.PUBLISHED });
    return response.data.holidays;
  },
  create: createHoliday,
  update: updateHoliday,
  delete: deleteHoliday,
};
