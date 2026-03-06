import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    status: "pending" | "cancelled" | "approved" | "rejected" | "in_review";
    attachments: mongoose.Types.DocumentArray<{
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }> & {
        uploadedAt: NativeDate;
        type?: "justification" | "medical" | "birth_certificate" | null | undefined;
        fileName?: string | null | undefined;
        url?: string | null | undefined;
    }>;
    employeeId: string;
    startDate: NativeDate;
    endDate: NativeDate;
    employeeName: string;
    leaveType: "Paternity Leave" | "Earned Leave" | "Sabbatical Leave" | "Comp Off" | "Maternity Leave" | "Sick Leave";
    days: number;
    appliedOn: NativeDate;
    expiresAt: NativeDate;
    managerId: string;
    isHalfDay: boolean;
    halfDayType: "first_half" | "second_half" | null;
    hrNotified: boolean;
    notes?: string | null | undefined;
    managerName?: string | null | undefined;
    remarks?: string | null | undefined;
    approvedBy?: string | null | undefined;
    reason?: string | null | undefined;
    approvedOn?: NativeDate | null | undefined;
    justification?: string | null | undefined;
    rejectedBy?: string | null | undefined;
    rejectionReason?: string | null | undefined;
    cancelledBy?: string | null | undefined;
    cancellationReason?: string | null | undefined;
    rejectedOn?: NativeDate | null | undefined;
    cancelledOn?: NativeDate | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=Leave.d.ts.map