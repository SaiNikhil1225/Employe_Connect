import mongoose, { Schema, Document } from 'mongoose';

export enum HolidayStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface IHoliday extends Document {
  name: string;
  date: Date;
  countryId?: mongoose.Types.ObjectId;
  regionId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  groupIds?: mongoose.Types.ObjectId[];
  typeId: mongoose.Types.ObjectId;
  observanceTypeId: mongoose.Types.ObjectId;
  description?: string;
  notes?: string;
  imageUrl?: string;
  status: HolidayStatus;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Holiday name is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Holiday date is required']
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country'
    },
    regionId: {
      type: Schema.Types.ObjectId,
      ref: 'Region'
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    groupIds: [{
      type: Schema.Types.ObjectId,
      ref: 'HolidayGroup'
    }],
    typeId: {
      type: Schema.Types.ObjectId,
      ref: 'HolidayType',
      required: [true, 'Holiday type is required']
    },
    observanceTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'ObservanceType',
      required: [true, 'Observance type is required']
    },
    description: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(HolidayStatus),
      default: HolidayStatus.DRAFT
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for better query performance
HolidaySchema.index({ date: 1, status: 1 });
HolidaySchema.index({ countryId: 1, date: 1 });
HolidaySchema.index({ regionId: 1, date: 1 });
HolidaySchema.index({ clientId: 1, date: 1 });
HolidaySchema.index({ status: 1, isActive: 1 });
HolidaySchema.index({ createdBy: 1 });
HolidaySchema.index({ typeId: 1 });
HolidaySchema.index({ observanceTypeId: 1 });
HolidaySchema.index({ groupIds: 1 });

// Compound index for employee visibility query
HolidaySchema.index({
  countryId: 1,
  regionId: 1,
  clientId: 1,
  status: 1,
  date: 1
});

export default mongoose.model<IHoliday>('Holiday', HolidaySchema);
