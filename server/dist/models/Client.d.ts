import mongoose, { Document } from 'mongoose';
export interface IClient extends Document {
    name: string;
    code: string;
    regionId?: mongoose.Types.ObjectId;
    countryId: mongoose.Types.ObjectId;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, {}> & IClient & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Client.d.ts.map