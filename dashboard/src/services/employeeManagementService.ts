import apiClient from './api';

// ============ TYPE DEFINITIONS ============

export interface MedicalInfo {
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceValidUntil?: string;
  lastCheckupDate?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  dependent?: boolean;
  nomineePercentage?: number;
}

export interface EducationRecord {
  degree?: string;
  institution?: string;
  university?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  achievements?: string;
  documentUrl?: string;
}

export interface WorkHistory {
  companyName?: string;
  designation?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  responsibilities?: string;
  reasonForLeaving?: string;
  managerName?: string;
  managerContact?: string;
  salary?: number;
  documentUrl?: string;
}

export interface Certification {
  name?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  documentUrl?: string;
}

export interface Asset {
  assetType?: string;
  assetId?: string;
  serialNumber?: string;
  assignedDate?: string;
  returnDate?: string;
  status?: 'assigned' | 'returned' | 'damaged' | 'lost';
  condition?: string;
  notes?: string;
}

export interface EmployeeDocument {
  _id?: string;
  employeeId: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  expiryDate?: string;
  notes?: string;
  isActive?: boolean;
  metadata?: {
    documentNumber?: string;
    issueDate?: string;
    issuingAuthority?: string;
    version?: number;
  };
}

export interface OnboardingChecklist {
  _id?: string;
  employeeId: string;
  status: 'pending' | 'in-progress' | 'completed';
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  assignedTo?: string;
  progressPercentage?: number;
  preJoiningTasks?: any;
  day1Tasks?: any;
  itTasks?: any;
  hrTasks?: any;
  trainingTasks?: any;
  week1Tasks?: any;
  milestones?: any;
}

export interface OffboardingChecklist {
  _id?: string;
  employeeId: string;
  status: 'not-initiated' | 'in-progress' | 'completed';
  initiatedDate?: string;
  resignationDate?: string;
  lastWorkingDay?: string;
  expectedClearanceDate?: string;
  actualClearanceDate?: string;
  assignedTo?: string;
  reasonForLeaving?: string;
  detailedReason?: string;
  progressPercentage?: number;
  exitInterview?: any;
  itAssetReturn?: any;
  accessRevocation?: any;
  knowledgeTransfer?: any;
  hrClearance?: any;
  documents?: any;
  departmentClearances?: any;
  eligibleForRehire?: boolean;
}

// ============ EMPLOYEE PROFILE SERVICES ============

export const employeeManagementService = {
  // Get complete employee profile
  getEmployeeProfile: async (employeeId: string) => {
    const response = await apiClient.get(`/employees/${employeeId}/profile`);
    return response.data;
  },

  // Update medical information
  updateMedicalInfo: async (employeeId: string, medicalInfo: MedicalInfo) => {
    const response = await apiClient.patch(`/employees/${employeeId}/medical-info`, medicalInfo);
    return response.data;
  },

  // Update emergency contacts
  updateEmergencyContacts: async (employeeId: string, contacts: EmergencyContact[]) => {
    const response = await apiClient.patch(`/employees/${employeeId}/emergency-contacts`, {
      contacts,
    });
    return response.data;
  },

  // Update family members
  updateFamilyMembers: async (employeeId: string, members: FamilyMember[]) => {
    const response = await apiClient.patch(`/employees/${employeeId}/family-members`, {
      members,
    });
    return response.data;
  },

  // Update contact information
  updateContactInfo: async (employeeId: string, contactInfo: any) => {
    const response = await apiClient.patch(`/employees/${employeeId}/contact-info`, contactInfo);
    return response.data;
  },

  // Update banking information
  updateBankingInfo: async (employeeId: string, bankingInfo: any) => {
    const response = await apiClient.patch(`/employees/${employeeId}/banking-info`, bankingInfo);
    return response.data;
  },

  // Update personal information
  updatePersonalInfo: async (employeeId: string, personalInfo: any) => {
    const response = await apiClient.put(`/employees/${employeeId}`, personalInfo);
    return response.data;
  },

  // Update education history
  updateEducationHistory: async (employeeId: string, educationHistory: EducationRecord[]) => {
    const response = await apiClient.patch(`/employees/${employeeId}/education-history`, {
      educationHistory,
    });
    return response.data;
  },

  // Update certifications
  updateCertifications: async (employeeId: string, certifications: Certification[]) => {
    const response = await apiClient.patch(`/employees/${employeeId}/certifications-list`, {
      certifications,
    });
    return response.data;
  },

  // Update assets
  updateAssets: async (employeeId: string, assets: Asset[]) => {
    const response = await apiClient.patch(`/employees/${employeeId}/assets-list`, {
      assets,
    });
    return response.data;
  },

  // Add education record
  addEducation: async (employeeId: string, education: EducationRecord) => {
    const response = await apiClient.post(`/employees/${employeeId}/education`, education);
    return response.data;
  },

  // Add work history
  addWorkHistory: async (employeeId: string, workHistory: WorkHistory) => {
    const response = await apiClient.post(`/employees/${employeeId}/work-history`, workHistory);
    return response.data;
  },

  // Add certification
  addCertification: async (employeeId: string, certification: Certification) => {
    const response = await apiClient.post(`/employees/${employeeId}/certifications`, certification);
    return response.data;
  },

  // Assign asset
  assignAsset: async (employeeId: string, asset: Asset) => {
    const response = await apiClient.post(`/employees/${employeeId}/assets`, asset);
    return response.data;
  },

  // Return asset
  returnAsset: async (employeeId: string, assetId: string, data: any) => {
    const response = await apiClient.patch(
      `/employees/${employeeId}/assets/${assetId}/return`,
      data
    );
    return response.data;
  },
};

// ============ DOCUMENT MANAGEMENT SERVICES ============

export const documentService = {
  // Get all documents for an employee
  getEmployeeDocuments: async (employeeId: string) => {
    const response = await apiClient.get(`/documents/employee/${employeeId}`);
    return response.data;
  },

  // Get documents by type
  getDocumentsByType: async (employeeId: string, documentType: string) => {
    const response = await apiClient.get(`/documents/employee/${employeeId}/type/${documentType}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (formData: FormData) => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Verify document
  verifyDocument: async (documentId: string, verifiedBy: string) => {
    const response = await apiClient.patch(`/documents/${documentId}/verify`, { verifiedBy });
    return response.data;
  },

  // Reject document
  rejectDocument: async (documentId: string, verifiedBy: string, rejectionReason: string) => {
    const response = await apiClient.patch(`/documents/${documentId}/reject`, {
      verifiedBy,
      rejectionReason,
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId: string) => {
    const response = await apiClient.delete(`/documents/${documentId}`);
    return response.data;
  },

  // Get pending documents for verification
  getPendingDocuments: async () => {
    const response = await apiClient.get('/documents/pending-verification');
    return response.data;
  },

  // Get expiring documents
  getExpiringDocuments: async () => {
    const response = await apiClient.get('/documents/expiring-soon');
    return response.data;
  },

  // Update document metadata
  updateDocumentMetadata: async (documentId: string, metadata: any) => {
    const response = await apiClient.patch(`/documents/${documentId}/metadata`, metadata);
    return response.data;
  },
};

// ============ ONBOARDING SERVICES ============

export const onboardingService = {
  // Get all onboarding checklists
  getAllChecklists: async () => {
    const response = await apiClient.get('/onboarding');
    return response.data;
  },

  // Get onboarding checklist for an employee
  getEmployeeChecklist: async (employeeId: string) => {
    const response = await apiClient.get(`/onboarding/employee/${employeeId}`);
    return response.data;
  },

  // Create onboarding checklist
  createChecklist: async (data: Partial<OnboardingChecklist>) => {
    const response = await apiClient.post('/onboarding', data);
    return response.data;
  },

  // Update pre-joining task
  updatePreJoiningTask: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/pre-joining/${taskName}`, data);
    return response.data;
  },

  // Update day 1 task
  updateDay1Task: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/day1/${taskName}`, data);
    return response.data;
  },

  // Update IT task
  updateITTask: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/it/${taskName}`, data);
    return response.data;
  },

  // Update HR task
  updateHRTask: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/hr/${taskName}`, data);
    return response.data;
  },

  // Update training task
  updateTrainingTask: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/training/${taskName}`, data);
    return response.data;
  },

  // Update week 1 task
  updateWeek1Task: async (employeeId: string, taskName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/week1/${taskName}`, data);
    return response.data;
  },

  // Update milestone
  updateMilestone: async (employeeId: string, milestoneName: string, data: any) => {
    const response = await apiClient.patch(`/onboarding/${employeeId}/milestone/${milestoneName}`, data);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await apiClient.get('/onboarding/stats/overview');
    return response.data;
  },
};

// ============ OFFBOARDING SERVICES ============

export const offboardingService = {
  // Get all offboarding checklists
  getAllChecklists: async () => {
    const response = await apiClient.get('/offboarding');
    return response.data;
  },

  // Get offboarding checklist for an employee
  getEmployeeChecklist: async (employeeId: string) => {
    const response = await apiClient.get(`/offboarding/employee/${employeeId}`);
    return response.data;
  },

  // Initiate offboarding
  initiateOffboarding: async (data: Partial<OffboardingChecklist>) => {
    const response = await apiClient.post('/offboarding/initiate', data);
    return response.data;
  },

  // Schedule exit interview
  scheduleExitInterview: async (employeeId: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/exit-interview/schedule`, data);
    return response.data;
  },

  // Complete exit interview
  completeExitInterview: async (employeeId: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/exit-interview/complete`, data);
    return response.data;
  },

  // Return asset
  returnAsset: async (employeeId: string, assetType: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/assets/return/${assetType}`, data);
    return response.data;
  },

  // Revoke access
  revokeAccess: async (employeeId: string, accessType: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/access/revoke/${accessType}`, data);
    return response.data;
  },

  // Update knowledge transfer
  updateKnowledgeTransfer: async (employeeId: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/knowledge-transfer`, data);
    return response.data;
  },

  // Update HR clearance
  updateHRClearance: async (employeeId: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/hr-clearance`, data);
    return response.data;
  },

  // Issue document
  issueDocument: async (employeeId: string, documentType: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/documents/issue/${documentType}`, data);
    return response.data;
  },

  // Update department clearance
  updateDepartmentClearance: async (employeeId: string, department: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/department-clearance/${department}`, data);
    return response.data;
  },

  // Complete offboarding
  completeOffboarding: async (employeeId: string, data: any) => {
    const response = await apiClient.patch(`/offboarding/${employeeId}/complete`, data);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await apiClient.get('/offboarding/stats/overview');
    return response.data;
  },
};
