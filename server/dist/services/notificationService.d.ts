/**
 * Notification Service
 * Handles automatic notification creation for helpdesk workflow events
 */
interface NotificationData {
    title: string;
    description: string;
    type: 'leave' | 'ticket' | 'system' | 'announcement' | 'reminder' | 'celebration' | 'approval' | 'rejection';
    userId?: string;
    role: string;
    meta?: Record<string, unknown>;
    link?: string;
}
export declare class NotificationService {
    /**
     * Create a notification
     */
    createNotification(data: NotificationData): Promise<void>;
    /**
     * Notify when a ticket is created
     */
    notifyTicketCreated(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
        requiresApproval: boolean;
    }): Promise<void>;
    /**
     * Notify when L1 approval is processed
     */
    notifyL1Approval(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
    }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void>;
    /**
     * Notify when L2 approval is processed
     */
    notifyL2Approval(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
    }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void>;
    /**
     * Notify when L3 (final) approval is processed
     */
    notifyL3Approval(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
    }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void>;
    /**
     * Notify when ticket is assigned
     */
    notifyTicketAssigned(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
    }, assignedTo: {
        id: string;
        name: string;
    }, assignedBy: string): Promise<void>;
    /**
     * Notify when ticket is reassigned
     */
    notifyTicketReassigned(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
        highLevelCategory: string;
    }, previousAssignee: {
        id: string;
        name: string;
    }, newAssignee: {
        id: string;
        name: string;
    }, reason: string, reassignedBy: string): Promise<void>;
    /**
     * Notify when ticket work is completed
     */
    notifyWorkCompleted(ticket: {
        ticketNumber: string;
        userId: string;
        userName: string;
        subject: string;
    }, completedBy: string): Promise<void>;
    /**
     * Notify when ticket is closed
     */
    notifyTicketClosed(ticket: {
        ticketNumber: string;
        userId: string;
        subject: string;
    }, closedBy: string): Promise<void>;
    /**
     * Notify when a new employee is added
     */
    notifyEmployeeAdded(employee: {
        employeeId: string;
        name: string;
        designation?: string | null;
        department?: string | null;
        reportingManagerId?: string | null;
        dottedLineManagerId?: string | null;
    }): Promise<void>;
    /**
     * Notify when an employee profile is updated
     */
    notifyEmployeeUpdated(employee: {
        employeeId: string;
        name: string;
        reportingManagerId?: string | null;
        dottedLineManagerId?: string | null;
    }): Promise<void>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notificationService.d.ts.map