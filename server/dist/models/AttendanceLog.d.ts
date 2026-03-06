import mongoose, { Document } from 'mongoose';
export interface IAttendanceLog extends Document {
    employeeId: string;
    employeeName: string;
    department: string;
    date: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    breakDuration: number;
    effectiveHours: number;
    grossHours: number;
    status: 'present' | 'absent' | 'wfh' | 'leave' | 'weekly-off' | 'late' | 'half-day';
    isLate: boolean;
    isEarlyLogout: boolean;
    lateMinutes: number;
    hasTimeEntry: boolean;
    workLocation: 'office' | 'wfh' | 'hybrid';
    regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
    regularizationRequestId?: mongoose.Types.ObjectId;
    remarks?: string;
    ipAddress?: string;
    shift?: 'General' | 'USA' | 'UK' | 'MiddleEast';
    shiftTiming?: string;
    approvedBy?: string;
    createdBy?: string;
    updatedBy?: string;
}
declare const _default: mongoose.Model<IAttendanceLog, {}, {}, {}, mongoose.Document<unknown, {}, IAttendanceLog, {}, {}> & IAttendanceLog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AttendanceLog.d.ts.map