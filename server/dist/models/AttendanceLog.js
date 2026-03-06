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
const attendanceLogSchema = new mongoose_1.Schema({
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
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    breakDuration: {
        type: Number,
        default: 0,
        min: 0
    },
    effectiveHours: {
        type: Number,
        default: 0,
        min: 0
    },
    grossHours: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'wfh', 'leave', 'weekly-off', 'late', 'half-day'],
        default: 'absent',
        required: true
    },
    isLate: {
        type: Boolean,
        default: false
    },
    isEarlyLogout: {
        type: Boolean,
        default: false
    },
    lateMinutes: {
        type: Number,
        default: 0,
        min: 0
    },
    hasTimeEntry: {
        type: Boolean,
        default: false
    },
    workLocation: {
        type: String,
        enum: ['office', 'wfh', 'hybrid'],
        default: 'office'
    },
    regularizationStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    regularizationRequestId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'RegularizationRequest',
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    shift: {
        type: String,
        enum: ['General', 'USA', 'UK', 'MiddleEast'],
        default: 'General'
    },
    shiftTiming: {
        type: String,
        default: null
    },
    approvedBy: {
        type: String,
        default: null
    },
    remarks: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        default: 'system'
    },
    updatedBy: String
}, {
    timestamps: true
});
// Compound indexes for efficient querying
attendanceLogSchema.index({ employeeId: 1, date: -1 });
attendanceLogSchema.index({ department: 1, date: -1 });
attendanceLogSchema.index({ status: 1, date: -1 });
attendanceLogSchema.index({ date: -1, status: 1 });
exports.default = mongoose_1.default.model('AttendanceLog', attendanceLogSchema);
//# sourceMappingURL=AttendanceLog.js.map