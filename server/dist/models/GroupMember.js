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
const GroupMemberSchema = new mongoose_1.Schema({
    groupId: {
        type: String,
        ref: 'Group',
        required: true,
    },
    userId: {
        type: String,
        ref: 'User',
        required: true,
    },
    employeeId: {
        type: String,
        ref: 'Employee',
        required: true,
    },
    roleInGroup: {
        type: String,
        enum: ['member', 'lead', 'deputy', 'coordinator', 'contributor', 'observer'],
        default: 'member',
    },
    assignmentType: {
        type: String,
        enum: ['permanent', 'temporary', 'project-based', 'rotation'],
        default: 'permanent',
    },
    effectiveFrom: {
        type: Date,
        default: Date.now,
    },
    effectiveTo: Date,
    isPrimary: {
        type: Boolean,
        default: false,
    },
    assignedBy: {
        type: String,
        required: true,
    },
    assignedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        maxlength: 250,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});
// Composite index to prevent duplicate assignments
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ groupId: 1, status: 1 });
GroupMemberSchema.index({ userId: 1, status: 1 });
GroupMemberSchema.index({ employeeId: 1 });
exports.default = mongoose_1.default.model('GroupMember', GroupMemberSchema);
//# sourceMappingURL=GroupMember.js.map