import mongoose, { Document, Schema } from 'mongoose';

export interface IGroupMember extends Document {
  groupId: string;
  userId: string;
  employeeId: string;
  roleInGroup: 'member' | 'lead' | 'deputy' | 'coordinator' | 'contributor' | 'observer';
  assignmentType: 'permanent' | 'temporary' | 'project-based' | 'rotation';
  effectiveFrom: Date;
  effectiveTo?: Date;
  isPrimary: boolean;
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
  status: 'active' | 'inactive';
}

const GroupMemberSchema: Schema = new Schema(
  {
    groupId: {
      type: String,
      ref: 'Group',
      required: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      ref: 'Employee',
      required: true,
    },
    roleInGroup: {
      type: String,
      enum: ['member', 'lead', 'deputy', 'coordinator', 'contributor', 'observer'],
      default: 'member',
    },
    assignmentType: {
      type: String,
      enum: ['permanent', 'temporary', 'project-based', 'rotation'],
      default: 'permanent',
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: Date,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    assignedBy: {
      type: String,
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 250,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Composite index to prevent duplicate assignments
GroupMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ groupId: 1, status: 1 });
GroupMemberSchema.index({ userId: 1, status: 1 });
GroupMemberSchema.index({ employeeId: 1 });

export default mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);
