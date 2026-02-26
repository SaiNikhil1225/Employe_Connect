import mongoose from 'mongoose';

const leaveBalanceAdjustmentSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true
  },
  leaveType: {
    type: String,
    required: true
  },
  adjustmentType: {
    type: String,
    required: true,
    enum: ['Add', 'Deduct', 'Allocate', 'Reset', 'Carry Forward']
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  adjustedBy: {
    type: String,
    required: true // Employee ID of HR admin who made the adjustment
  },
  adjustedByName: {
    type: String,
    required: true
  },
  balanceBefore: {
    allocated: { type: Number, default: 0 },
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  balanceAfter: {
    allocated: { type: Number, default: 0 },
    accrued: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for querying by employee and year
leaveBalanceAdjustmentSchema.index({ employeeId: 1, year: 1 });
leaveBalanceAdjustmentSchema.index({ adjustedBy: 1 });

export default mongoose.model('LeaveBalanceAdjustment', leaveBalanceAdjustmentSchema);
