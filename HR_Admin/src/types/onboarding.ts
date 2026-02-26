export interface OnboardingChecklist {
  id: string;
  category: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation';
  task: string;
  description: string;
  assignedTo: 'hr' | 'it' | 'manager' | 'employee' | 'admin';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  dueDate?: string;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
  mandatory: boolean;
}

export interface OnboardingDocument {
  id: string;
  documentType: string;
  documentName: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: string;
  verifiedDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
  expiryDate?: string;
}

export interface WelcomeKit {
  id: string;
  itemName: string;
  itemType: 'laptop' | 'mouse' | 'keyboard' | 'headset' | 'monitor' | 'mobile' | 'accessories' | 'stationery' | 'other';
  serialNumber?: string;
  assignedDate?: string;
  status: 'pending' | 'assigned' | 'delivered' | 'returned';
  deliveryDate?: string;
  notes?: string;
}

export interface TrainingSchedule {
  id: string;
  trainingName: string;
  trainingType: 'orientation' | 'technical' | 'compliance' | 'soft-skills' | 'product' | 'department-specific';
  mandatory: boolean;
  scheduledDate?: string;
  duration: string;
  trainer?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  completionDate?: string;
  feedback?: string;
  rating?: number;
}

export interface BuddyMentor {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  assignedDate: string;
  role: 'buddy' | 'mentor' | 'both';
  notes?: string;
}

export interface OnboardingStatus {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progressPercentage: number;
  currentPhase: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation' | 'completed';
  checklist: OnboardingChecklist[];
  documents: OnboardingDocument[];
  welcomeKit: WelcomeKit[];
  trainings: TrainingSchedule[];
  buddy?: BuddyMentor;
  mentor?: BuddyMentor;
  lastUpdated: string;
  hrContact?: {
    name: string;
    email: string;
    phone: string;
  };
  managerContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  department: string;
  designation: string;
  checklist: Omit<OnboardingChecklist, 'id' | 'status' | 'completedDate' | 'completedBy'>[];
  documents: Omit<OnboardingDocument, 'id' | 'status' | 'uploadedDate' | 'verifiedDate' | 'verifiedBy'>[];
  welcomeKitItems: Omit<WelcomeKit, 'id' | 'status' | 'assignedDate' | 'deliveryDate'>[];
  trainings: Omit<TrainingSchedule, 'id' | 'status' | 'scheduledDate' | 'completionDate'>[];
  createdBy: string;
  createdDate: string;
  active: boolean;
}
