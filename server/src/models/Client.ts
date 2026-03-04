import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
    name: string;
    code: string;
    regionId?: mongoose.Types.ObjectId;
    countryId: mongoose.Types.ObjectId;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true
        },
        code: {
            type: String,
            required: [true, 'Client code is required'],
            unique: true,
            uppercase: true,
            trim: true
        },
        regionId: {
            type: Schema.Types.ObjectId,
            ref: 'Region'
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: [true, 'Country is required']
        },
        contactPerson: {
            type: String,
            trim: true
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        contactPhone: {
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

// Compound unique index
ClientSchema.index({ name: 1, regionId: 1 }, { unique: true });
// Note: code already has a unique index from 'unique: true' in schema
ClientSchema.index({ regionId: 1 });
ClientSchema.index({ countryId: 1 });
ClientSchema.index({ isActive: 1 });

export default mongoose.model<IClient>('Client', ClientSchema);
