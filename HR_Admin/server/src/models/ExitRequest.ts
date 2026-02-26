import mongoose, { Schema, Document } from 'mongoose';

export interface IExitRequest extends Document {
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  exitReason: 'resign' | 'terminate';
  discussionHeld: 'yes' | 'no';
  discussionSummary?: string;
  
  // Resignation-specific fields
  resignationReason?: string;
  resignationNoticeDate?: Date;
  
  // Termination-specific fields
  terminationReason?: string;
  terminationNoticeDate?: Date;
  
  lastWorkingDayOption: 'original' | 'other';
  customLastWorkingDay?: Date;
  calculatedLastWorkingDay: Date;
  okToRehire: boolean;
  
  // Approval workflow
  reportingManagerId: string;
  reportingManagerName: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Audit fields
  initiatedBy: string;
  initiatedByName: string;
  initiatedAt: Date;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
}

const ExitRequestSchema = new Schema<IExitRequest>({
  requestNumber: { 
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
  exitReason: { 
    type: String, 
    enum: ['resign', 'terminate'],
    required: true 
  },
  discussionHeld: { 
    type: String, 
    enum: ['yes', 'no'],
    required: true 
  },
  discussionSummary: { type: String },
  
  // Resignation-specific fields
  resignationReason: { type: String },
  resignationNoticeDate: { type: Date },
  
  // Termination-specific fields
  terminationReason: { type: String },
  terminationNoticeDate: { type: Date },
  
  lastWorkingDayOption: { 
    type: String, 
    enum: ['original', 'other'],
    required: true 
  },
  customLastWorkingDay: { type: Date },
  calculatedLastWorkingDay: { type: Date, required: true },
  okToRehire: { type: Boolean, default: false },
  
  // Approval workflow
  reportingManagerId: { type: String, required: true, index: true },
  reportingManagerName: { type: String, required: true },
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true
  },
  approvedBy: { type: String },
  approvedByName: { type: String },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  // Audit fields
  initiatedBy: { type: String, required: true },
  initiatedByName: { type: String, required: true },
  initiatedAt: { type: Date, default: Date.now },
  lastModifiedBy: { type: String },
  lastModifiedAt: { type: Date }
}, {
  timestamps: true
});

// Auto-generate request number
ExitRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('ExitRequest').countDocuments();
    this.requestNumber = `EXIT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model<IExitRequest>('ExitRequest', ExitRequestSchema);
