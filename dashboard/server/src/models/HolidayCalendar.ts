import mongoose, { Document, Schema } from 'mongoose';

export interface IHoliday {
    name: string;
    date: Date;
    type?: 'PUBLIC' | 'OPTIONAL' | 'REGIONAL';
    description?: string;
}

export interface IHolidayCalendar extends Document {
    title: string;
    year: number;
    country: string;
    state?: string;
    client?: string;
    bannerImage?: string;
    holidays: IHoliday[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const holidaySchema = new Schema<IHoliday>(
    {
        name: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            enum: ['PUBLIC', 'OPTIONAL', 'REGIONAL'],
            default: 'PUBLIC',
        },
        description: {
            type: String,
        },
    },
    { _id: false }
);

const holidayCalendarSchema = new Schema<IHolidayCalendar>(
    {
        title: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
        },
        client: {
            type: String,
        },
        bannerImage: {
            type: String,
        },
        holidays: {
            type: [holidaySchema],
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

// Create compound index for efficient queries
holidayCalendarSchema.index({ year: 1, country: 1, state: 1 });

export const HolidayCalendar = mongoose.model<IHolidayCalendar>(
    'HolidayCalendar',
    holidayCalendarSchema
);
