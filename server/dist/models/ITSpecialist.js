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
const ITSpecialistSchema = new mongoose_1.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['IT_EMPLOYEE'],
        default: 'IT_EMPLOYEE',
    },
    specializations: [{
            type: String,
            trim: true,
        }],
    team: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    activeTicketCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    maxCapacity: {
        type: Number,
        required: true,
        default: 5,
        min: 1,
    },
    phone: {
        type: String,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (_doc, ret) {
            ret.id = ret._id.toString();
            return ret;
        }
    }
});
// Indexes for better query performance
// Note: employeeId and email already have unique indexes from 'unique: true' in schema
ITSpecialistSchema.index({ status: 1 });
ITSpecialistSchema.index({ specializations: 1 });
// Virtual for utilization percentage
ITSpecialistSchema.virtual('utilization').get(function () {
    return this.maxCapacity > 0 ? (this.activeTicketCount / this.maxCapacity) * 100 : 0;
});
exports.default = mongoose_1.default.model('ITSpecialist', ITSpecialistSchema);
//# sourceMappingURL=ITSpecialist.js.map