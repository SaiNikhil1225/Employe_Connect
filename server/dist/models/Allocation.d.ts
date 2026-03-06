/**
 * DEPRECATED: This Allocation model is no longer used.
 * Allocation tracking is now handled through FLResource model (FLResource.ts)
 *
 * This file is kept for backward compatibility and reference only.
 * To remove: Delete this file and remove all references to it
 */
import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "cancelled" | "active" | "completed";
    employeeId: string;
    startDate: NativeDate;
    projectId: string;
    allocation: number;
    billable: boolean;
    role?: string | null | undefined;
    endDate?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Allocation.d.ts.map