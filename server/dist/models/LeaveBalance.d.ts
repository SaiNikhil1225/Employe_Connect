import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    lastUpdated: NativeDate;
    employeeId: string;
    year: number;
    earnedLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sabbaticalLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    compOff?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    paternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    maternityLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
    sickLeave?: {
        total: number;
        used: number;
        remaining: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=LeaveBalance.d.ts.map