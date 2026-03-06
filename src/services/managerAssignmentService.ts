import apiClient from './api';

export interface ManagerAssignment {
    _id?: string;
    employeeId: string;
    employeeName: string;
    reportingManagerId?: string;
    reportingManagerName?: string;
    dottedLineManagerId?: string;
    dottedLineManagerName?: string;
    assignedBy: string;
    assignedDate: string;
    notes?: string;
}

export interface Employee {
    _id: string;
    employeeId: string;
    id?: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    profilePhoto?: string;
    businessUnit?: string;
    location?: string;
}

export interface DirectReport {
    _id: string;
    employeeId: string;
    employeeName: string;
    reportingManagerId?: string;
    dottedLineManagerId?: string;
    relationship: 'direct' | 'dotted';
    employee: Employee | null;
}

export interface OrganizationTree {
    employee: Employee;
    reportingManager: Employee | null;
    dottedLineManager: Employee | null;
    directReports: DirectReport[];
}

// Get all manager assignments
export const getAllManagerAssignments = async (): Promise<ManagerAssignment[]> => {
    const response = await apiClient.get('/manager-assignments');
    return response.data.data;
};

// Get manager assignment for specific employee
export const getManagerAssignment = async (employeeId: string): Promise<ManagerAssignment | null> => {
    const response = await apiClient.get(`/manager-assignments/employee/${employeeId}`);
    return response.data.data;
};

// Create or update manager assignment
export const saveManagerAssignment = async (data: {
    employeeId: string;
    reportingManagerId?: string;
    dottedLineManagerId?: string;
    notes?: string;
}): Promise<ManagerAssignment> => {
    const response = await apiClient.post('/manager-assignments', data);
    return response.data.data;
};

// Delete manager assignment
export const deleteManagerAssignment = async (employeeId: string): Promise<void> => {
    await apiClient.delete(`/manager-assignments/${employeeId}`);
};

// Get all employees for dropdowns
export const getAllEmployees = async (): Promise<Employee[]> => {
    const response = await apiClient.get('/employees');
    return response.data.data;
};

// Get organization tree for a user
export const getOrganizationTree = async (employeeId: string): Promise<OrganizationTree> => {
    const response = await apiClient.get(`/manager-assignments/org-tree/${employeeId}`);
    return response.data.data;
};
