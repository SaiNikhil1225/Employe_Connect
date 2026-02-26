import mongoose from 'mongoose';

const offboardingChecklistSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['not-initiated', 'in-progress', 'completed'],
    default: 'not-initiated'
  },
  initiatedDate: {
    type: Date,
    default: Date.now
  },
  resignationDate: Date,
  lastWorkingDay: Date,
  expectedClearanceDate: Date,
  actualClearanceDate: Date,
  assignedTo: String, // HR person responsible
  reasonForLeaving: {
    type: String,
    enum: [
      'Better Opportunity',
      'Higher Studies',
      'Personal Reasons',
      'Relocation',
      'Health Issues',
      'Retirement',
      'Company Initiated',
      'Contract End',
      'Other'
    ]
  },
  detailedReason: String,
  
  // Exit Interview
  exitInterview: {
    scheduled: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    conductedBy: String,
    feedback: {
      workEnvironment: String,
      management: String,
      compensation: String,
      careerGrowth: String,
      workLifeBalance: String,
      wouldRecommend: Boolean,
      wouldRejoin: Boolean,
      suggestions: String
    },
    notes: String
  },
  
  // IT Asset Return
  itAssetReturn: {
    laptop: {
      required: { type: Boolean, default: false },
      assetId: String,
      returned: { type: Boolean, default: false },
      returnedDate: Date,
      condition: String,
      receivedBy: String
    },
    phone: {
      required: { type: Boolean, default: false },
      assetId: String,
      returned: { type: Boolean, default: false },
      returnedDate: Date,
      condition: String,
      receivedBy: String
    },
    accessCard: {
      required: { type: Boolean, default: false },
      cardNumber: String,
      returned: { type: Boolean, default: false },
      returnedDate: Date,
      receivedBy: String
    },
    otherAssets: [{
      assetName: String,
      assetId: String,
      returned: { type: Boolean, default: false },
      returnedDate: Date,
      condition: String,
      receivedBy: String
    }],
    allAssetsReturned: {
      type: Boolean,
      default: false
    }
  },
  
  // Access Revocation
  accessRevocation: {
    emailDisabled: {
      completed: { type: Boolean, default: false },
      completedDate: Date,
      completedBy: String
    },
    systemAccessRevoked: {
      completed: { type: Boolean, default: false },
      completedDate: Date,
      completedBy: String,
      systems: [String]
    },
    vpnAccessRevoked: {
      completed: { type: Boolean, default: false },
      completedDate: Date,
      completedBy: String
    },
    buildingAccessRevoked: {
      completed: { type: Boolean, default: false },
      completedDate: Date,
      completedBy: String
    },
    allAccessRevoked: {
      type: Boolean,
      default: false
    }
  },
  
  // Knowledge Transfer
  knowledgeTransfer: {
    ktsessionScheduled: {
      type: Boolean,
      default: false
    },
    ktsessionCompleted: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    transferredTo: String,
    transferredToName: String,
    documentationProvided: {
      type: Boolean,
      default: false
    },
    projectHandoverCompleted: {
      type: Boolean,
      default: false
    },
    notes: String
  },
  
  // HR Clearance
  hrClearance: {
    noticePeriodServed: {
      type: Boolean,
      default: false
    },
    noticePeriodDays: Number,
    shortfallDays: Number,
    pendingLeaves: Number,
    leaveEncashment: {
      eligible: { type: Boolean, default: false },
      days: Number,
      amount: Number
    },
    pfSettlement: {
      initiated: { type: Boolean, default: false },
      initiatedDate: Date,
      completed: { type: Boolean, default: false },
      completedDate: Date
    },
    gratuitySettlement: {
      eligible: { type: Boolean, default: false },
      amount: Number,
      processed: { type: Boolean, default: false }
    },
    finalSettlement: {
      calculated: { type: Boolean, default: false },
      calculatedDate: Date,
      totalAmount: Number,
      processed: { type: Boolean, default: false },
      processedDate: Date,
      paymentMode: String
    }
  },
  
  // Document Issuance
  documents: {
    relievingLetter: {
      requested: { type: Boolean, default: false },
      issued: { type: Boolean, default: false },
      issuedDate: Date,
      issuedBy: String
    },
    experienceLetter: {
      requested: { type: Boolean, default: false },
      issued: { type: Boolean, default: false },
      issuedDate: Date,
      issuedBy: String
    },
    serviceCertificate: {
      requested: { type: Boolean, default: false },
      issued: { type: Boolean, default: false },
      issuedDate: Date,
      issuedBy: String
    },
    form16: {
      applicable: { type: Boolean, default: false },
      issued: { type: Boolean, default: false },
      issuedDate: Date
    },
    noDueCertificate: {
      issued: { type: Boolean, default: false },
      issuedDate: Date,
      issuedBy: String
    }
  },
  
  // Department Clearances
  departmentClearances: {
    financeCleared: {
      type: Boolean,
      default: false
    },
    financeNotes: String,
    itCleared: {
      type: Boolean,
      default: false
    },
    itNotes: String,
    adminCleared: {
      type: Boolean,
      default: false
    },
    adminNotes: String,
    reportingManagerCleared: {
      type: Boolean,
      default: false
    },
    managerNotes: String,
    hrCleared: {
      type: Boolean,
      default: false
    },
    hrNotes: String
  },
  
  // Overall Status
  clearanceFormCompleted: {
    type: Boolean,
    default: false
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Additional Information
  eligibleForRehire: {
    type: Boolean,
    default: true
  },
  remarks: String,
  issues: [String],
  
}, { timestamps: true });

// Indexes
offboardingChecklistSchema.index({ status: 1 });
offboardingChecklistSchema.index({ assignedTo: 1 });
offboardingChecklistSchema.index({ lastWorkingDay: 1 });

// Delete the model if it already exists
if (mongoose.models.OffboardingChecklist) {
  delete mongoose.models.OffboardingChecklist;
}

export default mongoose.model('OffboardingChecklist', offboardingChecklistSchema);
