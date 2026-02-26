import mongoose, { Schema, Document } from 'mongoose';

// Onboarding Status Interface
export interface IOnboardingStatus extends Document {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  progressPercentage: number;
  currentPhase: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation' | 'completed';
  lastUpdated: Date;
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
  buddy?: {
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
    assignedDate: Date;
    notes?: string;
  };
  mentor?: {
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone?: string;
    profilePhoto?: string;
    assignedDate: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Onboarding Checklist Item Interface
export interface IOnboardingChecklistItem extends Document {
  employeeId: string;
  category: 'pre-joining' | 'day-1' | 'week-1' | 'month-1' | 'probation';
  task: string;
  description: string;
  assignedTo: 'hr' | 'it' | 'manager' | 'employee' | 'admin';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  dueDate?: Date;
  completedDate?: Date;
  completedBy?: string;
  notes?: string;
  mandatory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Onboarding Document Interface
export interface IOnboardingDocument extends Document {
  employeeId: string;
  documentType: string;
  documentName: string;
  required: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadedDate?: Date;
  verifiedDate?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  fileUrl?: string;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Welcome Kit Item Interface
export interface IWelcomeKitItem extends Document {
  employeeId: string;
  itemName: string;
  itemType: 'laptop' | 'mouse' | 'keyboard' | 'headset' | 'monitor' | 'mobile' | 'accessories' | 'stationery' | 'other';
  serialNumber?: string;
  assignedDate?: Date;
  status: 'pending' | 'assigned' | 'delivered' | 'returned';
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Training Schedule Interface
export interface ITrainingSchedule extends Document {
  employeeId: string;
  trainingName: string;
  trainingType: 'orientation' | 'technical' | 'compliance' | 'soft-skills' | 'product' | 'department-specific';
  mandatory: boolean;
  scheduledDate?: Date;
  duration: string;
  trainer?: string;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  completionDate?: Date;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const OnboardingStatusSchema = new Schema<IOnboardingStatus>({
  employeeId: { type: String, required: true, unique: true, index: true },
  employeeName: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
    default: 'not-started'
  },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  currentPhase: {
    type: String,
    enum: ['pre-joining', 'day-1', 'week-1', 'month-1', 'probation', 'completed'],
    default: 'pre-joining'
  },
  lastUpdated: { type: Date, default: Date.now },
  hrContact: {
    name: String,
    email: String,
    phone: String
  },
  managerContact: {
    name: String,
    email: String,
    phone: String
  },
  buddy: {
    employeeId: String,
    name: String,
    designation: String,
    department: String,
    email: String,
    phone: String,
    profilePhoto: String,
    assignedDate: Date,
    notes: String
  },
  mentor: {
    employeeId: String,
    name: String,
    designation: String,
    department: String,
    email: String,
    phone: String,
    profilePhoto: String,
    assignedDate: Date,
    notes: String
  }
}, {
  timestamps: true
});

const OnboardingChecklistItemSchema = new Schema<IOnboardingChecklistItem>({
  employeeId: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['pre-joining', 'day-1', 'week-1', 'month-1', 'probation'],
    required: true
  },
  task: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: {
    type: String,
    enum: ['hr', 'it', 'manager', 'employee', 'admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'skipped'],
    default: 'pending'
  },
  dueDate: Date,
  completedDate: Date,
  completedBy: String,
  notes: String,
  mandatory: { type: Boolean, default: false }
}, {
  timestamps: true
});

const OnboardingDocumentSchema = new Schema<IOnboardingDocument>({
  employeeId: { type: String, required: true, index: true },
  documentType: { type: String, required: true },
  documentName: { type: String, required: true },
  required: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'verified', 'rejected'],
    default: 'pending'
  },
  uploadedDate: Date,
  verifiedDate: Date,
  verifiedBy: String,
  rejectionReason: String,
  fileUrl: String,
  expiryDate: Date
}, {
  timestamps: true
});

const WelcomeKitItemSchema = new Schema<IWelcomeKitItem>({
  employeeId: { type: String, required: true, index: true },
  itemName: { type: String, required: true },
  itemType: {
    type: String,
    enum: ['laptop', 'mouse', 'keyboard', 'headset', 'monitor', 'mobile', 'accessories', 'stationery', 'other'],
    required: true
  },
  serialNumber: String,
  assignedDate: Date,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'delivered', 'returned'],
    default: 'pending'
  },
  deliveryDate: Date,
  notes: String
}, {
  timestamps: true
});

const TrainingScheduleSchema = new Schema<ITrainingSchedule>({
  employeeId: { type: String, required: true, index: true },
  trainingName: { type: String, required: true },
  trainingType: {
    type: String,
    enum: ['orientation', 'technical', 'compliance', 'soft-skills', 'product', 'department-specific'],
    required: true
  },
  mandatory: { type: Boolean, default: false },
  scheduledDate: Date,
  duration: { type: String, required: true },
  trainer: String,
  location: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  completionDate: Date,
  feedback: String,
  rating: { type: Number, min: 1, max: 5 }
}, {
  timestamps: true
});

// Create indexes
OnboardingChecklistItemSchema.index({ employeeId: 1, category: 1 });
OnboardingDocumentSchema.index({ employeeId: 1, status: 1 });
WelcomeKitItemSchema.index({ employeeId: 1, status: 1 });
TrainingScheduleSchema.index({ employeeId: 1, status: 1 });

// Export models
export const OnboardingStatus = mongoose.model<IOnboardingStatus>('OnboardingStatus', OnboardingStatusSchema);
export const OnboardingChecklistItem = mongoose.model<IOnboardingChecklistItem>('OnboardingChecklistItem', OnboardingChecklistItemSchema);
export const OnboardingDocument = mongoose.model<IOnboardingDocument>('OnboardingDocument', OnboardingDocumentSchema);
export const WelcomeKitItem = mongoose.model<IWelcomeKitItem>('WelcomeKitItem', WelcomeKitItemSchema);
export const TrainingSchedule = mongoose.model<ITrainingSchedule>('TrainingSchedule', TrainingScheduleSchema);

export default OnboardingStatus;
