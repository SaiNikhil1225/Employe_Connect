"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'leave',
            'ticket',
            'system',
            'announcement',
            'reminder',
            'celebration',
            'approval',
            'rejection'
        ]
    },
    isRead: {
        type: Boolean,
        default: false
    },
    userId: {
        type: String,
        index: true
    },
    role: {
        type: String,
        required: true,
        enum: [
            'EMPLOYEE',
            'MANAGER',
            'HR',
            'IT_ADMIN',
            'IT_EMPLOYEE',
            'L1_APPROVER',
            'L2_APPROVER',
            'L3_APPROVER',
            'RMG',
            'FINANCE_ADMIN',
            'FACILITIES_ADMIN',
            'SUPER_ADMIN',
            'all'
        ],
        index: true
    },
    meta: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});
// Indexes for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ role: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });
// Virtual property to match frontend expectation of 'id'
notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
// Ensure virtuals are included when converting to JSON
notificationSchema.set('toJSON', {
    virtuals: true
});
exports.default = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=Notification.js.map