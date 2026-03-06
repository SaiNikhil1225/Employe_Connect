import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code: string;
    description?: string;
    managerId?: mongoose.Types.ObjectId;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            unique: true,
            trim: true
        },
        code: {
            type: String,
            required: [true, 'Department code is required'],
            unique: true,
            uppercase: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: 'Employee'
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
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ code: 1 });
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ managerId: 1 });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
