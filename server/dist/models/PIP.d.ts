import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IPIP, {}, {}, {}, mongoose.Document<unknown, {}, IPIP, {}, {}> & IPIP & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=PIP.d.ts.map