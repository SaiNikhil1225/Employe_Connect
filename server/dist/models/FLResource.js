"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLResource = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MonthAllocationSchema = new mongoose_1.Schema({
    month: { type: String, required: true },
    allocation: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });
const ReleaseHistorySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    type: { type: String, enum: ['full', 'partial'], required: true },
    previousAllocation: { type: Number, required: true },
    newAllocation: { type: Number, required: true },
    releasedBy: { type: String, required: false },
}, { _id: false });
const FLResourceSchema = new mongoose_1.Schema({
    employeeId: {
        type: String,
        required: false,
    },
    resourceName: {
        type: String,
        required: false,
    },
    jobRole: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        required: false,
    },
    skills: {
        type: [String],
        default: [],
    },
    skillRequired: {
        type: String,
        required: false,
    },
    utilizationPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    requestedFromDate: {
        type: Date,
        required: true,
    },
    requestedToDate: {
        type: Date,
        required: true,
    },
    billable: {
        type: Boolean,
        default: true,
    },
    percentageBasis: {
        type: String,
        default: 'Billable',
    },
    monthlyAllocations: {
        type: [MonthAllocationSchema],
        default: [],
    },
    releaseHistory: {
        type: [ReleaseHistorySchema],
        default: [],
    },
    totalAllocation: {
        type: String,
        default: '0:0 Hrs',
    },
    financialLineId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'FinancialLine',
        required: true,
    },
    flNo: {
        type: String,
        required: true,
    },
    flName: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project',
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true,
});
// Indexes for better query performance
FLResourceSchema.index({ financialLineId: 1 });
FLResourceSchema.index({ projectId: 1 });
FLResourceSchema.index({ status: 1 });
FLResourceSchema.index({ name: 1 });
exports.FLResource = mongoose_1.default.model('FLResource', FLResourceSchema);
//# sourceMappingURL=FLResource.js.map