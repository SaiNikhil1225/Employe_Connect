"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Ticket Counter Model
 * Ensures atomic ticket number generation to prevent race conditions
 */
const ticketCounterSchema = new mongoose_1.default.Schema({
    _id: {
        type: String,
        required: true,
        default: 'ticketNumber'
    },
    sequence: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });
/**
 * Get next ticket number atomically
 * Uses MongoDB's findOneAndUpdate with upsert to ensure thread-safety
 */
ticketCounterSchema.statics.getNextSequence = async function () {
    const counter = await this.findOneAndUpdate({ _id: 'ticketNumber' }, { $inc: { sequence: 1 } }, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
    });
    if (!counter) {
        throw new Error('Failed to generate ticket number');
    }
    // Format: TKT0001, TKT0002, etc.
    return `TKT${String(counter.sequence).padStart(4, '0')}`;
};
exports.default = mongoose_1.default.model('TicketCounter', ticketCounterSchema);
//# sourceMappingURL=TicketCounter.js.map