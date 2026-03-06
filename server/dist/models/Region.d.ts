import mongoose, { Document } from 'mongoose';
export interface IRegion extends Document {
    name: string;
    countryId: mongoose.Types.ObjectId;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRegion, {}, {}, {}, mongoose.Document<unknown, {}, IRegion, {}, {}> & IRegion & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Region.d.ts.map