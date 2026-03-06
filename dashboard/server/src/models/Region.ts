import mongoose, { Schema, Document } from 'mongoose';

export interface IRegion extends Document {
    name: string;
    countryId: mongoose.Types.ObjectId;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RegionSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Region name is required'],
            trim: true
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country is required']
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

// Compound unique index to prevent duplicate region names within same country
RegionSchema.index({ name: 1, countryId: 1 }, { unique: true });
RegionSchema.index({ countryId: 1 });
RegionSchema.index({ isActive: 1 });

export default mongoose.model<IRegion>('Region', RegionSchema);
