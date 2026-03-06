import mongoose, { Document } from 'mongoose';
export interface IDepartment extends Document {
    name: string;
    code: string;
    description?: string;
    managerId?: mongoose.Types.ObjectId;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDepartment, {}, {}, {}, mongoose.Document<unknown, {}, IDepartment, {}, {}> & IDepartment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Department.d.ts.map