"use strict";
/**
 * DEPRECATED: This Allocation model is no longer used.
 * Allocation tracking is now handled through FLResource model (FLResource.ts)
 *
 * This file is kept for backward compatibility and reference only.
 * To remove: Delete this file and remove all references to it
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const allocationSchema = new mongoose_1.default.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    projectId: {
        type: String,
        required: true,
        index: true
    },
    allocation: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    role: {
        type: String
    },
    billable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});
// Create compound index for efficient lookups
allocationSchema.index({ employeeId: 1, projectId: 1 });
allocationSchema.index({ status: 1 });
exports.default = mongoose_1.default.model('Allocation', allocationSchema);
//# sourceMappingURL=Allocation.js.map