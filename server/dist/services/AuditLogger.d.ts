/**
 * Audit Logging Service
 * Centralized logging for sensitive operations across the application
 * Provides structured audit trails for security, compliance, and debugging
 */
import mongoose from 'mongoose';
export declare const AuditLog: mongoose.Model<{
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    strict: true;
}> & {
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    strict: true;
}, {
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    strict: true;
}>> & mongoose.FlatRecord<{
    timestamp: NativeDate;
    action: string;
    category: "SYSTEM" | "ADMIN" | "SECURITY" | "AUTHENTICATION" | "DATA" | "USER_ACTION";
    eventType: "OTHER" | "AUTH_LOGIN_SUCCESS" | "AUTH_LOGIN_FAILURE" | "AUTH_LOGOUT" | "AUTH_PASSWORD_CHANGE" | "AUTH_PASSWORD_RESET" | "AUTH_TOKEN_REFRESH" | "AUTH_SESSION_EXPIRED" | "USER_CREATED" | "USER_UPDATED" | "USER_DELETED" | "USER_ROLE_CHANGED" | "USER_STATUS_CHANGED" | "USER_ACCESS_GRANTED" | "USER_ACCESS_REVOKED" | "TICKET_CREATED" | "TICKET_UPDATED" | "TICKET_APPROVED" | "TICKET_REJECTED" | "TICKET_ASSIGNED" | "TICKET_ESCALATED" | "TICKET_RESOLVED" | "TICKET_CLOSED" | "TICKET_CANCELLED" | "TICKET_DELETED" | "DATA_EXPORT" | "DATA_IMPORT" | "REPORT_GENERATED" | "SENSITIVE_DATA_ACCESS" | "ADMIN_CONFIG_CHANGE" | "ADMIN_SYSTEM_SETTING" | "ADMIN_BULK_OPERATION" | "SECURITY_RATE_LIMIT_HIT" | "SECURITY_INVALID_TOKEN" | "SECURITY_UNAUTHORIZED_ACCESS" | "SECURITY_SUSPICIOUS_ACTIVITY" | "FILE_UPLOADED" | "FILE_DOWNLOADED" | "FILE_DELETED";
    metadata: any;
    eventId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description?: string | null | undefined;
    response?: {
        statusCode?: number | null | undefined;
        success?: boolean | null | undefined;
        errorMessage?: string | null | undefined;
    } | null | undefined;
    actor?: {
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        userEmail?: string | null | undefined;
        ipAddress?: string | null | undefined;
        userRole?: string | null | undefined;
        userAgent?: string | null | undefined;
        sessionId?: string | null | undefined;
    } | null | undefined;
    target?: {
        entityType?: string | null | undefined;
        entityId?: string | null | undefined;
        entityName?: string | null | undefined;
    } | null | undefined;
    changes?: {
        before?: any;
        after?: any;
    } | null | undefined;
    request?: {
        query?: any;
        method?: string | null | undefined;
        path?: string | null | undefined;
        body?: any;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export interface AuditLogDocument {
    eventId: string;
    eventType: string;
    actor?: AuditActor | null;
    target?: AuditTarget | null;
    action: string;
    description?: string | null;
    changes?: AuditChanges | null;
    metadata?: Record<string, unknown> | null;
    request?: AuditRequest | null;
    response?: AuditResponse | null;
    severity: AuditSeverity;
    category: AuditCategory;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    [key: string]: unknown;
}
export interface AuditActor {
    userId?: string | null;
    userName?: string | null;
    userEmail?: string | null;
    userRole?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    sessionId?: string | null;
}
export interface AuditTarget {
    entityType?: string | null;
    entityId?: string | null;
    entityName?: string | null;
}
export interface AuditChanges {
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
}
export interface AuditRequest {
    method?: string | null;
    path?: string | null;
    query?: Record<string, unknown> | null;
    body?: Record<string, unknown> | null;
}
export interface AuditResponse {
    statusCode?: number | null;
    success?: boolean | null;
    errorMessage?: string | null;
}
export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AuditCategory = 'SECURITY' | 'AUTHENTICATION' | 'DATA' | 'ADMIN' | 'USER_ACTION' | 'SYSTEM';
export interface AuditLogEntry {
    eventType: string;
    action: string;
    description?: string;
    actor?: AuditActor;
    target?: AuditTarget;
    changes?: AuditChanges;
    metadata?: Record<string, unknown>;
    request?: AuditRequest;
    response?: AuditResponse;
    severity?: AuditSeverity;
    category?: AuditCategory;
}
/**
 * Audit Logger Service
 */
declare class AuditLoggerService {
    /**
     * Sanitize request body by removing sensitive fields
     */
    private sanitizeBody;
    /**
     * Create an audit log entry
     */
    log(entry: AuditLogEntry): Promise<void>;
    /**
     * Log authentication event
     */
    logAuth(eventType: 'AUTH_LOGIN_SUCCESS' | 'AUTH_LOGIN_FAILURE' | 'AUTH_LOGOUT' | 'AUTH_PASSWORD_CHANGE' | 'AUTH_PASSWORD_RESET', actor: AuditActor, success: boolean, errorMessage?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log user management event
     */
    logUserEvent(eventType: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_ROLE_CHANGED' | 'USER_STATUS_CHANGED' | 'USER_ACCESS_GRANTED' | 'USER_ACCESS_REVOKED', actor: AuditActor, target: AuditTarget, changes?: AuditChanges, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log ticket event
     */
    logTicketEvent(eventType: 'TICKET_CREATED' | 'TICKET_UPDATED' | 'TICKET_APPROVED' | 'TICKET_REJECTED' | 'TICKET_ASSIGNED' | 'TICKET_ESCALATED' | 'TICKET_RESOLVED' | 'TICKET_CLOSED' | 'TICKET_CANCELLED' | 'TICKET_DELETED', actor: AuditActor, ticketId: string, ticketNumber: string, changes?: AuditChanges, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log security event
     */
    logSecurityEvent(eventType: 'SECURITY_RATE_LIMIT_HIT' | 'SECURITY_INVALID_TOKEN' | 'SECURITY_UNAUTHORIZED_ACCESS' | 'SECURITY_SUSPICIOUS_ACTIVITY', actor: AuditActor, description: string, request?: AuditRequest, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log data access event
     */
    logDataAccess(eventType: 'DATA_EXPORT' | 'DATA_IMPORT' | 'REPORT_GENERATED' | 'SENSITIVE_DATA_ACCESS', actor: AuditActor, description: string, target?: AuditTarget, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Query audit logs
     */
    query(filters: {
        eventType?: string;
        actorUserId?: string;
        targetEntityType?: string;
        targetEntityId?: string;
        severity?: AuditSeverity;
        category?: AuditCategory;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        skip?: number;
    }): Promise<{
        logs: AuditLogDocument[];
        total: number;
    }>;
    /**
     * Get audit logs for a specific entity
     */
    getEntityHistory(entityType: string, entityId: string): Promise<AuditLogDocument[]>;
    /**
     * Get user activity log
     */
    getUserActivity(userId: string, limit?: number): Promise<AuditLogDocument[]>;
}
export declare const auditLogger: AuditLoggerService;
export default auditLogger;
//# sourceMappingURL=AuditLogger.d.ts.map