import mongoose, { Document, Schema } from 'mongoose';

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

const modulePermissionSchema = new Schema<IModulePermission>(
    {
        employeeId: {
            type: String,
            required: true,
            ref: 'Employee',
        },
        module: {
            type: String,
            required: true,
            enum: ['EMPLOYEE', 'HR', 'RMG', 'HELPDESK', 'LEAVE'],
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        permissions: {
            view: {
                type: Boolean,
                default: false,
            },
            add: {
                type: Boolean,
                default: false,
            },
            modify: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Create compound index for efficient queries
modulePermissionSchema.index({ employeeId: 1, module: 1 }, { unique: true });

export const ModulePermission = mongoose.model<IModulePermission>(
    'ModulePermission',
    modulePermissionSchema
);
