import mongoose, { Document } from 'mongoose';
export interface IConfigMaster extends Document {
    type: string;
    name: string;
    description?: string;
    status: 'Active' | 'Inactive';
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IConfigMaster, {}, {}, {}, mongoose.Document<unknown, {}, IConfigMaster, {}, {}> & IConfigMaster & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ConfigMaster.d.ts.map