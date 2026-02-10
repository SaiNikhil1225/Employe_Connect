export type UOM = 'Hr' | 'Day' | 'Month';
export type LocationType = 'Onsite' | 'Offshore' | 'Hybrid';
export type ContractType = 'T&M' | 'Fixed Bid' | 'Fixed Monthly' | 'License';
export type FLStatus = 'Draft' | 'Active' | 'Completed' | 'Cancelled';

export interface FundingAllocation {
  poNo: string;
  contractNo: string;
  projectCurrency: string;
  poCurrency: string;
  unitRate: number;
  fundingUnits: number;
  uom: UOM;
  fundingValueProject: number;
  fundingAmountPoCurrency: number;
  availablePOLineInPO: number;
  availablePOLineInProject: number;
}

export interface RevenuePlanning {
  month: string; // YYYY-MM format
  plannedUnits: number;
  plannedRevenue: number;
  actualUnits: number;
  actualRevenue: number;
  forecastedUnits: number;
  forecastedRevenue: number;
}

export interface PaymentMilestone {
  milestoneName: string;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  notes?: string;
  status?: 'Pending' | 'Paid';
}

export interface FinancialLine {
  _id: string;
  flNo: string;
  projectId: string | { _id: string; projectName: string; projectId: string; startDate: string; endDate: string; billingType: string; projectCurrency: string; legalEntity: string };
  
  // Basic Details
  flName: string;
  contractType: ContractType;
  locationType: LocationType;
  executionEntity: string;
  currency: string;
  timesheetApprover: string;
  
  // Schedule
  scheduleStart: string; // YYYY-MM-DD
  scheduleFinish: string; // YYYY-MM-DD
  
  // Revenue Details
  billingRate: number;
  rateUom: UOM;
  effort?: number;
  effortUom: UOM;
  revenueAmount: number;
  expectedRevenue: number;
  
  // Funding
  funding: FundingAllocation[];
  totalFunding: number;
  
  // Planned Revenue
  revenuePlanning: RevenuePlanning[];
  totalPlannedRevenue: number;
  
  // Milestones
  paymentMilestones: PaymentMilestone[];
  
  // Status
  status: FLStatus;
  notes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Step 1: Basic Details + Revenue Details
export interface FLStep1Data {
  flName: string;
  projectId: string;
  contractType: ContractType;
  locationType: LocationType;
  executionEntity: string;
  timesheetApprover: string;
  scheduleStart: string;
  scheduleFinish: string;
  currency: string;
  billingRate: number;
  rateUom: UOM;
  effort?: number;
  effortUom: UOM;
  revenueAmount: number;
  expectedRevenue: number;
}

// Step 2: Funding Details
export interface FLStep2Data {
  funding: FundingAllocation[];
  totalFunding: number;
}

// Step 3: Revenue Planning
export interface FLStep3Data {
  revenuePlanning: RevenuePlanning[];
  totalPlannedRevenue: number;
}

// Step 4: Payment Milestones
export interface FLStep4Data {
  paymentMilestones: PaymentMilestone[];
}

// Complete FL Form Data (all steps combined)
export interface FinancialLineFormData {
  flNo: string;
  projectId: string;
  
  // Basic Details
  flName: string;
  contractType: ContractType;
  locationType: LocationType;
  executionEntity: string;
  currency: string;
  timesheetApprover: string;
  
  // Schedule
  scheduleStart: string;
  scheduleFinish: string;
  
  // Revenue Details
  billingRate: number;
  rateUom: UOM;
  effort?: number;
  effortUom: UOM;
  revenueAmount: number;
  expectedRevenue: number;
  
  // Funding
  funding: FundingAllocation[];
  totalFunding: number;
  
  // Planned Revenue
  revenuePlanning: RevenuePlanning[];
  totalPlannedRevenue: number;
  
  // Milestones
  paymentMilestones: PaymentMilestone[];
  
  // Status
  status: FLStatus;
  notes?: string;
}

export interface FinancialLineFilters {
  search: string;
  status: string;
  locationType: string;
  contractType: string;
  projectId: string;
}

export interface FinancialLineStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
  cancelled: number;
  totalFunding: number;
  totalPlannedRevenue: number;
}
