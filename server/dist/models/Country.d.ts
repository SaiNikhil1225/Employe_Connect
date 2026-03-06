import mongoose, { Document } from 'mongoose';
export interface ICountry extends Document {
    name: string;
    code: string;
    regionId?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICountry, {}, {}, {}, mongoose.Document<unknown, {}, ICountry, {}, {}> & ICountry & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Country.d.ts.map