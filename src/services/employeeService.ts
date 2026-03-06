import apiClient from './api';

export interface Employee {
  _id?: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  dateOfJoining: string;
  businessUnit: string;
  profilePhoto?: string;
  reportingManagerId?: string;
  dottedLineManagerId?: string;
  status: 'active' | 'inactive';
  dateOfBirth?: string;
  reportingManager?: {
    employeeId: string;
    name: string;
    designation: string;
  };
  dottedLineManager?: {
    employeeId: string;
    name: string;
    designation: string;
  };
  
  // Step 1: Basic Information (Extended)
  displayName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dialCode?: string;
  mobileNumber?: string;
  gender?: string;
  
  // Step 2: Employment Details (Extended)
  contractEndDate?: string;
  legalEntity?: string;
  subDepartment?: string;
  secondaryJobTitle?: string;
  workerType?: string;
  leavePlan?: string; // Leave Plan: Probation, Acuvate, Confirmation, Consultant, UK
  
  // Step 3: Contact Information
  workPhone?: string;
  residenceNumber?: string;
  personalEmail?: string;
  
  // Step 4: Family & Personal Details
  maritalStatus?: string;
  marriageDate?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  spouseGender?: string;
  physicallyHandicapped?: string;
  bloodGroup?: string;
  nationality?: string;
  
  // Step 5: Provident Fund Details
  pfEstablishmentId?: string;
  pfDetailsAvailable?: string;
  pfNumber?: string;
  pfJoiningDate?: string;
  nameOnPFAccount?: string;
  uan?: string;
  
  // Step 6: ESI & Statutory Details
  esiEligible?: string;
  employerESINumber?: string;
  esiDetailsAvailable?: string;
  esiNumber?: string;
  ptEstablishmentId?: string;
  lwfEligible?: string;
  
  // Step 7: Aadhaar Details
  aadhaarNumber?: string;
  enrollmentNumber?: string;
  dobInAadhaar?: string;
  fullNameAsPerAadhaar?: string;
  addressAsInAadhaar?: string;
  genderAsInAadhaar?: string;
  
  // Step 8: PAN Details
  panCardAvailable?: string;
  panNumber?: string;
  fullNameAsPerPAN?: string;
  dobInPAN?: string;
  parentsNameAsPerPAN?: string;
  
  // Step 9: Bank & Salary Details
  salaryPaymentMode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  nameOnAccount?: string;
  branch?: string;
  
  // Experience Tracking
  previousExperience?: {
    years?: number;
    months?: number;
  };
}

export interface EmployeeFilters {
  department?: string;
  location?: string;
  status?: string;
  businessUnit?: string;
}

export interface TaxIdConfig {
  country: string;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
  pattern?: string;
  maxLength?: number;
}

export interface CompanySettings {
  _id: string;
  legalEntities: string[];
  locations: Array<{
    name: string;
    country: string;
  }>;
  taxIdConfigs: TaxIdConfig[];
  departments: string[];
  designations: string[];
  businessUnits: string[];
  lastUpdated: Date;
  updatedBy: string;
}

export const employeeService = {
  getAll: async (filters?: EmployeeFilters) => {
    const queryParams: Record<string, string> = {};
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }
    const params = new URLSearchParams(queryParams);
    const response = await apiClient.get<{ success: boolean; data: Employee[] }>(
      `/employees?${params}`
    );
    return response.data.data;
  },

  getActive: async () => {
    const response = await apiClient.get<{ success: boolean; data: Employee[] }>(
      '/employees/active'
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Employee }>(
      `/employees/${id}`
    );
    return response.data.data;
  },

  getByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Employee }>(
      `/employees/byEmpId/${employeeId}`
    );
    return response.data.data;
  },

  getNextEmployeeId: async (workerType?: string) => {
    const params = workerType ? { workerType } : {};
    const response = await apiClient.get<{ success: boolean; data: { nextEmployeeId: string } }>(
      '/employees/utils/next-id',
      { params }
    );
    return response.data.data.nextEmployeeId;
  },

  create: async (employee: Omit<Employee, '_id'>) => {
    const response = await apiClient.post<{ success: boolean; data: Employee }>(
      '/employees',
      employee
    );
    return response.data.data;
  },

  update: async (id: string, data: Partial<Employee>) => {
    const response = await apiClient.put<{ success: boolean; data: Employee }>(
      `/employees/${id}`,
      data
    );
    return response.data.data;
  },

  markInactive: async (id: string) => {
    const response = await apiClient.patch<{ success: boolean; data: Employee }>(
      `/employees/${id}/inactive`
    );
    return response.data.data;
  },

  activate: async (id: string) => {
    const response = await apiClient.patch<{ success: boolean; data: Employee }>(
      `/employees/${id}/activate`
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/employees/${id}`
    );
    return response.data;
  },

  bulkUpload: async (employees: Partial<Employee>[]) => {
    const response = await apiClient.post<{ success: boolean; data: { imported: number; updated: number } }>(
      '/employees/bulk-upload',
      { employees }
    );
    return response.data.data;
  },

  getCompanySettings: async (): Promise<CompanySettings> => {
    const response = await apiClient.get<{ success: boolean; data: CompanySettings }>(
      '/employees/company-settings'
    );
    return response.data.data;
  },

  // Get employee allocations for RMG module
  getAllocations: async (): Promise<Array<{ employeeId: string; allocation: number }>> => {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: Array<{ employeeId: string; allocation: number }>;
      timestamp: string;
    }>('/employees/allocations/summary');
    return response.data.data;
  },

  // Get per-employee allocation details (project list) for RMG directory tooltip
  getAllocationDetails: async (): Promise<Array<{
    employeeId: string;
    projects: Array<{
      projectId: string;
      projectName: string;
      utilizationPercentage: number;
      fromDate: string;
      toDate: string;
      billable: boolean;
    }>;
  }>> => {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{
        employeeId: string;
        projects: Array<{
          projectId: string;
          projectName: string;
          utilizationPercentage: number;
          fromDate: string;
          toDate: string;
          billable: boolean;
        }>;
      }>;
    }>('/employees/allocations/details');
    return response.data.data;
  },
};
