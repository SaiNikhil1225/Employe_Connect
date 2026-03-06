"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const onboardingChecklistSchema = new mongoose_1.default.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    assignedTo: String, // HR person responsible
    // Pre-Joining Tasks
    preJoiningTasks: {
        offerLetterSent: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            notes: String
        },
        offerLetterAccepted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            notes: String
        },
        backgroundVerificationInitiated: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            notes: String
        },
        backgroundVerificationCompleted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            status: String // 'clear', 'discrepancy', 'pending'
        },
        documentsRequested: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            documentList: [String]
        },
        documentsReceived: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            receivedDocuments: [String]
        }
    },
    // Day 1 Tasks
    day1Tasks: {
        workstationPrepared: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            workstationNumber: String
        },
        welcomeKitPrepared: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            items: [String]
        },
        accessCardIssued: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            cardNumber: String
        },
        welcomeEmailSent: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        buddyAssigned: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            buddyEmployeeId: String,
            buddyName: String
        },
        orientationCompleted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            duration: String
        }
    },
    // IT & System Access Tasks
    itTasks: {
        emailAccountCreated: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            emailAddress: String
        },
        systemAccessProvided: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            systems: [String]
        },
        laptopAssigned: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            assetId: String,
            serialNumber: String
        },
        phoneAssigned: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            phoneNumber: String,
            assetId: String
        },
        softwareInstalled: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            softwareList: [String]
        },
        vpnAccessConfigured: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        }
    },
    // HR & Admin Tasks
    hrTasks: {
        employeeRecordCreated: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        bankDetailsVerified: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        pfAccountCreated: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            pfNumber: String
        },
        esiAccountCreated: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            esiNumber: String
        },
        insuranceEnrollment: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            policyNumber: String
        },
        employeeHandbookShared: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            acknowledged: { type: Boolean, default: false }
        },
        complianceTrainingScheduled: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            trainingDate: Date
        }
    },
    // Training Tasks
    trainingTasks: {
        inductionTrainingScheduled: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            trainingDate: Date
        },
        inductionTrainingCompleted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            feedback: String
        },
        roleSpecificTrainingScheduled: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            trainings: [String]
        },
        safetyTrainingCompleted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        complianceTrainingCompleted: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        }
    },
    // Week 1 Tasks
    week1Tasks: {
        teamIntroduction: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        departmentTour: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        managerMeetingScheduled: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            meetingDate: Date
        },
        goalSettingSession: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String
        },
        firstWeekFeedback: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            feedback: String
        }
    },
    // 30-60-90 Day Check-ins
    milestones: {
        day30CheckIn: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            feedback: String,
            concerns: String
        },
        day60CheckIn: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            feedback: String,
            concerns: String
        },
        day90Review: {
            completed: { type: Boolean, default: false },
            completedDate: Date,
            completedBy: String,
            performanceRating: String,
            feedback: String,
            probationStatus: String // 'confirmed', 'extended', 'terminated'
        }
    },
    // Overall Progress
    progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    // Notes and Comments
    notes: String,
    issues: [String],
}, { timestamps: true });
// Indexes
onboardingChecklistSchema.index({ status: 1 });
onboardingChecklistSchema.index({ assignedTo: 1 });
onboardingChecklistSchema.index({ expectedCompletionDate: 1 });
// Delete the model if it already exists
if (mongoose_1.default.models.OnboardingChecklist) {
    delete mongoose_1.default.models.OnboardingChecklist;
}
exports.default = mongoose_1.default.model('OnboardingChecklist', onboardingChecklistSchema);
//# sourceMappingURL=OnboardingChecklist.js.map