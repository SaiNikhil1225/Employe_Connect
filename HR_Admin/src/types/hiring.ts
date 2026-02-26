export interface HiringRequest {
  _id: string;
  requestNumber: string;
  hiringManagerId: string;
  hiringManagerName: string;
  department: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  candidateName?: string;
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  hiringType: 'New Position' | 'Replacement';
  replacementDetails?: {
    employeeName: string;
    reasonForReplacement: string;
    lastWorkingDay: Date | string;
  };
  minimumYears: number;
  preferredIndustry?: string;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  preferredJoiningDate: Date | string;
  shiftOrHours?: string;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  justification: string;
  status: 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
  hrAssignedTo?: string;
  hrAssignedToName?: string;
  hrNotes?: string;
  closureReason?: string;
  closureType?: 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
  lastModifiedBy: string;
  submittedAt?: Date | string;
  openedAt?: Date | string;
  closedAt?: Date | string;
  activityLog: ActivityLog[];
}

export interface ActivityLog {
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: Date | string;
  notes?: string;
}

export interface HiringStatistics {
  total: number;
  byStatus: {
    draft: number;
    submitted: number;
    open: number;
    inProgress: number;
    closed: number;
  };
  byDepartment: Array<{ _id: string; count: number }>;
  byEmploymentType: Array<{ _id: string; count: number }>;
  avgTimeToClose: number;
}

export interface HiringFilters {
  status: string[];
  department: string;
  employmentType: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}

export interface CreateHiringRequestDTO {
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  hiringType: 'New Position' | 'Replacement';
  replacementDetails?: {
    employeeName: string;
    reasonForReplacement: string;
    lastWorkingDay: Date | string;
  };
  minimumYears: number;
  preferredIndustry?: string;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  preferredJoiningDate: Date | string;
  shiftOrHours?: string;
  budgetRange: {
    min: number;
    max: number;
    currency?: string;
  };
  justification: string;
  contactPhone?: string;
}

export interface UpdateHiringRequestDTO extends Partial<CreateHiringRequestDTO> {
  updateNotes?: string;
}

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
export type HiringType = 'New Position' | 'Replacement';
export type WorkLocationType = 'On-site' | 'Remote' | 'Hybrid';
export type HiringStatus = 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
export type ClosureType = 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
