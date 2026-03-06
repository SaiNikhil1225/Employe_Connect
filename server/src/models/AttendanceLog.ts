import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceLog extends Document {
  employeeId: string;
  employeeName: string;
  department: string;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  breakDuration: number;
  effectiveHours: number;
  grossHours: number;
  status: 'present' | 'absent' | 'wfh' | 'leave' | 'weekly-off' | 'late' | 'half-day';
  isLate: boolean;
  isEarlyLogout: boolean;
  lateMinutes: number;
  hasTimeEntry: boolean;
  workLocation: 'office' | 'wfh' | 'hybrid';
  regularizationStatus: 'none' | 'pending' | 'approved' | 'rejected';
  regularizationRequestId?: mongoose.Types.ObjectId;
  remarks?: string;
  ipAddress?: string;
  shift?: 'General' | 'USA' | 'UK' | 'MiddleEast';
  shiftTiming?: string;
  approvedBy?: string;
  createdBy?: string;
  updatedBy?: string;
}

const attendanceLogSchema = new Schema<IAttendanceLog>({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  breakDuration: {
    type: Number,
    default: 0,
    min: 0
  },
  effectiveHours: {
    type: Number,
    default: 0,
    min: 0
  },
  grossHours: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'wfh', 'leave', 'weekly-off', 'late', 'half-day'],
    default: 'absent',
    required: true
  },
  isLate: {
    type: Boolean,
    default: false
  },
  isEarlyLogout: {
    type: Boolean,
    default: false
  },
  lateMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  hasTimeEntry: {
    type: Boolean,
    default: false
  },
  workLocation: {
    type: String,
    enum: ['office', 'wfh', 'hybrid'],
    default: 'office'
  },
  regularizationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  regularizationRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'RegularizationRequest',
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  shift: {
    type: String,
    enum: ['General', 'USA', 'UK', 'MiddleEast'],
    default: 'General'
  },
  shiftTiming: {
    type: String,
    default: null
  },
  approvedBy: {
    type: String,
    default: null
  },
  remarks: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  updatedBy: String
}, {
  timestamps: true
});

// Compound indexes for efficient querying
attendanceLogSchema.index({ employeeId: 1, date: -1 });
attendanceLogSchema.index({ department: 1, date: -1 });
attendanceLogSchema.index({ status: 1, date: -1 });
attendanceLogSchema.index({ date: -1, status: 1 });

export default mongoose.model<IAttendanceLog>('AttendanceLog', attendanceLogSchema);
