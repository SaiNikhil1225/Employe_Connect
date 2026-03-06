"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const payrollSchema = new mongoose_1.default.Schema({
    employeeId: {
        type: String,
        required: true,
        index: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});
// Create compound index for efficient lookups
payrollSchema.index({ employeeId: 1, year: 1, month: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Payroll', payrollSchema);
//# sourceMappingURL=Payroll.js.map