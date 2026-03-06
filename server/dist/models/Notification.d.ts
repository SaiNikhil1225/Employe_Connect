import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    type: "system" | "approval" | "leave" | "celebration" | "announcement" | "ticket" | "reminder" | "rejection";
    description: string;
    role: "IT_ADMIN" | "all" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN";
    title: string;
    isRead: boolean;
    meta: any;
    userId?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map