/**
 * Super Admin Types
 * TypeScript interfaces for Super Admin module
 */

// ===========================================
// APPROVER TYPES
// ===========================================

export interface ApproverInfo {
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
}

export interface ApprovalLevelConfig {
  enabled: boolean;
  approvers: ApproverInfo[];
}

export interface ApprovalConfig {
  l1: ApprovalLevelConfig;
  l2: ApprovalLevelConfig;
  l3: ApprovalLevelConfig;
}

// ===========================================
// CATEGORY TYPES
// ===========================================

export type HighLevelCategory = 'IT' | 'Facilities' | 'Finance';

export interface SubCategoryConfig {
  id: string;
  _id?: string;
  highLevelCategory: HighLevelCategory;
  subCategory: string;
  requiresApproval: boolean;
  processingQueue: string;
  specialistQueue: string;
  order: number;
  isActive: boolean;
  approvalConfig: ApprovalConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  highLevelCategory: HighLevelCategory;
  subCategory: string;
  requiresApproval: boolean;
  processingQueue: string;
  specialistQueue: string;
  order: number;
  isActive: boolean;
  approvalConfig: ApprovalConfig;
}

// ===========================================
// USER MANAGEMENT TYPES
// ===========================================

export interface SuperAdminUser {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  avatar?: string;
  isActive: boolean;
  modules?: string[];
  createdAt?: string;
  updatedAt?: string;
  approverAssignments?: ApproverAssignment[];
}

export interface ApproverAssignment {
  categoryId: string;
  category: string;
  levels: string[];
}

export interface UserFormData {
  email: string;
  password?: string;
  name: string;
  role: string;
  department?: string;
  designation?: string;
  employeeId?: string;
  modules?: string[];
}

// ===========================================
// DASHBOARD TYPES
// ===========================================

export interface DashboardStats {
  totalUsers: number;
  newUsersThisWeek: number;
  openTickets: number;
  criticalTickets: number;
  pendingApprovals: {
    l1: number;
    l2: number;
    l3: number;
    total: number;
  };
  categoriesCount: number;
  categoriesByType: Record<string, number>;
}

export interface SystemHealth {
  database: string;
  api: string;
  timestamp: string;
}

// ===========================================
// APPROVER OVERVIEW TYPES
// ===========================================

export interface CategoryApprovers {
  categoryId: string;
  categoryName: string;
  subCategory: string;
  l1Approvers: ApproverInfo[];
  l2Approvers: ApproverInfo[];
  l3Approvers: ApproverInfo[];
  pendingCounts?: {
    l1: number;
    l2: number;
    l3: number;
  };
}

export interface ApproverStats {
  totalApprovers: number;
  totalApprovals: number;
  pendingApprovals: number;
  averageResponseTime: string;
  byLevel?: {
    L1: number;
    L2: number;
    L3: number;
  };
}

export interface ApproverListItem {
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  categories?: string[];
  levels?: string[];
  totalApprovals?: number;
  pendingApprovals?: number;
  averageResponseTime?: string;
  l1Categories?: string[];
  l2Categories?: string[];
  l3Categories?: string[];
}

// ===========================================
// EMPLOYEE SEARCH TYPES
// ===========================================

export interface EmployeeSearchResult {
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
  department?: string;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

// ===========================================
// MODULE PERMISSION TYPES
// ===========================================

export type ModuleName = 'EMPLOYEE' | 'HR' | 'RMG' | 'HELPDESK' | 'LEAVE';
export type PermissionAction = 'view' | 'add' | 'modify';

export interface ModulePermissions {
  view: boolean;
  add: boolean;
  modify: boolean;
}

export interface ModulePermission {
  _id?: string;
  employeeId: string;
  module: ModuleName;
  enabled: boolean;
  isAdmin: boolean;
  permissions: ModulePermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeModulePermission {
  employeeId: string;
  name: string;
  email: string;
  designation?: string;
  department?: string;
  modules: {
    [key in ModuleName]?: {
      enabled: boolean;
      isAdmin: boolean;
      permissions: ModulePermissions;
    };
  };
}

// ===========================================
// APPROVAL FLOW TYPES
// ===========================================

export type FlowModule = 'HELPDESK' | 'LEAVE' | 'HR';
export type FlowType = 'NONE' | 'SINGLE' | 'TWO' | 'THREE';
export type ApprovalRole =
  | 'MANAGER'
  | 'RMG'
  | 'EXECUTIVE'
  | 'HR'
  | 'IT_ADMIN'
  | 'L1_APPROVER'
  | 'L2_APPROVER'
  | 'L3_APPROVER'
  | 'SUPER_ADMIN';

export interface ApprovalStep {
  role: ApprovalRole;
  order: number;
}

export interface ApprovalFlow {
  _id?: string;
  module: FlowModule;
  flowType: FlowType;
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================
// HR REGION CONFIG TYPES
// ===========================================

export type Region = 'INDIA' | 'US' | 'UK' | 'MIDDLE_EAST' | 'OTHER';
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'file';

export interface FieldConfig {
  name: string;
  label: string;
  required: boolean;
  regex?: string;
  message?: string;
  fieldType?: FieldType;
  options?: string[];
}

export interface HRRegionConfig {
  _id?: string;
  region: Region;
  fields: FieldConfig[];
  departments: string[];
  designations: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================
// HELPDESK CONFIG TYPES
// ===========================================

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface RequestType {
  name: string;
  description?: string;
  sla?: number;
  priority?: Priority;
  isActive: boolean;
}

export interface HelpdeskConfig {
  _id?: string;
  category: string;
  requestTypes: RequestType[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================
// LEAVE POLICY TYPES
// ===========================================

export type Distribution = 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';

export interface LeavePolicy {
  _id?: string;
  leaveType: string; // Manual entry instead of predefined types
  country: string; // Country-specific policy
  allocation: number;
  distribution: Distribution;
  carryForward: boolean;
  maxCarryForward?: number;
  encashable: boolean;
  requiresApproval: boolean;
  minDaysNotice?: number;
  maxConsecutiveDays?: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================
// HOLIDAY CALENDAR TYPES
// ===========================================

export type HolidayType = 'PUBLIC' | 'OPTIONAL' | 'REGIONAL';

export interface Holiday {
  name: string;
  date: Date | string;
  type?: HolidayType;
  description?: string;
}

export interface HolidayCalendar {
  _id?: string;
  title: string;
  year: number;
  country: string;
  state?: string;
  client?: string;
  bannerImage?: string;
  holidays: Holiday[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
