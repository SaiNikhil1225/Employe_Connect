import mongoose, { Document } from 'mongoose';
export interface IGroup extends Document {
    groupId: string;
    groupName: string;
    description: string;
    groupType: 'department' | 'project' | 'task-force' | 'committee' | 'cross-functional' | 'custom';
    category?: string;
    parentGroupId?: string;
    groupLeadId?: string;
    department?: string;
    location?: string;
    maxMembers?: number;
    status: 'active' | 'inactive' | 'archived';
    visibility: 'public' | 'private' | 'restricted';
    autoAssignNewHires: boolean;
    groupEmail?: string;
    slackChannel?: string;
    teamsChannel?: string;
    createdBy: string;
    updatedBy?: string;
}
declare const _default: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup, {}, {}> & IGroup & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Group.d.ts.map