import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "pending" | "in-progress" | "completed";
    employeeId: string;
    startDate: NativeDate;
    progressPercentage: number;
    issues: string[];
    notes?: string | null | undefined;
    assignedTo?: string | null | undefined;
    expectedCompletionDate?: NativeDate | null | undefined;
    actualCompletionDate?: NativeDate | null | undefined;
    preJoiningTasks?: {
        offerLetterSent?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        offerLetterAccepted?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationInitiated?: {
            completed: boolean;
            notes?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        backgroundVerificationCompleted?: {
            completed: boolean;
            status?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsRequested?: {
            completed: boolean;
            documentList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        documentsReceived?: {
            completed: boolean;
            receivedDocuments: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    day1Tasks?: {
        workstationPrepared?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            workstationNumber?: string | null | undefined;
        } | null | undefined;
        welcomeKitPrepared?: {
            completed: boolean;
            items: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        accessCardIssued?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            cardNumber?: string | null | undefined;
        } | null | undefined;
        welcomeEmailSent?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        buddyAssigned?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            buddyEmployeeId?: string | null | undefined;
            buddyName?: string | null | undefined;
        } | null | undefined;
        orientationCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            duration?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    itTasks?: {
        systemAccessProvided?: {
            completed: boolean;
            systems: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        emailAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            emailAddress?: string | null | undefined;
        } | null | undefined;
        laptopAssigned?: {
            completed: boolean;
            assetId?: string | null | undefined;
            serialNumber?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        phoneAssigned?: {
            completed: boolean;
            phoneNumber?: string | null | undefined;
            assetId?: string | null | undefined;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        softwareInstalled?: {
            completed: boolean;
            softwareList: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        vpnAccessConfigured?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    hrTasks?: {
        employeeRecordCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        bankDetailsVerified?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        pfAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            pfNumber?: string | null | undefined;
        } | null | undefined;
        esiAccountCreated?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            esiNumber?: string | null | undefined;
        } | null | undefined;
        insuranceEnrollment?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            policyNumber?: string | null | undefined;
        } | null | undefined;
        employeeHandbookShared?: {
            completed: boolean;
            acknowledged: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    trainingTasks?: {
        inductionTrainingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            trainingDate?: NativeDate | null | undefined;
        } | null | undefined;
        inductionTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        roleSpecificTrainingScheduled?: {
            completed: boolean;
            trainings: string[];
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        safetyTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        complianceTrainingCompleted?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    week1Tasks?: {
        teamIntroduction?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        departmentTour?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        managerMeetingScheduled?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            meetingDate?: NativeDate | null | undefined;
        } | null | undefined;
        goalSettingSession?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
        firstWeekFeedback?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
        } | null | undefined;
    } | null | undefined;
    milestones?: {
        day30CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day60CheckIn?: {
            completed: boolean;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            concerns?: string | null | undefined;
        } | null | undefined;
        day90Review?: {
            completed: boolean;
            probationStatus?: string | null | undefined;
            completedBy?: string | null | undefined;
            feedback?: string | null | undefined;
            completedDate?: NativeDate | null | undefined;
            performanceRating?: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=OnboardingChecklist.d.ts.map