import mongoose, { Document } from 'mongoose';
export interface IITSpecialist extends Document {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: 'IT_EMPLOYEE';
    specializations: string[];
    team: string;
    status: 'active' | 'inactive';
    activeTicketCount: number;
    maxCapacity: number;
    phone: string;
    designation: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IITSpecialist, {}, {}, {}, mongoose.Document<unknown, {}, IITSpecialist, {}, {}> & IITSpecialist & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ITSpecialist.d.ts.map