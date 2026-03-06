import mongoose, { Document } from 'mongoose';
export interface IUDA extends Document {
    udaNumber: string;
    name: string;
    description: string;
    parentUDA: string;
    type: string;
    billable: 'Billable' | 'Non-Billable';
    projectRequired: 'Y' | 'N';
    active: 'Y' | 'N';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUDA, {}, {}, {}, mongoose.Document<unknown, {}, IUDA, {}, {}> & IUDA & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=UDA.d.ts.map