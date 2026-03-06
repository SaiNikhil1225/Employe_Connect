import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IWFHRequest, {}, {}, {}, mongoose.Document<unknown, {}, IWFHRequest, {}, {}> & IWFHRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=WFHRequest.d.ts.map