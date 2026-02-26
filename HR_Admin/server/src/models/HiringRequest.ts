import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog {
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: Date;
  notes?: string;
}

export interface IReplacementDetails {
  employeeName: string;
  reasonForReplacement: string;
  lastWorkingDay: Date;
}

export interface IBudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface IHiringRequest extends Document {
  requestNumber: string;
  candidateName?: string;
  hiringManagerId: string;
  hiringManagerName: string;
  department: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  hiringType: 'New Position' | 'Replacement';
  replacementDetails?: IReplacementDetails;
  minimumYears: number;
  preferredIndustry?: string;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  preferredJoiningDate: Date;
  shiftOrHours?: string;
  budgetRange?: IBudgetRange;
  justification?: string;
  status: 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
  hrAssignedTo?: string;
  hrAssignedToName?: string;
  hrNotes?: string;
  closureReason?: string;
  closureType?: 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
  createdBy: string;
  lastModifiedBy: string;
  submittedAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
  activityLog: IActivityLog[];
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  performedByName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  notes: String
}, { _id: false });

const ReplacementDetailsSchema = new Schema<IReplacementDetails>({
  employeeName: { type: String, required: true },
  reasonForReplacement: { type: String, required: true },
  lastWorkingDay: { type: Date, required: true }
}, { _id: false });

const BudgetRangeSchema = new Schema<IBudgetRange>({
  min: { type: Number, required: true, min: 0 },
  max: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' }
}, { _id: false });

const HiringRequestSchema = new Schema<IHiringRequest>({
  requestNumber: { 
    type: String, 
    required: false, // Auto-generated in pre-save hook
    unique: true,
    index: true 
  },
  candidateName: { type: String, required: false },
  hiringManagerId: { 
    type: String, 
    required: true, 
    index: true 
  },
  hiringManagerName: { type: String, required: true },
  department: { 
    type: String, 
    required: true,
    index: true 
  },
  designation: { type: String, required: true },
  contactEmail: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true 
  },
  contactPhone: { type: String, required: true },
  jobTitle: { type: String, required: true },
  employmentType: { 
    type: String, 
    required: true,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern']
  },
  hiringType: { 
    type: String, 
    required: true,
    enum: ['New Position', 'Replacement']
  },
  replacementDetails: ReplacementDetailsSchema,
  minimumYears: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 50 
  },
  preferredIndustry: String,
  workLocation: { 
    type: String, 
    required: true,
    enum: ['On-site', 'Remote', 'Hybrid']
  },
  preferredJoiningDate: { type: Date, required: true },
  shiftOrHours: String,
  budgetRange: {
    type: BudgetRangeSchema,
    required: false
  },
  justification: { 
    type: String, 
    required: false,
    maxlength: 1000
  },
  status: { 
    type: String, 
    required: true, 
    default: 'Draft',
    enum: ['Draft', 'Submitted', 'Open', 'In Progress', 'Closed'],
    index: true
  },
  hrAssignedTo: String,
  hrAssignedToName: String,
  hrNotes: String,
  closureReason: String,
  closureType: {
    type: String,
    enum: ['Position Filled', 'Request Cancelled', 'Budget Denied', 'Other']
  },
  createdBy: { type: String, required: true },
  lastModifiedBy: { type: String, required: true },
  submittedAt: { type: Date, index: true },
  openedAt: Date,
  closedAt: Date,
  activityLog: {
    type: [ActivityLogSchema],
    default: []
  }
}, {
  timestamps: true
});

// Auto-generate request number before saving
HiringRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('HiringRequest').countDocuments({
      requestNumber: new RegExp(`^HIR-${year}-`)
    });
    this.requestNumber = `HIR-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Validation: max >= min for budget
HiringRequestSchema.pre('save', function(next) {
  if (this.budgetRange && this.budgetRange.max < this.budgetRange.min) {
    const error = new Error('Budget max must be greater than or equal to min');
    return next(error);
  }
  next();
});

// Validation: replacement details required if hiring type is Replacement
HiringRequestSchema.pre('save', function(next) {
  if (this.hiringType === 'Replacement' && !this.replacementDetails) {
    const error = new Error('Replacement details required for replacement hiring type');
    return next(error);
  }
  next();
});

// Validation: closure reason required when status is Closed
HiringRequestSchema.pre('save', function(next) {
  if (this.status === 'Closed' && !this.closureReason) {
    const error = new Error('Closure reason is required when closing a request');
    return next(error);
  }
  next();
});

// Index for searching
HiringRequestSchema.index({ jobTitle: 'text', requestNumber: 'text', hiringManagerName: 'text' });

export default mongoose.model<IHiringRequest>('HiringRequest', HiringRequestSchema);
