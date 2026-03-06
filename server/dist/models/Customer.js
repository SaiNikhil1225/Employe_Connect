"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const customerSchema = new mongoose_1.default.Schema({
    customerNo: {
        type: String,
        required: [true, 'Customer number is required'],
        unique: true,
        trim: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    hubspotRecordId: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        trim: true
    },
    region: {
        type: String,
        required: [true, 'Region is required'],
        enum: ['UK', 'India', 'USA', 'ME', 'Other'],
        default: 'Other'
    },
    regionHead: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});
// Index for faster searches
customerSchema.index({ customerName: 'text', customerNo: 'text' });
customerSchema.index({ status: 1 });
customerSchema.index({ region: 1 });
exports.default = mongoose_1.default.model('Customer', customerSchema);
//# sourceMappingURL=Customer.js.map