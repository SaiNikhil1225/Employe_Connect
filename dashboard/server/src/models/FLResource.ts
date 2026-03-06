import mongoose, { Document, Schema } from 'mongoose';

interface IMonthAllocation {
  month: string;
  allocation: number;
}

interface IReleaseHistory {
  date: Date;
  type: 'full' | 'partial';
  previousAllocation: number;
  newAllocation: number;
  releasedBy: string;
}

export interface IFLResource extends Document {
  employeeId?: string;
  resourceName: string;
  jobRole: string;
  department: string;
  skills: string[];
  skillRequired?: string; // Legacy field for backward compatibility
  utilizationPercentage: number;
  requestedFromDate: Date;
  requestedToDate: Date;
  billable: boolean;
  percentageBasis: string;
  monthlyAllocations: IMonthAllocation[];
  releaseHistory: IReleaseHistory[];
  totalAllocation: string;
  financialLineId: mongoose.Types.ObjectId;
  flNo: string;
  flName: string;
  projectId?: mongoose.Types.ObjectId;
  status: 'Active' | 'On Leave' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const MonthAllocationSchema = new Schema({
  month: { type: String, required: true },
  allocation: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const ReleaseHistorySchema = new Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['full', 'partial'], required: true },
  previousAllocation: { type: Number, required: true },
  newAllocation: { type: Number, required: true },
  releasedBy: { type: String, required: false },
}, { _id: false });

const FLResourceSchema = new Schema<IFLResource>(
  {
    employeeId: {
      type: String,
      required: false,
    },
    resourceName: {
      type: String,
      required: false,
    },
    jobRole: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: false,
    },
    skills: {
      type: [String],
      default: [],
    },
    skillRequired: {
      type: String,
      required: false,
    },
    utilizationPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    requestedFromDate: {
      type: Date,
      required: true,
    },
    requestedToDate: {
      type: Date,
      required: true,
    },
    billable: {
      type: Boolean,
      default: true,
    },
    percentageBasis: {
      type: String,
      default: 'Billable',
    },
    monthlyAllocations: {
      type: [MonthAllocationSchema],
      default: [],
    },
    releaseHistory: {
      type: [ReleaseHistorySchema],
      default: [],
    },
    totalAllocation: {
      type: String,
      default: '0:0 Hrs',
    },
    financialLineId: {
      type: Schema.Types.ObjectId,
      ref: 'FinancialLine',
      required: true,
    },
    flNo: {
      type: String,
      required: true,
    },
    flName: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
FLResourceSchema.index({ financialLineId: 1 });
FLResourceSchema.index({ projectId: 1 });
FLResourceSchema.index({ status: 1 });
FLResourceSchema.index({ name: 1 });

export const FLResource = mongoose.model<IFLResource>('FLResource', FLResourceSchema);
