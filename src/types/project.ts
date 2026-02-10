export type BillingType = 'T&M' | 'Fixed Bid' | 'Fixed Monthly' | 'License';
export type PracticeUnit = 'AiB & Automation' | 'GenAI' | 'Data & Analytics' | 'Cloud Engineering' | 'Other';
export type ProjectRegion = 'UK' | 'India' | 'USA' | 'ME' | 'Other';
export type ProjectCurrency = 'USD' | 'GBP' | 'INR' | 'EUR' | 'AED';
export type ProjectStatus = 'Draft' | 'Active' | 'On Hold' | 'Closed';

export interface ProjectManager {
  employeeId?: string;
  name?: string;
}

export interface Project {
  _id?: string;
  id?: string;
  projectId: string;
  projectName: string;
  customerId: string;
  accountName: string;
  legalEntity: string;
  hubspotDealId?: string;
  billingType: BillingType;
  practiceUnit: PracticeUnit;
  region: ProjectRegion;
  projectManager?: ProjectManager;
  deliveryManager?: ProjectManager;
  industry?: string;
  clientType?: string;
  revenueType?: string;
  projectStartDate: Date | string;
  projectEndDate: Date | string;
  projectCurrency: ProjectCurrency;
  estimatedValue?: number;
  status: ProjectStatus;
  description?: string;
  budget?: number;
  utilization?: number;
  requiredSkills?: string[];
  teamSize?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ProjectFormData {
  projectId?: string;
  projectName: string;
  projectDescription?: string;
  customerId?: string;
  accountName: string;
  legalEntity: string;
  hubspotDealId?: string;
  billingType: BillingType;
  practiceUnit: PracticeUnit;
  region: ProjectRegion;
  projectManager: string;
  deliveryManager: string;
  dealOwner: string;
  industry: string;
  regionHead: string;
  leadSource: string;
  clientType: string;
  revenueType: string;
  projectWonThroughRFP?: boolean;
  projectStartDate: string;
  projectEndDate: string;
  projectCurrency: ProjectCurrency;
  estimatedValue?: number;
  status?: ProjectStatus;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  statuses?: string[];
  region?: ProjectRegion;
  regions?: string[];
  billingType?: BillingType;
  customerId?: string;
  search?: string;
  searchScope?: 'all' | 'name' | 'id' | 'manager';
  owners?: string[];
  health?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ProjectStats {
  total: number;
  byStatus: Array<{
    _id: ProjectStatus;
    count: number;
  }>;
  byRegion: Array<{
    _id: ProjectRegion;
    count: number;
  }>;
  byBillingType: Array<{
    _id: BillingType;
    count: number;
  }>;
}
