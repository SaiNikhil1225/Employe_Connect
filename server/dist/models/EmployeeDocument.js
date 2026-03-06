"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const employeeDocumentSchema = new mongoose_1.default.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    documentType: {
        type: String,
        required: true,
        enum: [
            // Identity Documents
            'AADHAAR_CARD',
            'PAN_CARD',
            'PASSPORT',
            'DRIVING_LICENSE',
            'VOTER_ID',
            // Educational Documents
            'DEGREE_CERTIFICATE',
            'MARKSHEET',
            'EXPERIENCE_CERTIFICATE',
            'RELIEVING_LETTER',
            // Employment Documents
            'OFFER_LETTER',
            'APPOINTMENT_LETTER',
            'SALARY_SLIP',
            'FORM_16',
            'BANK_STATEMENT',
            // Medical Documents
            'MEDICAL_CERTIFICATE',
            'INSURANCE_CARD',
            'VACCINATION_CERTIFICATE',
            // Other Documents
            'PROFILE_PHOTO',
            'RESUME',
            'REFERENCE_LETTER',
            'OTHER'
        ]
    },
    documentName: {
        type: String,
        required: true
    },
    documentUrl: {
        type: String,
        required: true
    },
    fileSize: Number, // in bytes
    mimeType: String,
    uploadedBy: String,
    uploadedDate: {
        type: Date,
        default: Date.now
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: String,
    verifiedDate: Date,
    rejectionReason: String,
    expiryDate: Date,
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        documentNumber: String, // For documents with numbers (PAN, Aadhaar, etc.)
        issueDate: Date,
        issuingAuthority: String,
        version: {
            type: Number,
            default: 1
        }
    }
}, { timestamps: true });
// Indexes for faster lookups
employeeDocumentSchema.index({ employeeId: 1, documentType: 1 });
employeeDocumentSchema.index({ verificationStatus: 1 });
employeeDocumentSchema.index({ uploadedDate: -1 });
// Delete the model if it already exists to allow re-compilation
if (mongoose_1.default.models.EmployeeDocument) {
    delete mongoose_1.default.models.EmployeeDocument;
}
exports.default = mongoose_1.default.model('EmployeeDocument', employeeDocumentSchema);
//# sourceMappingURL=EmployeeDocument.js.map