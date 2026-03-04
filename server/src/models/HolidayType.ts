import mongoose, { Schema, Document } from 'mongoose';

export interface IHolidayType extends Document {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const HolidayTypeSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Holiday type name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes
// Note: name already has a unique index from 'unique: true' in schema
HolidayTypeSchema.index({ isActive: 1 });

export default mongoose.model<IHolidayType>('HolidayType', HolidayTypeSchema);
