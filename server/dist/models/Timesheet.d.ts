import mongoose, { Document } from 'mongoose';
export interface ITimesheetRow {
    projectId: string;
    projectCode: string;
    projectName: string;
    udaId: string;
    udaName: string;
    type?: string;
    financialLineItem: string;
    billable: string;
    hours: (string | null)[];
    comments: (string | null)[];
}
export interface ITimesheet extends Document {
    employeeId: string;
    employeeName: string;
    weekStartDate: Date;
    weekEndDate: Date;
    rows: ITimesheetRow[];
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    submittedAt?: Date;
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectionReason?: string;
    totalHours: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITimesheet, {}, {}, {}, mongoose.Document<unknown, {}, ITimesheet, {}, {}> & ITimesheet & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Timesheet.d.ts.map