import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendancePolicy extends Document {
  policyName: string;
  workingHoursPerDay: number;
  standardCheckIn: string;
  standardCheckOut: string;
  graceMinutes: number;
  weeklyOffDays: string[];
  breakDuration: number;
  isActive: boolean;
  applicableTo: string[];
  description?: string;
}

const attendancePolicySchema = new Schema<IAttendancePolicy>({
  policyName: {
    type: String,
    required: true,
    unique: true
  },
  workingHoursPerDay: {
    type: Number,
    required: true,
    default: 9,
    min: 1,
    max: 24
  },
  standardCheckIn: {
    type: String,
    required: true,
    default: '10:00 AM'
  },
  standardCheckOut: {
    type: String,
    required: true,
    default: '7:00 PM'
  },
  graceMinutes: {
    type: Number,
    default: 15,
    min: 0,
    max: 60
  },
  weeklyOffDays: {
    type: [String],
    default: ['Sunday'],
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  breakDuration: {
    type: Number,
    default: 60,
    min: 0,
    max: 180
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableTo: {
    type: [String],
    default: ['all']
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model<IAttendancePolicy>('AttendancePolicy', attendancePolicySchema);
