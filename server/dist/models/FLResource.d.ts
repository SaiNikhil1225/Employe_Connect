import mongoose, { Document } from 'mongoose';
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
    skillRequired?: string;
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
export declare const FLResource: mongoose.Model<IFLResource, {}, {}, {}, mongoose.Document<unknown, {}, IFLResource, {}, {}> & IFLResource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=FLResource.d.ts.map