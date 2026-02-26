import mongoose, { Schema, Document } from 'mongoose';

export interface ITaxIdConfig {
  country: string;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
  pattern?: string;
  maxLength?: number;
}

export interface ICompanySettings extends Document {
  legalEntities: string[];
  locations: Array<{
    name: string;
    country: string;
  }>;
  taxIdConfigs: ITaxIdConfig[];
  departments: string[];
  designations: string[];
  businessUnits: string[];
  lastUpdated: Date;
  updatedBy: string;
}

const CompanySettingsSchema: Schema = new Schema({
  legalEntities: [{
    type: String,
    required: true
  }],
  locations: [{
    name: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  }],
  taxIdConfigs: [{
    country: {
      type: String,
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      required: true
    },
    pattern: String,
    maxLength: Number
  }],
  departments: [String],
  designations: [String],
  businessUnits: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    required: true
  }
});

export default mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);
