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
const mongoose_1 = __importStar(require("mongoose"));
const TimesheetEntrySchema = new mongoose_1.Schema({
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    projectId: { type: String, required: true },
    projectCode: { type: String, required: true },
    projectName: { type: String, required: true },
    udaId: { type: String, required: true },
    udaName: { type: String, required: true },
    type: { type: String, required: true },
    financialLineItem: { type: String, required: true },
    billable: { type: String, required: true },
    hours: { type: String, required: true },
    comment: { type: String, default: null },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'submitted',
        index: true
    },
    submittedAt: { type: Date },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'revision_requested'],
        default: 'pending',
        index: true
    },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    rejectedReason: { type: String },
}, {
    timestamps: true,
});
// Compound indexes for efficient queries
TimesheetEntrySchema.index({ employeeId: 1, date: 1 });
TimesheetEntrySchema.index({ projectId: 1, date: 1 });
TimesheetEntrySchema.index({ approvalStatus: 1, submittedAt: 1 });
TimesheetEntrySchema.index({ billable: 1, date: 1 });
// Note: Removed unique constraint to allow multiple entries per day for different projects/categories
// This enables employees to split their time across multiple tasks on the same day
TimesheetEntrySchema.index({ employeeId: 1, date: 1, projectId: 1, udaId: 1 });
exports.default = mongoose_1.default.model('TimesheetEntry', TimesheetEntrySchema);
//# sourceMappingURL=TimesheetEntry.js.map