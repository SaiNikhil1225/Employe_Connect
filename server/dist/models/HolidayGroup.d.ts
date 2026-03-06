import mongoose, { Document } from 'mongoose';
export interface IHolidayGroup extends Document {
    name: string;
    description?: string;
    employeeIds: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHolidayGroup, {}, {}, {}, mongoose.Document<unknown, {}, IHolidayGroup, {}, {}> & IHolidayGroup & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=HolidayGroup.d.ts.map