"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const newJoinerSchema = new mongoose_1.default.Schema({
    employeeId: String,
    name: String,
    designation: String,
    department: String,
    joiningDate: String,
    avatar: String,
}, { timestamps: true, strict: false });
exports.default = mongoose_1.default.model('NewJoiner', newJoinerSchema);
//# sourceMappingURL=NewJoiner.js.map