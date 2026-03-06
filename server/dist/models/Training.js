"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Training = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const trainingSchema = new mongoose_1.default.Schema({
    trainingId: {
        type: String,
        required: true,
        unique: true
    },
    trainingName: {
        type: String,
        required: true,
        trim: true
    },
    trainingCategory: {
        type: String,
        required: true,
        enum: [
            'Technical',
            'Soft Skills',
            'Leadership',
            'Compliance',
            'Safety',
            'Product Knowledge',
            'Sales & Marketing',
            'Finance & Accounting',
            'HR & Administration',
            'Customer Service',
            'Project Management',
            'Quality Management',
            'Other'
        ]
    },
    description: {
        type: String,
        required: true
    },
    trainerName: {
        type: String,
        required: true
    },
    trainerOrganization: String,
    trainingMode: {
        type: String,
        required: true,
        enum: ['Online', 'Offline', 'Hybrid']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    durationHours: {
        type: Number,
        required: true,
        min: 0
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: 1
    },
    currentEnrollments: {
        type: Number,
        default: 0
    },
    targetDepartments: [String],
    location: String,
    costPerEmployee: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    totalBudget: {
        type: Number,
        default: 0
    },
    certificationAvailable: {
        type: Boolean,
        default: false
    },
    certificationName: String,
    certificationValidityMonths: Number,
    prerequisites: [String],
    trainingMaterials: [{
            name: String,
            url: String,
            type: String // pdf, video, document, etc.
        }],
    status: {
        type: String,
        enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    skillsToBeAcquired: [String],
    targetGrades: [String],
    targetEmploymentTypes: [String], // Permanent, Contract, Intern
    targetLocations: [String],
    feedback: [{
            employeeId: String,
            rating: Number,
            comments: String,
            submittedAt: Date
        }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: String
}, {
    timestamps: true
});
// Indexes for better query performance
trainingSchema.index({ status: 1 });
trainingSchema.index({ startDate: 1, endDate: 1 });
trainingSchema.index({ trainingCategory: 1 });
trainingSchema.index({ targetDepartments: 1 });
trainingSchema.index({ targetLocations: 1 });
exports.Training = mongoose_1.default.model('Training', trainingSchema);
//# sourceMappingURL=Training.js.map