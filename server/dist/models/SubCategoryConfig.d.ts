import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    requiresApproval: boolean;
    isActive: boolean;
    processingQueue: string;
    specialistQueue: string;
    order: number;
    approvalConfig: {
        l1: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l2: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
        l3: {
            enabled: boolean;
            approvers: mongoose.Types.DocumentArray<{
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }> & {
                name: string;
                employeeId: string;
                email: string;
                designation: string;
            }>;
        };
    };
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=SubCategoryConfig.d.ts.map