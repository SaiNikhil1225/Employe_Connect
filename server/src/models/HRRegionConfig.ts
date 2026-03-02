import mongoose, { Document, Schema } from 'mongoose';

export interface IFieldConfig {
    name: string;
    label: string;
    required: boolean;
    regex?: string;
    message?: string;
    fieldType?: 'text' | 'number' | 'date' | 'select' | 'file';
    options?: string[];
}

export interface IHRRegionConfig extends Document {
    region: 'INDIA' | 'US' | 'UK' | 'MIDDLE_EAST' | 'OTHER';
    fields: IFieldConfig[];
    departments: string[];
    designations: string[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const fieldConfigSchema = new Schema<IFieldConfig>(
    {
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
        required: {
            type: Boolean,
            default: false,
        },
        regex: {
            type: String,
        },
        message: {
            type: String,
        },
        fieldType: {
            type: String,
            enum: ['text', 'number', 'date', 'select', 'file'],
            default: 'text',
        },
        options: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const hrRegionConfigSchema = new Schema<IHRRegionConfig>(
    {
        region: {
            type: String,
            required: true,
            enum: ['INDIA', 'US', 'UK', 'MIDDLE_EAST', 'OTHER'],
            unique: true,
        },
        fields: {
            type: [fieldConfigSchema],
            default: [],
        },
        departments: {
            type: [String],
            default: [],
        },
        designations: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const HRRegionConfig = mongoose.model<IHRRegionConfig>(
    'HRRegionConfig',
    hrRegionConfigSchema
);
