import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    tax: number;
    paymentStatus: "pending" | "processed" | "paid";
    remarks?: string | null | undefined;
    paymentDate?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Payroll.d.ts.map