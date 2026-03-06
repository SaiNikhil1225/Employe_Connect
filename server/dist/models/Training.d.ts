import mongoose from 'mongoose';
export declare const Training: mongoose.Model<{
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "Completed" | "Cancelled" | "Scheduled" | "Ongoing";
    description: string;
    startDate: NativeDate;
    endDate: NativeDate;
    createdBy: string;
    feedback: mongoose.Types.DocumentArray<{
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }> & {
        comments?: string | null | undefined;
        employeeId?: string | null | undefined;
        submittedAt?: NativeDate | null | undefined;
        rating?: number | null | undefined;
    }>;
    trainingId: string;
    trainingName: string;
    trainingCategory: "Other" | "Technical" | "Soft Skills" | "Leadership" | "Compliance" | "Safety" | "Product Knowledge" | "Sales & Marketing" | "Finance & Accounting" | "HR & Administration" | "Customer Service" | "Project Management" | "Quality Management";
    trainerName: string;
    trainingMode: "Hybrid" | "Online" | "Offline";
    durationHours: number;
    maxParticipants: number;
    currentEnrollments: number;
    targetDepartments: string[];
    costPerEmployee: number;
    totalBudget: number;
    certificationAvailable: boolean;
    prerequisites: string[];
    trainingMaterials: string[];
    skillsToBeAcquired: string[];
    targetGrades: string[];
    targetEmploymentTypes: string[];
    targetLocations: string[];
    averageRating: number;
    location?: string | null | undefined;
    updatedBy?: string | null | undefined;
    trainerOrganization?: string | null | undefined;
    certificationName?: string | null | undefined;
    certificationValidityMonths?: number | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Training.d.ts.map