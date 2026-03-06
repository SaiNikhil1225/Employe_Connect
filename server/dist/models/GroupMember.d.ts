import mongoose, { Document } from 'mongoose';
export interface IGroupMember extends Document {
    groupId: string;
    userId: string;
    employeeId: string;
    roleInGroup: 'member' | 'lead' | 'deputy' | 'coordinator' | 'contributor' | 'observer';
    assignmentType: 'permanent' | 'temporary' | 'project-based' | 'rotation';
    effectiveFrom: Date;
    effectiveTo?: Date;
    isPrimary: boolean;
    assignedBy: string;
    assignedAt: Date;
    notes?: string;
    status: 'active' | 'inactive';
}
declare const _default: mongoose.Model<IGroupMember, {}, {}, {}, mongoose.Document<unknown, {}, IGroupMember, {}, {}> & IGroupMember & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=GroupMember.d.ts.map