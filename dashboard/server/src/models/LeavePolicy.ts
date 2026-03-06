import mongoose, { Document, Schema } from 'mongoose';

export interface ILeavePolicy extends Document {
    leaveType: string; // Manual entry instead of predefined types
    country: string; // Country-specific policy
    allocation: number; // Total leaves per year
    distribution: 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUAL';
    carryForward: boolean;
    maxCarryForward?: number;
    encashable: boolean;
    requiresApproval: boolean;
    minDaysNotice?: number;
    maxConsecutiveDays?: number;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const leavePolicySchema = new Schema<ILeavePolicy>(
    {
        leaveType: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            trim: true,
        },
        allocation: {
            type: Number,
            required: true,
            min: 0,
        },
        distribution: {
            type: String,
            required: true,
            enum: ['QUARTERLY', 'HALF_YEARLY', 'ANNUAL'],
        },
        carryForward: {
            type: Boolean,
            default: false,
        },
        maxCarryForward: {
            type: Number,
            default: 0,
        },
        encashable: {
            type: Boolean,
            default: false,
        },
        requiresApproval: {
            type: Boolean,
            default: true,
        },
        minDaysNotice: {
            type: Number,
            default: 0,
        },
        maxConsecutiveDays: {
            type: Number,
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique leave type per country
leavePolicySchema.index({ leaveType: 1, country: 1 }, { unique: true });

export const LeavePolicy = mongoose.model<ILeavePolicy>(
    'LeavePolicy',
    leavePolicySchema
);
