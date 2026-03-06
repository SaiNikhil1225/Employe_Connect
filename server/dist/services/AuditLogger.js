"use strict";
/**
 * Audit Logging Service
 * Centralized logging for sensitive operations across the application
 * Provides structured audit trails for security, compliance, and debugging
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.AuditLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Audit Log Schema
const auditLogSchema = new mongoose_1.default.Schema({
    // Event identification
    eventId: {
        type: String,
        required: true,
        unique: true,
        default: () => `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            // Authentication events
            'AUTH_LOGIN_SUCCESS',
            'AUTH_LOGIN_FAILURE',
            'AUTH_LOGOUT',
            'AUTH_PASSWORD_CHANGE',
            'AUTH_PASSWORD_RESET',
            'AUTH_TOKEN_REFRESH',
            'AUTH_SESSION_EXPIRED',
            // User management
            'USER_CREATED',
            'USER_UPDATED',
            'USER_DELETED',
            'USER_ROLE_CHANGED',
            'USER_STATUS_CHANGED',
            'USER_ACCESS_GRANTED',
            'USER_ACCESS_REVOKED',
            // Helpdesk events
            'TICKET_CREATED',
            'TICKET_UPDATED',
            'TICKET_APPROVED',
            'TICKET_REJECTED',
            'TICKET_ASSIGNED',
            'TICKET_ESCALATED',
            'TICKET_RESOLVED',
            'TICKET_CLOSED',
            'TICKET_CANCELLED',
            'TICKET_DELETED',
            // Data access events
            'DATA_EXPORT',
            'DATA_IMPORT',
            'REPORT_GENERATED',
            'SENSITIVE_DATA_ACCESS',
            // Admin operations
            'ADMIN_CONFIG_CHANGE',
            'ADMIN_SYSTEM_SETTING',
            'ADMIN_BULK_OPERATION',
            // Security events
            'SECURITY_RATE_LIMIT_HIT',
            'SECURITY_INVALID_TOKEN',
            'SECURITY_UNAUTHORIZED_ACCESS',
            'SECURITY_SUSPICIOUS_ACTIVITY',
            // File operations
            'FILE_UPLOADED',
            'FILE_DOWNLOADED',
            'FILE_DELETED',
            // Generic
            'OTHER'
        ]
    },
    // Actor information (who performed the action)
    actor: {
        userId: String,
        userName: String,
        userEmail: String,
        userRole: String,
        ipAddress: String,
        userAgent: String,
        sessionId: String,
    },
    // Target information (what was affected)
    target: {
        entityType: String, // 'User', 'Ticket', 'Employee', etc.
        entityId: String,
        entityName: String,
    },
    // Event details
    action: {
        type: String,
        required: true
    },
    description: String,
    // Change tracking
    changes: {
        before: mongoose_1.default.Schema.Types.Mixed,
        after: mongoose_1.default.Schema.Types.Mixed,
    },
    // Metadata
    metadata: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    },
    // Request context
    request: {
        method: String,
        path: String,
        query: mongoose_1.default.Schema.Types.Mixed,
        body: mongoose_1.default.Schema.Types.Mixed, // Sanitized - no passwords/tokens
    },
    // Response context
    response: {
        statusCode: Number,
        success: Boolean,
        errorMessage: String,
    },
    // Classification
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW'
    },
    category: {
        type: String,
        enum: ['SECURITY', 'AUTHENTICATION', 'DATA', 'ADMIN', 'USER_ACTION', 'SYSTEM'],
        default: 'USER_ACTION'
    },
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
}, {
    timestamps: true,
    strict: true
});
// Indexes for efficient querying
auditLogSchema.index({ 'actor.userId': 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ 'target.entityType': 1, 'target.entityId': 1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
// TTL index to auto-delete old logs (keep for 1 year)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
exports.AuditLog = mongoose_1.default.model('AuditLog', auditLogSchema);
/**
 * Audit Logger Service
 */
class AuditLoggerService {
    /**
     * Sanitize request body by removing sensitive fields
     */
    sanitizeBody(body) {
        if (!body)
            return {};
        const sensitiveFields = [
            'password', 'newPassword', 'currentPassword', 'oldPassword',
            'token', 'accessToken', 'refreshToken', 'apiKey', 'secret',
            'creditCard', 'cardNumber', 'cvv', 'ssn', 'socialSecurity'
        ];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    /**
     * Create an audit log entry
     */
    async log(entry) {
        try {
            // Sanitize request body if present
            const sanitizedEntry = {
                ...entry,
                request: entry.request ? {
                    ...entry.request,
                    body: entry.request.body ? this.sanitizeBody(entry.request.body) : undefined
                } : undefined
            };
            await exports.AuditLog.create(sanitizedEntry);
        }
        catch (error) {
            // Don't throw - logging should never break the application
            console.error('[AuditLogger] Failed to create audit log:', error);
        }
    }
    /**
     * Log authentication event
     */
    async logAuth(eventType, actor, success, errorMessage, metadata) {
        await this.log({
            eventType,
            action: eventType.replace('AUTH_', '').replace(/_/g, ' '),
            actor,
            response: { success, errorMessage },
            severity: success ? 'LOW' : (eventType === 'AUTH_LOGIN_FAILURE' ? 'MEDIUM' : 'HIGH'),
            category: 'AUTHENTICATION',
            metadata
        });
    }
    /**
     * Log user management event
     */
    async logUserEvent(eventType, actor, target, changes, metadata) {
        const severity = eventType === 'USER_ROLE_CHANGED' || eventType === 'USER_DELETED' ? 'HIGH' : 'MEDIUM';
        await this.log({
            eventType,
            action: eventType.replace('USER_', '').replace(/_/g, ' '),
            actor,
            target,
            changes,
            severity,
            category: 'ADMIN',
            metadata
        });
    }
    /**
     * Log ticket event
     */
    async logTicketEvent(eventType, actor, ticketId, ticketNumber, changes, metadata) {
        await this.log({
            eventType,
            action: eventType.replace('TICKET_', '').replace(/_/g, ' '),
            actor,
            target: {
                entityType: 'Ticket',
                entityId: ticketId,
                entityName: ticketNumber
            },
            changes,
            severity: eventType === 'TICKET_DELETED' ? 'HIGH' : 'LOW',
            category: 'USER_ACTION',
            metadata
        });
    }
    /**
     * Log security event
     */
    async logSecurityEvent(eventType, actor, description, request, metadata) {
        await this.log({
            eventType,
            action: eventType.replace('SECURITY_', '').replace(/_/g, ' '),
            description,
            actor,
            request,
            severity: eventType === 'SECURITY_SUSPICIOUS_ACTIVITY' ? 'CRITICAL' : 'HIGH',
            category: 'SECURITY',
            metadata
        });
    }
    /**
     * Log data access event
     */
    async logDataAccess(eventType, actor, description, target, metadata) {
        await this.log({
            eventType,
            action: eventType.replace('DATA_', '').replace(/_/g, ' '),
            description,
            actor,
            target,
            severity: eventType === 'SENSITIVE_DATA_ACCESS' ? 'HIGH' : 'MEDIUM',
            category: 'DATA',
            metadata
        });
    }
    /**
     * Query audit logs
     */
    async query(filters) {
        const query = {};
        if (filters.eventType)
            query.eventType = filters.eventType;
        if (filters.actorUserId)
            query['actor.userId'] = filters.actorUserId;
        if (filters.targetEntityType)
            query['target.entityType'] = filters.targetEntityType;
        if (filters.targetEntityId)
            query['target.entityId'] = filters.targetEntityId;
        if (filters.severity)
            query.severity = filters.severity;
        if (filters.category)
            query.category = filters.category;
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate)
                query.timestamp.$gte = filters.startDate;
            if (filters.endDate)
                query.timestamp.$lte = filters.endDate;
        }
        const limit = filters.limit || 100;
        const skip = filters.skip || 0;
        const [logs, total] = await Promise.all([
            exports.AuditLog.find(query).sort({ timestamp: -1 }).limit(limit).skip(skip).lean(),
            exports.AuditLog.countDocuments(query)
        ]);
        return { logs, total };
    }
    /**
     * Get audit logs for a specific entity
     */
    async getEntityHistory(entityType, entityId) {
        return exports.AuditLog.find({
            'target.entityType': entityType,
            'target.entityId': entityId
        }).sort({ timestamp: -1 }).lean();
    }
    /**
     * Get user activity log
     */
    async getUserActivity(userId, limit = 100) {
        return exports.AuditLog.find({
            'actor.userId': userId
        }).sort({ timestamp: -1 }).limit(limit).lean();
    }
}
// Export singleton instance
exports.auditLogger = new AuditLoggerService();
exports.default = exports.auditLogger;
//# sourceMappingURL=AuditLogger.js.map