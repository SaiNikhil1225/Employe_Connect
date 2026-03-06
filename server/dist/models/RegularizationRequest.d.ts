import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IRegularizationRequest, {}, {}, {}, mongoose.Document<unknown, {}, IRegularizationRequest, {}, {}> & IRegularizationRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=RegularizationRequest.d.ts.map