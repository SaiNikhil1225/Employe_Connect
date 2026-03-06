import mongoose, { Document } from 'mongoose';
export interface ITaxIdConfig {
    country: string;
    fieldName: string;
    fieldLabel: string;
    placeholder: string;
    pattern?: string;
    maxLength?: number;
}
export interface ICompanySettings extends Document {
    legalEntities: string[];
    locations: Array<{
        name: string;
        country: string;
    }>;
    taxIdConfigs: ITaxIdConfig[];
    departments: string[];
    designations: string[];
    businessUnits: string[];
    lastUpdated: Date;
    updatedBy: string;
}
declare const _default: mongoose.Model<ICompanySettings, {}, {}, {}, mongoose.Document<unknown, {}, ICompanySettings, {}, {}> & ICompanySettings & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=CompanySettings.d.ts.map