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
const TimesheetRowSchema = new mongoose_1.Schema({
    projectId: { type: String, required: true },
    projectCode: { type: String, required: true },
    projectName: { type: String, required: true },
    udaId: { type: String, required: true },
    udaName: { type: String, required: true },
    type: { type: String },
    financialLineItem: { type: String, required: true },
    billable: { type: String, required: true },
    hours: [{ type: String }],
    comments: [{ type: String }],
});
const TimesheetSchema = new mongoose_1.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    rows: [TimesheetRowSchema],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'draft'
        // Note: Single-field indexes removed - using compound indexes below for better query performance
    },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: String },
    rejectionReason: { type: String },
    totalHours: { type: Number, default: 0 },
}, {
    timestamps: true,
});
// Compound index for finding timesheet by employee and week
TimesheetSchema.index({ employeeId: 1, weekStartDate: 1 });
exports.default = mongoose_1.default.model('Timesheet', TimesheetSchema);
//# sourceMappingURL=Timesheet.js.map