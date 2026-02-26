import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  groupId: string;
  groupName: string;
  description: string;
  groupType: 'department' | 'project' | 'task-force' | 'committee' | 'cross-functional' | 'custom';
  category?: string;
  parentGroupId?: string;
  groupLeadId?: string;
  department?: string;
  location?: string;
  maxMembers?: number;
  status: 'active' | 'inactive' | 'archived';
  visibility: 'public' | 'private' | 'restricted';
  autoAssignNewHires: boolean;
  groupEmail?: string;
  slackChannel?: string;
  teamsChannel?: string;
  createdBy: string;
  updatedBy?: string;
}

const GroupSchema: Schema = new Schema(
  {
    groupId: {
      type: String,
      unique: true,
    },
    groupName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    groupType: {
      type: String,
      required: true,
      enum: ['department', 'project', 'task-force', 'committee', 'cross-functional', 'custom'],
      default: 'custom',
    },
    category: {
      type: String,
      enum: ['technical', 'non-technical', 'leadership', 'support', 'operations', 'sales-marketing', 'finance-admin', ''],
    },
    parentGroupId: {
      type: String,
      ref: 'Group',
    },
    groupLeadId: {
      type: String,
      ref: 'Employee',
    },
    department: String,
    location: String,
    maxMembers: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted'],
      default: 'public',
    },
    autoAssignNewHires: {
      type: Boolean,
      default: false,
    },
    groupEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    slackChannel: String,
    teamsChannel: String,
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: String,
  },
  {
    timestamps: true,
  }
);

// Auto-generate groupId before saving
GroupSchema.pre('save', async function (next) {
  if (this.isNew && !this.groupId) {
    const lastGroup = await mongoose.model('Group').findOne().sort({ groupId: -1 });
    
    if (lastGroup && lastGroup.groupId) {
      const lastNumber = parseInt(lastGroup.groupId.replace('GRP', ''));
      this.groupId = `GRP${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      this.groupId = 'GRP001';
    }
  }
  next();
});

// Index for better query performance
GroupSchema.index({ groupName: 1 });
GroupSchema.index({ status: 1 });
GroupSchema.index({ groupType: 1 });
GroupSchema.index({ department: 1 });

export default mongoose.model<IGroup>('Group', GroupSchema);
