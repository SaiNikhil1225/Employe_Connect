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
exports.HolidayStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var HolidayStatus;
(function (HolidayStatus) {
    HolidayStatus["DRAFT"] = "DRAFT";
    HolidayStatus["PUBLISHED"] = "PUBLISHED";
    HolidayStatus["ARCHIVED"] = "ARCHIVED";
})(HolidayStatus || (exports.HolidayStatus = HolidayStatus = {}));
const HolidaySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Holiday name is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Holiday date is required']
    },
    countryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Country'
    },
    regionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Region'
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Client'
    },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Department'
    },
    groupIds: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'HolidayGroup'
        }],
    typeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'HolidayType',
        required: [true, 'Holiday type is required']
    },
    observanceTypeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ObservanceType',
        required: [true, 'Observance type is required']
    },
    description: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: Object.values(HolidayStatus),
        default: HolidayStatus.DRAFT
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});
// Compound indexes for better query performance
HolidaySchema.index({ date: 1, status: 1 });
HolidaySchema.index({ countryId: 1, date: 1 });
HolidaySchema.index({ regionId: 1, date: 1 });
HolidaySchema.index({ clientId: 1, date: 1 });
HolidaySchema.index({ status: 1, isActive: 1 });
HolidaySchema.index({ createdBy: 1 });
HolidaySchema.index({ typeId: 1 });
HolidaySchema.index({ observanceTypeId: 1 });
HolidaySchema.index({ groupIds: 1 });
// Compound index for employee visibility query
HolidaySchema.index({
    countryId: 1,
    regionId: 1,
    clientId: 1,
    status: 1,
    date: 1
});
exports.default = mongoose_1.default.model('Holiday', HolidaySchema);
//# sourceMappingURL=Holiday.js.map