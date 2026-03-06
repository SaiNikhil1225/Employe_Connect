import mongoose, { Document } from 'mongoose';
export interface IModulePermission extends Document {
    employeeId: string;
    module: 'EMPLOYEE' | 'HR' | 'RMG' | 'HELPDESK' | 'LEAVE';
    enabled: boolean;
    isAdmin: boolean;
    permissions: {
        view: boolean;
        add: boolean;
        modify: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ModulePermission: mongoose.Model<IModulePermission, {}, {}, {}, mongoose.Document<unknown, {}, IModulePermission, {}, {}> & IModulePermission & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ModulePermission.d.ts.map