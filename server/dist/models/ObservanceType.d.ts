import mongoose, { Document } from 'mongoose';
export interface IObservanceType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IObservanceType, {}, {}, {}, mongoose.Document<unknown, {}, IObservanceType, {}, {}> & IObservanceType & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ObservanceType.d.ts.map