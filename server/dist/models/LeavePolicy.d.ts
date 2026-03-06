import mongoose, { Document } from 'mongoose';
export interface ILeavePolicy extends Document {
    leaveType: string;
    country: string;
    allocation: number;
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
export declare const LeavePolicy: mongoose.Model<ILeavePolicy, {}, {}, {}, mongoose.Document<unknown, {}, ILeavePolicy, {}, {}> & ILeavePolicy & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LeavePolicy.d.ts.map