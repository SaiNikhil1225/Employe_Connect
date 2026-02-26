import mongoose from 'mongoose';

const leaveTypeBalanceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  allocated: {
    type: Number,
    default: 0,
    min: 0
  },
  accrued: {
    type: Number,
    default: 0,
    min: 0
  },
  used: {
    type: Number,
    default: 0,
    min: 0
  },
  pending: {
    type: Number,
    default: 0,
    min: 0
  },
  available: {
    type: Number,
    default: 0,
    min: 0
  },
  carriedForward: {
    type: Number,
    default: 0,
    min: 0
  },
  carryForwardExpiry: {
    type: Date,
    default: null
  }
}, { _id: false });

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  leavePlan: {
    type: String,
    required: true,
    enum: ['Probation', 'Acuvate', 'Confirmation', 'Consultant', 'UK'],
    default: 'Acuvate'
  },
  leaveTypes: [leaveTypeBalanceSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastAccrualDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for employee and year
leaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

// Method to get balance for a specific leave type
leaveBalanceSchema.methods.getLeaveTypeBalance = function(leaveType: string) {
  return this.leaveTypes.find((lt: { type: string }) => lt.type === leaveType);
};

// Method to update balance for a specific leave type
leaveBalanceSchema.methods.updateLeaveTypeBalance = function(leaveType: string, updates: Partial<{
  allocated: number;
  accrued: number;
  used: number;
  pending: number;
  carriedForward: number;
  carryForwardExpiry: Date;
}>) {
  const leaveTypeBalance = this.leaveTypes.find((lt: { type: string }) => lt.type === leaveType);
  
  if (!leaveTypeBalance) {
    // Create new leave type balance if it doesn't exist
    this.leaveTypes.push({
      type: leaveType,
      allocated: 0,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 0,
      carriedForward: 0,
      carryForwardExpiry: null,
      ...updates
    });
  } else {
    // Update existing leave type balance
    Object.assign(leaveTypeBalance, updates);
  }
  
  // Recalculate available balance
  const ltb = this.leaveTypes.find((lt: { type: string }) => lt.type === leaveType);
  if (ltb) {
    ltb.available = (ltb.accrued || ltb.allocated) + ltb.carriedForward - ltb.used - ltb.pending;
  }
  
  this.lastUpdated = new Date();
};

// Method to apply leave (move from available to pending)
leaveBalanceSchema.methods.applyLeave = function(leaveType: string, days: number) {
  const leaveTypeBalance = this.getLeaveTypeBalance(leaveType);
  
  if (!leaveTypeBalance) {
    throw new Error(`Leave type ${leaveType} not found`);
  }
  
  if (leaveTypeBalance.available < days) {
    throw new Error(`Insufficient leave balance. Available: ${leaveTypeBalance.available}, Requested: ${days}`);
  }
  
  leaveTypeBalance.pending += days;
  leaveTypeBalance.available = (leaveTypeBalance.accrued || leaveTypeBalance.allocated) + leaveTypeBalance.carriedForward - leaveTypeBalance.used - leaveTypeBalance.pending;
  this.lastUpdated = new Date();
};

// Method to approve leave (move from pending to used)
leaveBalanceSchema.methods.approveLeave = function(leaveType: string, days: number) {
  const leaveTypeBalance = this.getLeaveTypeBalance(leaveType);
  
  if (!leaveTypeBalance) {
    throw new Error(`Leave type ${leaveType} not found`);
  }
  
  leaveTypeBalance.pending = Math.max(0, leaveTypeBalance.pending - days);
  leaveTypeBalance.used += days;
  leaveTypeBalance.available = (leaveTypeBalance.accrued || leaveTypeBalance.allocated) + leaveTypeBalance.carriedForward - leaveTypeBalance.used - leaveTypeBalance.pending;
  this.lastUpdated = new Date();
};

// Method to reject/cancel leave (move from pending back to available)
leaveBalanceSchema.methods.rejectLeave = function(leaveType: string, days: number) {
  const leaveTypeBalance = this.getLeaveTypeBalance(leaveType);
  
  if (!leaveTypeBalance) {
    throw new Error(`Leave type ${leaveType} not found`);
  }
  
  leaveTypeBalance.pending = Math.max(0, leaveTypeBalance.pending - days);
  leaveTypeBalance.available = (leaveTypeBalance.accrued || leaveTypeBalance.allocated) + leaveTypeBalance.carriedForward - leaveTypeBalance.used - leaveTypeBalance.pending;
  this.lastUpdated = new Date();
};

export default mongoose.model('LeaveBalance', leaveBalanceSchema);
