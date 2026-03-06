import mongoose, { Document } from 'mongoose';
export interface IHoliday {
    name: string;
    date: Date;
    type?: 'PUBLIC' | 'OPTIONAL' | 'REGIONAL';
    description?: string;
}
export interface IHolidayCalendar extends Document {
    title: string;
    year: number;
    country: string;
    state?: string;
    client?: string;
    bannerImage?: string;
    holidays: IHoliday[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const HolidayCalendar: mongoose.Model<IHolidayCalendar, {}, {}, {}, mongoose.Document<unknown, {}, IHolidayCalendar, {}, {}> & IHolidayCalendar & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=HolidayCalendar.d.ts.map