import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    strict: false;
}> & {
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    strict: false;
}, {
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    strict: false;
}>> & mongoose.FlatRecord<{
    name: string;
    email: string;
    password: string;
    role: "IT_ADMIN" | "employee" | "manager" | "EMPLOYEE" | "MANAGER" | "HR" | "RMG" | "IT_EMPLOYEE" | "L1_APPROVER" | "L2_APPROVER" | "L3_APPROVER" | "SUPER_ADMIN" | "FINANCE_ADMIN" | "FACILITIES_ADMIN" | "admin" | "hr";
    isActive: boolean;
    avatar?: string | null | undefined;
    employeeId?: string | null | undefined;
    department?: string | null | undefined;
    designation?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=User.d.ts.map