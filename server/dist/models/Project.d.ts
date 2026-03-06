import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "On Hold" | "Closed" | "Active" | "Draft";
    legalEntity: string;
    utilization: number;
    projectId: string;
    projectName: string;
    customerId: mongoose.Types.ObjectId;
    accountName: string;
    billingType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    practiceUnit: "Other" | "AiB & Automation" | "GenAI" | "Data & Analytics" | "Cloud Engineering";
    region: "UK" | "USA" | "Other" | "India" | "ME";
    projectWonThroughRFP: boolean;
    projectStartDate: NativeDate;
    projectEndDate: NativeDate;
    projectCurrency: "USD" | "GBP" | "INR" | "EUR" | "AED";
    requiredSkills: string[];
    teamSize: number;
    description?: string | null | undefined;
    budget?: number | null | undefined;
    hubspotDealId?: string | null | undefined;
    projectManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    deliveryManager?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    dealOwner?: {
        name?: string | null | undefined;
        employeeId?: string | null | undefined;
    } | null | undefined;
    industry?: string | null | undefined;
    regionHead?: string | null | undefined;
    leadSource?: string | null | undefined;
    clientType?: string | null | undefined;
    revenueType?: string | null | undefined;
    estimatedValue?: number | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Project.d.ts.map