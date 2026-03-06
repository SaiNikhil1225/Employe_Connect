import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    strict: true;
}> & {
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    strict: true;
}, {
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    strict: true;
}>> & mongoose.FlatRecord<{
    date: string;
    status: "Leave" | "Holiday" | "Present" | "Absent" | "Half Day" | "Late" | "Weekend";
    employeeId: string;
    notes?: string | null | undefined;
    checkIn?: string | null | undefined;
    checkOut?: string | null | undefined;
    workHours?: number | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Attendance.d.ts.map