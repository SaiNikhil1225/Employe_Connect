"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const celebrationSchema = new mongoose_1.default.Schema({
    celebrationId: { type: String, unique: true },
    employeeId: { type: String, required: true, ref: 'Employee' },
    employeeName: { type: String, required: true },
    department: { type: String },
    location: { type: String },
    eventType: {
        type: String,
        enum: ['birthday', 'anniversary', 'achievement', 'promotion', 'spot-recognition', 'team-award', 'custom'],
        required: true
    },
    eventTitle: { type: String, required: true },
    eventDate: { type: Date, required: true },
    description: { type: String },
    recognitionCategory: {
        type: String,
        enum: ['excellence', 'innovation', 'leadership', 'teamwork', 'customer-service', 'milestone', 'other']
    },
    milestoneYears: { type: Number }, // For anniversaries (1, 5, 10, 15, 20, 25+ years)
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'upcoming', 'celebrated', 'missed'],
        default: 'upcoming'
    },
    visibility: {
        type: String,
        enum: ['public', 'team', 'private'],
        default: 'public'
    },
    notifyEmployee: { type: Boolean, default: true },
    notifyTeam: { type: Boolean, default: false },
    sendEmail: { type: Boolean, default: true },
    awardDetails: { type: String }, // Trophy, certificate, gift details
    budgetAllocated: { type: Number, default: 0 },
    budgetUsed: { type: Number, default: 0 },
    celebratedBy: { type: String }, // HR admin who marked as celebrated
    celebratedDate: { type: Date },
    createdBy: { type: String, required: true },
    message: { type: String },
    avatar: { type: String },
}, { timestamps: true, strict: true });
// Generate unique celebration ID before saving
celebrationSchema.pre('save', async function (next) {
    if (!this.celebrationId) {
        const count = await mongoose_1.default.model('Celebration').countDocuments();
        this.celebrationId = `CEL-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});
exports.default = mongoose_1.default.model('Celebration', celebrationSchema);
//# sourceMappingURL=Celebration.js.map