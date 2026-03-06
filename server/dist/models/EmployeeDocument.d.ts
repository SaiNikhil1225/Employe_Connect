import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    employeeId: string;
    isActive: boolean;
    documentUrl: string;
    documentType: "AADHAAR_CARD" | "PAN_CARD" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "DEGREE_CERTIFICATE" | "MARKSHEET" | "EXPERIENCE_CERTIFICATE" | "RELIEVING_LETTER" | "OFFER_LETTER" | "APPOINTMENT_LETTER" | "SALARY_SLIP" | "FORM_16" | "BANK_STATEMENT" | "MEDICAL_CERTIFICATE" | "INSURANCE_CARD" | "VACCINATION_CERTIFICATE" | "PROFILE_PHOTO" | "RESUME" | "REFERENCE_LETTER" | "OTHER";
    documentName: string;
    uploadedDate: NativeDate;
    verificationStatus: "pending" | "rejected" | "verified";
    notes?: string | null | undefined;
    expiryDate?: NativeDate | null | undefined;
    rejectionReason?: string | null | undefined;
    fileSize?: number | null | undefined;
    mimeType?: string | null | undefined;
    uploadedBy?: string | null | undefined;
    verifiedBy?: string | null | undefined;
    verifiedDate?: NativeDate | null | undefined;
    metadata?: {
        version: number;
        issueDate?: NativeDate | null | undefined;
        documentNumber?: string | null | undefined;
        issuingAuthority?: string | null | undefined;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=EmployeeDocument.d.ts.map