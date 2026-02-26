import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
    name: string;
    code: string;
    regionId?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CountrySchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Country name is required'],
            unique: true,
            trim: true
        },
        code: {
            type: String,
            required: [true, 'Country code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 2,
            maxlength: 3
        },
        regionId: {
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

// Indexes for better query performance
CountrySchema.index({ name: 1 });
CountrySchema.index({ code: 1 });
CountrySchema.index({ isActive: 1 });

export default mongoose.model<ICountry>('Country', CountrySchema);
