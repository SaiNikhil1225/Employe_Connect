import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "in-progress" | "completed" | "not-initiated";
    employeeId: string;
    initiatedDate: NativeDate;
    clearanceFormCompleted: boolean;
    progressPercentage: number;
    issues: string[];
    eligibleForRehire: boolean;
    assignedTo?: string | null | undefined;
    reasonForLeaving?: "Other" | "Better Opportunity" | "Higher Studies" | "Personal Reasons" | "Relocation" | "Health Issues" | "Retirement" | "Company Initiated" | "Contract End" | null | undefined;
    lastWorkingDay?: NativeDate | null | undefined;
    remarks?: string | null | undefined;
    resignationDate?: NativeDate | null | undefined;
    expectedClearanceDate?: NativeDate | null | undefined;
    actualClearanceDate?: NativeDate | null | undefined;
    detailedReason?: string | null | undefined;
    exitInterview?: {
        completed: boolean;
        scheduled: boolean;
        notes?: string | null | undefined;
        feedback?: {
            workEnvironment?: string | null | undefined;
            management?: string | null | undefined;
            compensation?: string | null | undefined;
            careerGrowth?: string | null | undefined;
            workLifeBalance?: string | null | undefined;
            wouldRecommend?: boolean | null | undefined;
            wouldRejoin?: boolean | null | undefined;
            suggestions?: string | null | undefined;
        } | null | undefined;
        completedDate?: NativeDate | null | undefined;
        scheduledDate?: NativeDate | null | undefined;
        conductedBy?: string | null | undefined;
    } | null | undefined;
    itAssetReturn?: {
        otherAssets: mongoose.Types.DocumentArray<{
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }> & {
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
            assetName?: string | null | undefined;
        }>;
        allAssetsReturned: boolean;
        phone?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        laptop?: {
            required: boolean;
            returned: boolean;
            assetId?: string | null | undefined;
            condition?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
        accessCard?: {
            required: boolean;
            returned: boolean;
            cardNumber?: string | null | undefined;
            returnedDate?: NativeDate | null | undefined;
            receivedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    accessRevocation?: {
        allAccessRevoked: boolean;
        emailDisabled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        systemAccessRevoked?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buildingAccessRevoked?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    knowledgeTransfer?: {
        ktsessionScheduled: boolean;
        ktsessionCompleted: boolean;
        documentationProvided: boolean;
        projectHandoverCompleted: boolean;
        notes?: string | null | undefined;
        completedDate?: NativeDate | null | undefined;
        transferredTo?: string | null | undefined;
        transferredToName?: string | null | undefined;
    } | null | undefined;
    hrClearance?: {
        noticePeriodServed: boolean;
        noticePeriodDays?: number | null | undefined;
        shortfallDays?: number | null | undefined;
        pendingLeaves?: number | null | undefined;
        leaveEncashment?: {
            eligible: boolean;
            days?: number | null | undefined;
            amount?: number | null | undefined;
        } | null | undefined;
        pfSettlement?: {
            completed: boolean;
            initiated: boolean;
            initiatedDate?: NativeDate | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        gratuitySettlement?: {
            processed: boolean;
            eligible: boolean;
            amount?: number | null | undefined;
        } | null | undefined;
        finalSettlement?: {
            processed: boolean;
            calculated: boolean;
            calculatedDate?: NativeDate | null | undefined;
            totalAmount?: number | null | undefined;
            processedDate?: NativeDate | null | undefined;
            paymentMode?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    documents?: {
        relievingLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        experienceLetter?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        serviceCertificate?: {
            requested: boolean;
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
        form16?: {
            issued: boolean;
            applicable: boolean;
            issuedDate?: NativeDate | null | undefined;
        } | null | undefined;
        noDueCertificate?: {
            issued: boolean;
            issuedDate?: NativeDate | null | undefined;
            issuedBy?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
    departmentClearances?: {
        financeCleared: boolean;
        itCleared: boolean;
        adminCleared: boolean;
        reportingManagerCleared: boolean;
        hrCleared: boolean;
        financeNotes?: string | null | undefined;
        itNotes?: string | null | undefined;
        adminNotes?: string | null | undefined;
        managerNotes?: string | null | undefined;
        hrNotes?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=OffboardingChecklist.d.ts.map