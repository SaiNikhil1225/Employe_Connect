"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingEnrollment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const trainingEnrollmentSchema = new mongoose_1.default.Schema({
    enrollmentId: {
        type: String,
        required: true,
        unique: true
    },
    trainingId: {
        type: String,
        required: true,
        ref: 'Training',
        index: true
    },
    trainingName: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    employeeName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    designation: String,
    location: String,
    grade: String,
    employmentType: String,
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    enrollmentStatus: {
        type: String,
        enum: ['Enrolled', 'Confirmed', 'Waitlisted', 'Cancelled'],
        default: 'Enrolled'
    },
    trainingCategory: String,
    trainingMode: String,
    startDate: Date,
    endDate: Date,
    durationHours: Number,
    costPerEmployee: Number,
    completionStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled', 'Failed'],
        default: 'Not Started'
    },
    attendancePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    hoursCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    assessmentScore: {
        type: Number,
        min: 0,
        max: 100
    },
    certificationStatus: {
        type: String,
        enum: ['Not Applicable', 'Pending', 'Certified', 'Failed', 'Expired'],
        default: 'Not Applicable'
    },
    certificationDate: Date,
    certificationExpiryDate: Date,
    certificateNumber: String,
    skillsAcquired: [String],
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comments: String,
        submittedAt: Date
    },
    notes: String,
    nominatedBy: String, // Manager or HR who nominated
    approvedBy: String,
    approvalDate: Date
}, {
    timestamps: true
});
// Compound indexes for efficient queries
trainingEnrollmentSchema.index({ trainingId: 1, employeeId: 1 }, { unique: true });
trainingEnrollmentSchema.index({ employeeId: 1, completionStatus: 1 });
trainingEnrollmentSchema.index({ department: 1 });
trainingEnrollmentSchema.index({ location: 1 });
trainingEnrollmentSchema.index({ certificationStatus: 1 });
trainingEnrollmentSchema.index({ startDate: 1, endDate: 1 });
exports.TrainingEnrollment = mongoose_1.default.model('TrainingEnrollment', trainingEnrollmentSchema);
//# sourceMappingURL=TrainingEnrollment.js.map