import mongoose, { Schema, Document } from 'mongoose';

export interface IRegularizationRequest extends Document {
  employeeId: string;
  employeeName: string;
  department: string;
  date: Date;
  requestType: 'late-arrival' | 'early-departure' | 'missing-punch' | 'wfh-conversion' | 'general-regularization';
  reason: string;
  proposedCheckIn?: Date;
  proposedCheckOut?: Date;
  originalCheckIn?: Date;
  originalCheckOut?: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}

const regularizationRequestSchema = new Schema<IRegularizationRequest>({
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
  date: {
    type: Date,
    required: true,
    index: true
  },
  requestType: {
    type: String,
    enum: ['late-arrival', 'early-departure', 'missing-punch', 'wfh-conversion', 'general-regularization'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500
  },
  proposedCheckIn: {
    type: Date,
    default: null
  },
  proposedCheckOut: {
    type: Date,
    default: null
  },
  originalCheckIn: {
    type: Date,
    default: null
  },
  originalCheckOut: {
    type: Date,
    default: null
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
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes
regularizationRequestSchema.index({ employeeId: 1, status: 1 });
regularizationRequestSchema.index({ status: 1, createdAt: -1 });
regularizationRequestSchema.index({ department: 1, status: 1 });

export default mongoose.model<IRegularizationRequest>('RegularizationRequest', regularizationRequestSchema);
