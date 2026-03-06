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
const regularizationRequestSchema = new mongoose_1.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    employeeName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    requestType: {
        type: String,
        enum: ['late-arrival', 'early-departure', 'missing-punch', 'wfh-conversion', 'general-regularization'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    proposedCheckIn: {
        type: Date,
        default: null
    },
    proposedCheckOut: {
        type: Date,
        default: null
    },
    originalCheckIn: {
        type: Date,
        default: null
    },
    originalCheckOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    approvedBy: String,
    approvedAt: Date,
    rejectedBy: String,
    rejectedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});
// Indexes
regularizationRequestSchema.index({ employeeId: 1, status: 1 });
regularizationRequestSchema.index({ status: 1, createdAt: -1 });
regularizationRequestSchema.index({ department: 1, status: 1 });
exports.default = mongoose_1.default.model('RegularizationRequest', regularizationRequestSchema);
//# sourceMappingURL=RegularizationRequest.js.map