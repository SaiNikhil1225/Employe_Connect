import mongoose, { Schema, Document } from 'mongoose';

export interface IPIP extends Document {
  employeeId: string;
  employeeName: string;
  reason: string;
  evaluationProcess: string;
  improvementPlan: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  tasks: Array<{
    id: string;
    name: string;
    startDate: Date;
    completed: boolean;
  }>;
  attachments: string[];
  initiatedBy: string;
  initiatedByName: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PIPSchema: Schema = new Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    evaluationProcess: {
      type: String,
      required: true,
    },
    improvementPlan: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'failed', 'cancelled'],
      default: 'active',
    },
    tasks: [
      {
        id: String,
        name: String,
        startDate: Date,
        completed: { type: Boolean, default: false },
      },
    ],
    attachments: [String],
    initiatedBy: {
      type: String,
      required: true,
    },
    initiatedByName: {
      type: String,
      required: true,
    },
    acknowledgedBy: String,
    acknowledgedAt: Date,
    completedAt: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PIPSchema.index({ employeeId: 1, status: 1 });
PIPSchema.index({ status: 1 });

export default mongoose.model<IPIP>('PIP', PIPSchema);
