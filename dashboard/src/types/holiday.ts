/**
 * Holiday Calendar Module Type Definitions
 * Comprehensive types for multi-level holiday configuration system
 */

export enum HolidayStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export interface Country {
    _id: string;
    name: string;
    code: string;
    regionId?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Region {
    _id: string;
    name: string;
    countryId: Country | string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    _id: string;
    name: string;
    code: string;
    regionId: Region | string;
    countryId: Country | string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    _id: string;
    name: string;
    code: string;
    description?: string;
    managerId?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface HolidayType {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ObservanceType {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface HolidayGroup {
    _id: string;
    name: string;
    description?: string;
    employeeIds: string[];
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Holiday {
    _id: string;
    name: string;
    date: string | Date;
    countryId?: Country | string;
    regionId?: Region | string;
    clientId?: Client | string;
    departmentId?: Department | string;
    groupIds?: (HolidayGroup | string)[];
    typeId: HolidayType | string;
    observanceTypeId: ObservanceType | string;
    description?: string;
    notes?: string;
    imageUrl?: string;
    status: HolidayStatus;
    isActive: boolean;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    approvedBy?: {
        _id: string;
        name: string;
        email: string;
    };
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface HolidayFormData {
    name: string;
    date: string | Date;
    countryId?: string;
    regionId?: string;
    regionIds?: string[]; // Multiple regions support
    clientId?: string;
    departmentId?: string;
    groupIds?: string[];
    typeId: string;
    observanceTypeId: string;
    description?: string;
    notes?: string;
    imageUrl?: string;
    imageFile?: File; // File upload support
    isGlobal?: boolean; // Explicit global flag
    applyToAllRegions?: boolean; // Apply to all regions in country
}

export interface HolidayFilters {
    status?: HolidayStatus;
    countryId?: string;
    regionId?: string;
    clientId?: string;
    groupId?: string;
    year?: number | 'all';
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface HolidayListResponse {
    holidays: Holiday[];
    pagination: PaginationInfo;
}

export interface ConfigFormData {
    name: string;
    code?: string;
    description?: string;
    countryId?: string;
    regionId?: string;
}

// Stats for dashboard
export interface HolidayStats {
    totalDrafts: number;
    totalPublished: number;
    totalArchived: number;
    upcomingHolidays: number;
    byCountry: Record<string, number>;
    byType: Record<string, number>;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface HolidaysResponse {
    success: boolean;
    data: HolidayListResponse;
    message?: string;
}

export interface SingleHolidayResponse {
    success: boolean;
    data: Holiday;
    message?: string;
}

export interface ConfigListResponse<T> {
    success: boolean;
    data: T[];
    message?: string;
}
