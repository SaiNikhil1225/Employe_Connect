import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "Active" | "Inactive";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    industry: string;
    customerNo: string;
    customerName: string;
    regionHead?: string | null | undefined;
    hubspotRecordId?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Customer.d.ts.map