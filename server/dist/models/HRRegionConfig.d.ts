import mongoose, { Document } from 'mongoose';
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
export declare const HRRegionConfig: mongoose.Model<IHRRegionConfig, {}, {}, {}, mongoose.Document<unknown, {}, IHRRegionConfig, {}, {}> & IHRRegionConfig & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=HRRegionConfig.d.ts.map