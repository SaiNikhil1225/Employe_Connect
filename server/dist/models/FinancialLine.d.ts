import mongoose from 'mongoose';
declare const FinancialLine: mongoose.Model<{
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "Completed" | "Cancelled" | "Active" | "Draft";
    projectId: mongoose.Types.ObjectId;
    flNo: string;
    flName: string;
    contractType: "T&M" | "Fixed Bid" | "Fixed Monthly" | "License";
    locationType: "Onsite" | "Offshore" | "Hybrid";
    executionEntity: string;
    timesheetApprover: string;
    scheduleStart: NativeDate;
    scheduleFinish: NativeDate;
    currency: string;
    billingRate: number;
    rateUom: "Day" | "Hr" | "Month";
    effortUom: "Day" | "Hr" | "Month";
    revenueAmount: number;
    expectedRevenue: number;
    funding: mongoose.Types.DocumentArray<{
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }> & {
        projectCurrency: string;
        poNo: string;
        contractNo: string;
        poCurrency: string;
        unitRate: number;
        fundingUnits: number;
        uom: "Day" | "Hr" | "Month";
        fundingValueProject: number;
        fundingAmountPoCurrency: number;
        availablePOLineInPO: number;
        availablePOLineInProject: number;
    }>;
    totalFunding: number;
    revenuePlanning: mongoose.Types.DocumentArray<{
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }> & {
        month: string;
        plannedUnits: number;
        plannedRevenue: number;
        actualUnits: number;
        actualRevenue: number;
        forecastedUnits: number;
        forecastedRevenue: number;
    }>;
    totalPlannedRevenue: number;
    paymentMilestones: mongoose.Types.DocumentArray<{
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }> & {
        status: "Pending" | "Paid";
        amount: number;
        milestoneName: string;
        dueDate: NativeDate;
        notes?: string | null | undefined;
    }>;
    notes?: string | null | undefined;
    effort?: number | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
/**
 * Sync all FL statuses based on their scheduleStart / scheduleFinish dates.
 * Called before fetching FLs or syncing project statuses.
 */
export declare function syncFLStatusesByDate(): Promise<number>;
export default FinancialLine;
//# sourceMappingURL=FinancialLine.d.ts.map