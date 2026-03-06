import mongoose, { Schema, Document } from 'mongoose';

export interface IWFHRequest extends Document {
  employeeId: string;
  employeeName: string;
  department: string;
  fromDate: Date;
  toDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  reportingManagerId?: string;
  reportingManagerName?: string;
}

const wfhRequestSchema = new Schema<IWFHRequest>({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  fromDate: {
    type: Date,
    required: true,
    index: true
  },
  toDate: {
    type: Date,
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true
  },
  approvedBy: String,
  approvedAt: Date,
  rejectedBy: String,
  rejectedAt: Date,
  rejectionReason: String,
  reportingManagerId: String,
  reportingManagerName: String
}, {
  timestamps: true
});

// Indexes
wfhRequestSchema.index({ employeeId: 1, status: 1 });
wfhRequestSchema.index({ status: 1, fromDate: -1 });
wfhRequestSchema.index({ department: 1, fromDate: -1 });
wfhRequestSchema.index({ reportingManagerId: 1, status: 1 });

export default mongoose.model<IWFHRequest>('WFHRequest', wfhRequestSchema);
