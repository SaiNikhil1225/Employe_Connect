import mongoose, { Schema, Document } from 'mongoose';

export interface IHolidayGroup extends Document {
    name: string;
    description?: string;
    employeeIds: mongoose.Types.ObjectId[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const HolidayGroupSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Holiday group name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        employeeIds: [{
            type: Schema.Types.ObjectId,
            ref: 'Employee'
        }],
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
HolidayGroupSchema.index({ isActive: 1 });
HolidayGroupSchema.index({ employeeIds: 1 });

export default mongoose.model<IHolidayGroup>('HolidayGroup', HolidayGroupSchema);
