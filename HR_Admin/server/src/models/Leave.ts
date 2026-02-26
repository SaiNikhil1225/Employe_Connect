import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  leavePlan: {
    type: String,
    enum: ['Probation', 'Acuvate', 'Confirmation', 'Consultant', 'UK'],
    default: 'Acuvate'
  },
  leaveType: {
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
      'Annual Leave',
      // Legacy support
      'Sabbatical Leave',
      'Comp Off'
    ]
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true,
    min: 0.5
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first_half', 'second_half', null],
    default: null
  },
  durationType: {
    type: String,
    enum: ['full-day', 'half-day-first', 'half-day-second'],
    default: 'full-day'
  },
  reason: String,
  justification: String,
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'in_review'],
    default: 'pending'
  },
  appliedOn: {
    type: Date,
    default: Date.now
  },
  approvedBy: String,
  approvedOn: {
    type: Date
  },
  rejectedBy: String,
  rejectedOn: {
    type: Date
  },
  rejectionReason: String,
  cancelledBy: String,
  cancelledOn: {
    type: Date
  },
  cancellationReason: String,
  remarks: String,
  managerId: {
    type: String,
    required: false,  // Not required - HR/senior employees may not have a manager
    default: null
  },
  managerName: String,
  hrNotified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  notes: String,
  attachments: [{
    fileName: String,
    url: String,
    type: {
      type: String,
      enum: ['medical', 'birth_certificate', 'justification']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster lookups
leaveSchema.index({ employeeId: 1, status: 1 });
leaveSchema.index({ status: 1, appliedOn: -1 });
leaveSchema.index({ managerId: 1, status: 1 });

// Virtual property to match frontend expectation of 'id'
leaveSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included when converting to JSON
leaveSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.model('Leave', leaveSchema);
