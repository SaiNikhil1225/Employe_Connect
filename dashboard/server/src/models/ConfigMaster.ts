import mongoose, { Schema, Document } from 'mongoose';

export interface IConfigMaster extends Document {
  type: string; // revenue-type, client-type, lead-source, billing-type, project-currency
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigMasterSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['revenue-type', 'client-type', 'lead-source', 'billing-type', 'project-currency'],
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    },
    createdBy: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique name per type (case-insensitive)
ConfigMasterSchema.index({ type: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

// Method to check if name already exists for a type
ConfigMasterSchema.statics.nameExists = async function(type: string, name: string, excludeId?: string) {
  const query: Record<string, unknown> = {
    type,
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const exists = await this.findOne(query);
  return !!exists;
};

export default mongoose.model<IConfigMaster>('ConfigMaster', ConfigMasterSchema);
