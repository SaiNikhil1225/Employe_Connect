export declare const SHIFTS: {
    General: {
        startTime: string;
        endTime: string;
        workingHours: number;
        graceMinutes: number;
    };
    USA: {
        startTime: string;
        endTime: string;
        workingHours: number;
        graceMinutes: number;
    };
    UK: {
        startTime: string;
        endTime: string;
        workingHours: number;
        graceMinutes: number;
    };
    MiddleEast: {
        startTime: string;
        endTime: string;
        workingHours: number;
        graceMinutes: number;
    };
};
interface DateRange {
    startDate: Date;
    endDate: Date;
}
/**
 * Calculate Employee Attendance KPIs
 */
export declare function calculateEmployeeKPIs(employeeId: string, dateRange: DateRange): Promise<{
    attendanceRate: number;
    punctualityRate: number;
    lateArrivalFrequency: number;
    earlyLogoutFrequency: number;
    totalRequests: number;
    totalWorkingDays: number;
    totalDaysPresent: number;
    onTimeCheckIns: number;
}>;
/**
 * Calculate Manager/HR Team KPIs
 */
export declare function calculateTeamKPIs(filters: {
    department?: string;
    employeeIds?: string[];
}, dateRange: DateRange): Promise<{
    totalEmployees: number;
    totalWorkingDays: number;
    lateArrivalPercentage: number;
    earlyLogoutPercentage: number;
    totalRequests: number;
    avgAttendanceRate: number;
    presentToday: number;
    absentToday: number;
    wfhToday: number;
}>;
/**
 * Check if employee can regularize based on shift timing
 */
export declare function canRegularizeAttendance(log: any): {
    canRegularize: boolean;
    reason: string;
};
/**
 * Enhanced attendance aggregation with shift-based validation
 */
export declare function getEnhancedAttendanceLogs(filters: any, dateRange: DateRange): Promise<{
    canRegularize: boolean;
    regularizationReason: string;
    shiftTiming: string | undefined;
    employeeId: string;
    employeeName: string;
    department: string;
    date: Date;
    checkInTime?: Date | undefined;
    checkOutTime?: Date | undefined;
    breakDuration: number;
    effectiveHours: number;
    grossHours: number;
    status: "present" | "absent" | "wfh" | "leave" | "weekly-off" | "late" | "half-day";
    isLate: boolean;
    isEarlyLogout: boolean;
    lateMinutes: number;
    hasTimeEntry: boolean;
    workLocation: "office" | "wfh" | "hybrid";
    regularizationStatus: "none" | "pending" | "approved" | "rejected";
    regularizationRequestId?: import("mongoose").Types.ObjectId | undefined;
    remarks?: string | undefined;
    ipAddress?: string | undefined;
    shift?: "General" | "USA" | "UK" | "MiddleEast" | undefined;
    approvedBy?: string | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    _id: import("mongoose").FlattenMaps<unknown>;
    $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths> | undefined) => Omit<import("../models/AttendanceLog").IAttendanceLog, keyof Paths> & Paths;
    $clearModifiedPaths: () => import("../models/AttendanceLog").IAttendanceLog;
    $clone: () => import("../models/AttendanceLog").IAttendanceLog;
    $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
    $getAllSubdocs: () => import("mongoose").Document[];
    $ignore: (path: string) => void;
    $isDefault: (path?: string) => boolean;
    $isDeleted: (val?: boolean) => boolean;
    $getPopulatedDocs: () => import("mongoose").Document[];
    $inc: (path: string | string[], val?: number) => import("../models/AttendanceLog").IAttendanceLog;
    $isEmpty: (path: string) => boolean;
    $isValid: (path: string) => boolean;
    $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
    $markValid: (path: string) => void;
    $model: {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
    };
    $op: "save" | "validate" | "remove" | null;
    $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => import("../models/AttendanceLog").IAttendanceLog;
    $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
    $set: {
        (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../models/AttendanceLog").IAttendanceLog;
        (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("../models/AttendanceLog").IAttendanceLog;
        (value: string | Record<string, any>): import("../models/AttendanceLog").IAttendanceLog;
    };
    $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
    baseModelName?: string | undefined;
    collection: import("mongoose").FlattenMaps<import("mongoose").Collection<import("bson").Document>>;
    db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
    deleteOne: (options?: import("mongoose").QueryOptions) => any;
    depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<import("../models/AttendanceLog").IAttendanceLog, Paths>;
    directModifiedPaths: () => Array<string>;
    equals: (doc: import("mongoose").Document<unknown, any, any, Record<string, any>, {}>) => boolean;
    errors?: import("mongoose").Error.ValidationError | undefined;
    get: {
        <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
        (path: string, type?: any, options?: any): any;
    };
    getChanges: () => import("mongoose").UpdateQuery<import("../models/AttendanceLog").IAttendanceLog>;
    id?: any;
    increment: () => import("../models/AttendanceLog").IAttendanceLog;
    init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("../models/AttendanceLog").IAttendanceLog;
    invalidate: {
        <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
    };
    isDirectModified: {
        <T extends string | number | symbol>(path: T | T[]): boolean;
        (path: string | Array<string>): boolean;
    };
    isDirectSelected: {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    isInit: {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    isModified: {
        <T extends string | number | symbol>(path?: T | T[] | undefined, options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
        (path?: string | Array<string>, options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
    };
    isNew: boolean;
    isSelected: {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    markModified: {
        <T extends string | number | symbol>(path: T, scope?: any): void;
        (path: string, scope?: any): void;
    };
    model: {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
    };
    modifiedPaths: (options?: {
        includeChildren?: boolean;
    }) => Array<string>;
    overwrite: (obj: import("mongoose").AnyObject) => import("../models/AttendanceLog").IAttendanceLog;
    $parent: () => import("mongoose").Document | undefined;
    populate: {
        <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("../models/AttendanceLog").IAttendanceLog, Paths>>;
        <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("../models/AttendanceLog").IAttendanceLog, Paths>>;
    };
    populated: (path: string) => any;
    replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("../models/AttendanceLog").IAttendanceLog, {}, unknown, "find", Record<string, never>>;
    save: (options?: import("mongoose").SaveOptions) => Promise<import("../models/AttendanceLog").IAttendanceLog>;
    schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
        [x: number]: unknown;
        [x: symbol]: unknown;
        [x: string]: unknown;
    }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
        [x: number]: unknown;
        [x: symbol]: unknown;
        [x: string]: unknown;
    }>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
        [x: number]: unknown;
        [x: symbol]: unknown;
        [x: string]: unknown;
    }> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    set: {
        <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../models/AttendanceLog").IAttendanceLog;
        (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../models/AttendanceLog").IAttendanceLog;
        (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("../models/AttendanceLog").IAttendanceLog;
        (value: string | Record<string, any>): import("../models/AttendanceLog").IAttendanceLog;
    };
    toJSON: {
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            virtuals: true;
            flattenObjectIds: true;
        }): Omit<{
            [x: string]: any;
        }, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            virtuals: true;
            flattenObjectIds: true;
        }): {
            [x: string]: any;
        };
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            virtuals: true;
        }): Omit<any, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            flattenObjectIds: true;
        }): {
            [x: string]: any;
            [x: number]: any;
            [x: symbol]: any;
        };
        (options: import("mongoose").ToObjectOptions & {
            virtuals: true;
        }): any;
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
        }): Omit<any, "__v">;
        (options?: import("mongoose").ToObjectOptions & {
            flattenMaps?: true;
            flattenObjectIds?: false;
        }): import("mongoose").FlattenMaps<any>;
        (options: import("mongoose").ToObjectOptions & {
            flattenObjectIds: false;
        }): import("mongoose").FlattenMaps<any>;
        (options: import("mongoose").ToObjectOptions & {
            flattenObjectIds: true;
        }): {
            [x: string]: any;
        };
        (options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
        }): any;
        (options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
            flattenObjectIds: true;
        }): any;
        <T = any>(options?: import("mongoose").ToObjectOptions & {
            flattenMaps?: true;
            flattenObjectIds?: false;
        }): import("mongoose").FlattenMaps<T>;
        <T = any>(options: import("mongoose").ToObjectOptions & {
            flattenObjectIds: false;
        }): import("mongoose").FlattenMaps<T>;
        <T = any>(options: import("mongoose").ToObjectOptions & {
            flattenObjectIds: true;
        }): import("mongoose").ObjectIdToString<import("mongoose").FlattenMaps<T>>;
        <T = any>(options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
        }): T;
        <T = any>(options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
            flattenObjectIds: true;
        }): import("mongoose").ObjectIdToString<T>;
    };
    toObject: {
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            virtuals: true;
            flattenObjectIds: true;
        }): Omit<any, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            virtuals: true;
            flattenObjectIds: true;
        }): any;
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            flattenObjectIds: true;
        }): Omit<any, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
            virtuals: true;
        }): Omit<any, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            virtuals: true;
        }): any;
        (options: import("mongoose").ToObjectOptions & {
            versionKey: false;
        }): Omit<any, "__v">;
        (options: import("mongoose").ToObjectOptions & {
            flattenObjectIds: true;
        }): any;
        (options?: import("mongoose").ToObjectOptions): any;
        <T>(options?: import("mongoose").ToObjectOptions): import("mongoose").Require_id<T> & {
            __v: number;
        };
    };
    unmarkModified: {
        <T extends string | number | symbol>(path: T): void;
        (path: string): void;
    };
    updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("../models/AttendanceLog").IAttendanceLog> | undefined, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("../models/AttendanceLog").IAttendanceLog, {}, unknown, "find", Record<string, never>>;
    validate: {
        <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): Promise<void>;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
        }): Promise<void>;
    };
    validateSync: {
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
            [k: string]: any;
        }): import("mongoose").Error.ValidationError | null;
        <T extends string | number | symbol>(pathsToValidate?: T | T[] | undefined, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
    };
    __v: number;
}[]>;
export {};
//# sourceMappingURL=attendanceKPIService.d.ts.map