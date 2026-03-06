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
const GroupSchema = new mongoose_1.Schema({
    groupId: {
        type: String,
        unique: true,
    },
    groupName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500,
    },
    groupType: {
        type: String,
        required: true,
        enum: ['department', 'project', 'task-force', 'committee', 'cross-functional', 'custom'],
        default: 'custom',
    },
    category: {
        type: String,
        enum: ['technical', 'non-technical', 'leadership', 'support', 'operations', 'sales-marketing', 'finance-admin', ''],
    },
    parentGroupId: {
        type: String,
        ref: 'Group',
    },
    groupLeadId: {
        type: String,
        ref: 'Employee',
    },
    department: String,
    location: String,
    maxMembers: {
        type: Number,
        min: 0,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active',
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'restricted'],
        default: 'public',
    },
    autoAssignNewHires: {
        type: Boolean,
        default: false,
    },
    groupEmail: {
        type: String,
        lowercase: true,
        trim: true,
    },
    slackChannel: String,
    teamsChannel: String,
    createdBy: {
        type: String,
        required: true,
    },
    updatedBy: String,
}, {
    timestamps: true,
});
// Auto-generate groupId before saving
GroupSchema.pre('save', async function (next) {
    if (this.isNew && !this.groupId) {
        const lastGroup = await mongoose_1.default.model('Group').findOne().sort({ groupId: -1 });
        if (lastGroup && lastGroup.groupId) {
            const lastNumber = parseInt(lastGroup.groupId.replace('GRP', ''));
            this.groupId = `GRP${String(lastNumber + 1).padStart(3, '0')}`;
        }
        else {
            this.groupId = 'GRP001';
        }
    }
    next();
});
// Index for better query performance
// Note: groupName already has a unique index from 'unique: true' in schema
GroupSchema.index({ status: 1 });
GroupSchema.index({ groupType: 1 });
GroupSchema.index({ department: 1 });
exports.default = mongoose_1.default.model('Group', GroupSchema);
//# sourceMappingURL=Group.js.map