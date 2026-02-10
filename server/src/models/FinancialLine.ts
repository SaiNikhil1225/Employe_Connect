import mongoose from 'mongoose';

const fundingAllocationSchema = new mongoose.Schema({
  poNo: {
    type: String,
    required: true,
    trim: true
  },
  contractNo: {
    type: String,
    required: true,
    trim: true
  },
  projectCurrency: {
    type: String,
    required: true
  },
  poCurrency: {
    type: String,
    required: true
  },
  unitRate: {
    type: Number,
    required: true,
    min: 0
  },
  fundingUnits: {
    type: Number,
    required: true,
    min: 0
  },
  uom: {
    type: String,
    required: true,
    enum: ['Hr', 'Day', 'Month']
  },
  fundingValueProject: {
    type: Number,
    required: true,
    min: 0
  },
  fundingAmountPoCurrency: {
    type: Number,
    default: 0
  },
  availablePOLineInPO: {
    type: Number,
    default: 0
  },
  availablePOLineInProject: {
    type: Number,
    default: 0
  }
}, { _id: false });

const revenuePlanningSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true
  },
  plannedUnits: {
    type: Number,
    default: 0,
    min: 0
  },
  plannedRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  actualUnits: {
    type: Number,
    default: 0,
    min: 0
  },
  actualRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  forecastedUnits: {
    type: Number,
    default: 0,
    min: 0
  },
  forecastedRevenue: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const paymentMilestoneSchema = new mongoose.Schema({
  milestoneName: {
    type: String,
    required: [true, 'Milestone name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Milestone amount is required'],
    min: [0.01, 'Milestone amount must be greater than 0']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  }
}, { _id: false });

const financialLineSchema = new mongoose.Schema({
  flNo: {
    type: String,
    required: [true, 'FL number is required'],
    unique: true,
    trim: true
  },
  flName: {
    type: String,
    required: [true, 'FL name is required'],
    maxlength: [150, 'FL name cannot exceed 150 characters'],
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  contractType: {
    type: String,
    required: [true, 'Contract type is required'],
    enum: ['T&M', 'Fixed Bid', 'Fixed Monthly', 'License']
  },
  locationType: {
    type: String,
    required: [true, 'Location type is required'],
    enum: ['Onsite', 'Offshore', 'Hybrid']
  },
  executionEntity: {
    type: String,
    required: [true, 'Execution entity is required'],
    trim: true
  },
  timesheetApprover: {
    type: String,
    required: [true, 'Timesheet approver is required'],
    trim: true
  },
  scheduleStart: {
    type: Date,
    required: [true, 'Schedule start date is required']
  },
  scheduleFinish: {
    type: Date,
    required: [true, 'Schedule finish date is required']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD'
  },
  // Revenue Details
  billingRate: {
    type: Number,
    required: [true, 'Billing rate is required'],
    min: [0.01, 'Billing rate must be greater than 0']
  },
  rateUom: {
    type: String,
    required: [true, 'Rate UOM is required'],
    enum: ['Hr', 'Day', 'Month']
  },
  effort: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Effort cannot be negative']
  },
  effortUom: {
    type: String,
    required: [true, 'Effort UOM is required'],
    enum: ['Hr', 'Day', 'Month']
  },
  revenueAmount: {
    type: Number,
    required: true,
    min: 0
  },
  expectedRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  // Funding
  funding: [fundingAllocationSchema],
  totalFunding: {
    type: Number,
    default: 0,
    min: 0
  },
  // Revenue Planning
  revenuePlanning: [revenuePlanningSchema],
  totalPlannedRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  // Payment Milestones
  paymentMilestones: [paymentMilestoneSchema],
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
financialLineSchema.index({ projectId: 1 });
// Note: flNo already has an index from 'unique: true' in schema
financialLineSchema.index({ status: 1 });

// Pre-save validation: scheduleStart < scheduleFinish
financialLineSchema.pre('save', function(next) {
  if (this.scheduleStart && this.scheduleFinish) {
    if (this.scheduleStart >= this.scheduleFinish) {
      next(new Error('Schedule start date must be before schedule finish date'));
      return;
    }
  }
  
  next();
});

const FinancialLine = mongoose.model('FinancialLine', financialLineSchema);

export default FinancialLine;
