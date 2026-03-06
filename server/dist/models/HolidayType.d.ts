import mongoose, { Document } from 'mongoose';
export interface IHolidayType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHolidayType, {}, {}, {}, mongoose.Document<unknown, {}, IHolidayType, {}, {}> & IHolidayType & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=HolidayType.d.ts.map