"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const attendanceSchema = new mongoose_1.default.Schema({
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Holiday', 'Weekend'], required: true },
    checkIn: String,
    checkOut: String,
    workHours: Number,
    notes: String,
}, { timestamps: true, strict: true }); // Changed from false to true for data integrity
exports.default = mongoose_1.default.model('Attendance', attendanceSchema);
//# sourceMappingURL=Attendance.js.map