import mongoose, { Document } from 'mongoose';
export declare enum HolidayStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export interface IHoliday extends Document {
    name: string;
    date: Date;
    countryId?: mongoose.Types.ObjectId;
    regionId?: mongoose.Types.ObjectId;
    clientId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    groupIds?: mongoose.Types.ObjectId[];
    typeId: mongoose.Types.ObjectId;
    observanceTypeId: mongoose.Types.ObjectId;
    description?: string;
    notes?: string;
    imageUrl?: string;
    status: HolidayStatus;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHoliday, {}, {}, {}, mongoose.Document<unknown, {}, IHoliday, {}, {}> & IHoliday & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Holiday.d.ts.map