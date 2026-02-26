import mongoose from 'mongoose';

const leavePlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
    unique: true,
    enum: ['Probation', 'Acuvate', 'Confirmation', 'Consultant', 'UK']
  },
  description: {
    type: String,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  leaveTypes: [{
    type: {
      type: String,
      required: true,
      enum: [
        'Casual Leave',
        'Earned Leave',
        'Sick Leave',
        'Compensatory Off',
        'Maternity Leave',
        'Paternity Leave',
        'Bereavement Leave',
        'Marriage Leave',
        'Loss of Pay',
        'Annual Leave'
      ]
    },
    annualAllocation: {
      type: Number,
      required: true,
      default: 0
    },
    accrualType: {
      type: String,
      enum: ['monthly', 'annual', 'on-demand'],
      default: 'annual'
    },
    accrualRate: {
      type: Number, // Days per month for monthly accrual
      default: 0
    },
    carryForwardAllowed: {
      type: Boolean,
      default: false
    },
    maxCarryForward: {
      type: Number,
      default: 0
    },
    carryForwardExpiry: {
      type: String, // e.g., "June 30" or "3 months"
      default: null
    },
    encashmentAllowed: {
      type: Boolean,
      default: false
    },
    maxEncashment: {
      type: Number,
      default: 0
    },
    noticePeriodDays: {
      type: Number,
      default: 0
    },
    maxConsecutiveDays: {
      type: Number,
      default: 365
    },
    requiresMedicalCertificate: {
      type: Boolean,
      default: false
    },
    paidLeave: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to get leave type configuration
leavePlanSchema.methods.getLeaveTypeConfig = function(leaveType: string) {
  return this.leaveTypes.find((lt: { type: string }) => lt.type === leaveType);
};

export default mongoose.model('LeavePlan', leavePlanSchema);
