"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const projectSchema = new mongoose_1.default.Schema({
    projectId: {
        type: String,
        required: true,
        unique: true
    },
    projectName: {
        type: String,
        required: [true, 'Project name is required'],
        maxlength: 100
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    accountName: {
        type: String,
        required: true
    },
    legalEntity: {
        type: String,
        required: true
    },
    hubspotDealId: {
        type: String
    },
    billingType: {
        type: String,
        required: true,
        enum: ['T&M', 'Fixed Bid', 'Fixed Monthly', 'License']
    },
    practiceUnit: {
        type: String,
        required: true,
        enum: ['AiB & Automation', 'GenAI', 'Data & Analytics', 'Cloud Engineering', 'Other']
    },
    region: {
        type: String,
        required: true,
        enum: ['UK', 'India', 'USA', 'ME', 'Other']
    },
    projectManager: {
        employeeId: String,
        name: String
    },
    deliveryManager: {
        employeeId: String,
        name: String
    },
    dealOwner: {
        employeeId: String,
        name: String
    },
    industry: {
        type: String
    },
    regionHead: {
        type: String
    },
    leadSource: {
        type: String
    },
    clientType: {
        type: String
    },
    revenueType: {
        type: String
    },
    projectWonThroughRFP: {
        type: Boolean,
        default: false
    },
    projectStartDate: {
        type: Date,
        required: [true, 'Project start date is required']
    },
    projectEndDate: {
        type: Date,
        required: [true, 'Project end date is required']
    },
    projectCurrency: {
        type: String,
        required: true,
        enum: ['USD', 'GBP', 'INR', 'EUR', 'AED']
    },
    estimatedValue: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'On Hold', 'Closed'],
        default: 'Draft'
    },
    // Legacy fields (keep for backward compatibility)
    description: {
        type: String
    },
    budget: {
        type: Number
    },
    utilization: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    requiredSkills: [{
            type: String
        }],
    teamSize: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
// Indexes
projectSchema.index({ customerId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ region: 1 });
projectSchema.index({ billingType: 1 });
projectSchema.index({ projectStartDate: 1, projectEndDate: 1 });
// Validation: Project end date must be after start date
projectSchema.pre('save', function (next) {
    if (this.projectEndDate && this.projectStartDate && this.projectEndDate < this.projectStartDate) {
        next(new Error('Project end date must be after start date'));
    }
    else {
        next();
    }
});
exports.default = mongoose_1.default.model('Project', projectSchema);
//# sourceMappingURL=Project.js.map