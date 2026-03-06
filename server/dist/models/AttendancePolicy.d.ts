import mongoose, { Document } from 'mongoose';
export interface IAttendancePolicy extends Document {
    policyName: string;
    workingHoursPerDay: number;
    standardCheckIn: string;
    standardCheckOut: string;
    graceMinutes: number;
    weeklyOffDays: string[];
    breakDuration: number;
    isActive: boolean;
    applicableTo: string[];
    description?: string;
}
declare const _default: mongoose.Model<IAttendancePolicy, {}, {}, {}, mongoose.Document<unknown, {}, IAttendancePolicy, {}, {}> & IAttendancePolicy & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AttendancePolicy.d.ts.map