"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: [
            'EMPLOYEE',
            'HR',
            'RMG',
            'MANAGER',
            'IT_ADMIN',
            'FINANCE_ADMIN',
            'FACILITIES_ADMIN',
            'IT_EMPLOYEE',
            'L1_APPROVER',
            'L2_APPROVER',
            'L3_APPROVER',
            'SUPER_ADMIN',
            'admin',
            'employee',
            'manager',
            'hr'
        ]
    },
    department: String,
    designation: String,
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: String,
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true, strict: false });
// Note: email and employeeId already have indexes from 'unique: true' in schema
exports.default = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map