import mongoose from 'mongoose';
declare const CustomerPO: mongoose.Model<{
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "Closed" | "Active" | "Expired";
    projectId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    poNo: string;
    contractNo: string;
    poCurrency: string;
    bookingEntity: string;
    poCreationDate: NativeDate;
    poStartDate: NativeDate;
    poValidityDate: NativeDate;
    poAmount: number;
    paymentTerms: "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Immediate" | "Custom";
    autoRelease: boolean;
    notes?: string | null | undefined;
    customerName?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default CustomerPO;
//# sourceMappingURL=CustomerPO.d.ts.map