import mongoose, { Document } from 'mongoose';
/**
 * Date-based Timesheet Entry Model
 * Each entry represents a single task on a specific date
 * Replaces the week-based array structure for better:
 * - Billing: Query exact hours per project per date
 * - Approval: Managers approve/reject specific days
 * - Reporting: Date-wise analytics and insights
 */
export interface ITimesheetEntry extends Document {
    employeeId: string;
    employeeName: string;
    date: Date;
    projectId: string;
    projectCode: string;
    projectName: string;
    udaId: string;
    udaName: string;
    type: string;
    financialLineItem: string;
    billable: string;
    hours: string;
    comment: string | null;
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    submittedAt?: Date;
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'revision_requested';
    approvedBy?: string;
    approvedAt?: Date;
    rejectedReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITimesheetEntry, {}, {}, {}, mongoose.Document<unknown, {}, ITimesheetEntry, {}, {}> & ITimesheetEntry & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TimesheetEntry.d.ts.map