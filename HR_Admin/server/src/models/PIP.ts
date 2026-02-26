import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  name: string;
  startDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface IPIP extends Document {
  pipNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  reason: string;
  attachments: string[];
  evaluationProcess: string;
  improvementPlan: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  tasks: ITask[];
  
  // Status
  status: 'Pending' | 'Acknowledged' | 'Active' | 'Completed' | 'Failed' | 'Cancelled';
  acknowledgedAt?: Date;
  
  // Approval
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // People involved
  reportingManagerId: string;
  reportingManagerName: string;
  initiatedBy: string;
  initiatedByName: string;
  initiatedByRole?: string;
  initiatedByAvatar?: string;
  
  // Audit
  initiatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
}

const TaskSchema = new Schema<ITask>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedDate: { type: Date }
}, { _id: false });

const PIPSchema = new Schema<IPIP>({
  pipNumber: { 
    type: String, 
    required: false,
    unique: true,
    index: true 
  },
  employeeId: { 
    type: String, 
    required: true,
    index: true 
  },
  employeeName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  reason: { type: String, required: true },
  attachments: [{ type: String }],
  evaluationProcess: { type: String, required: true },
  improvementPlan: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  tasks: [TaskSchema],
  
  status: { 
    type: String, 
    enum: ['Pending', 'Acknowledged', 'Active', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  acknowledgedAt: { type: Date },
  
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved',
    index: true
  },
  approvedBy: { type: String },
  approvedByName: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  reportingManagerId: { type: String, required: true, index: true },
  reportingManagerName: { type: String, required: true },
  initiatedBy: { type: String, required: true },
  initiatedByName: { type: String, required: true },
  initiatedByRole: { type: String },
  initiatedByAvatar: { type: String },
  
  initiatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  
  lastModifiedBy: { type: String },
  lastModifiedAt: { type: Date }
}, {
  timestamps: true
});

// Auto-generate PIP number
PIPSchema.pre('save', async function(next) {
  if (!this.pipNumber) {
    const count = await mongoose.model('PIP').countDocuments();
    this.pipNumber = `PIP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IPIP>('PIP', PIPSchema);
