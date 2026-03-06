"use strict";
/**
 * Notification Service
 * Handles automatic notification creation for helpdesk workflow events
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    /**
     * Create a notification
     */
    async createNotification(data) {
        try {
            // Store link in meta if provided
            const meta = {
                ...(data.meta || {}),
                ...(data.link && { actionUrl: data.link })
            };
            const notification = new Notification_1.default({
                title: data.title,
                description: data.description,
                type: data.type,
                userId: data.userId,
                role: data.role,
                meta
            });
            await notification.save();
            console.log(`📬 Notification created: "${data.title}" for ${data.userId || data.role}`);
        }
        catch (error) {
            console.error('Failed to create notification:', error);
            // Don't throw - notifications are non-critical
        }
    }
    /**
     * Notify when a ticket is created
     */
    async notifyTicketCreated(ticket) {
        // Notify the user that their ticket was created
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} Created`,
            description: `Your ${ticket.highLevelCategory} request "${ticket.subject}" has been submitted successfully.${ticket.requiresApproval ? ' It requires approval before processing.' : ''}`,
            type: 'ticket',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                category: ticket.highLevelCategory
            }
        });
        // If requires approval, notify L1 approvers
        if (ticket.requiresApproval) {
            await this.createNotification({
                title: `New Ticket Pending Approval: ${ticket.ticketNumber}`,
                description: `${ticket.userName} has submitted a ${ticket.highLevelCategory} request "${ticket.subject}" that requires your approval.`,
                type: 'approval',
                role: 'L1_APPROVER',
                link: '/approver',
                meta: {
                    ticketNumber: ticket.ticketNumber,
                    category: ticket.highLevelCategory,
                    requesterName: ticket.userName
                }
            });
        }
        else {
            // No approval needed - notify IT Admin directly
            await this.createNotification({
                title: `New Ticket Routed: ${ticket.ticketNumber}`,
                description: `A new ${ticket.highLevelCategory} request "${ticket.subject}" from ${ticket.userName} has been routed to you.`,
                type: 'ticket',
                role: 'IT_ADMIN',
                link: '/itadmin/tickets',
                meta: {
                    ticketNumber: ticket.ticketNumber,
                    category: ticket.highLevelCategory,
                    requesterName: ticket.userName
                }
            });
        }
    }
    /**
     * Notify when L1 approval is processed
     */
    async notifyL1Approval(ticket, status, approverName, comments) {
        // Notify the ticket requester
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} - L1 ${status}`,
            description: status === 'Approved'
                ? `Your request "${ticket.subject}" has been approved by ${approverName} at Level 1. It is now pending L2 approval.`
                : `Your request "${ticket.subject}" has been rejected by ${approverName} at Level 1.${comments ? ` Reason: ${comments}` : ''}`,
            type: status === 'Approved' ? 'approval' : 'rejection',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                approverName,
                level: 'L1',
                status
            }
        });
        // If approved, notify L2 approvers
        if (status === 'Approved') {
            await this.createNotification({
                title: `Ticket Pending L2 Approval: ${ticket.ticketNumber}`,
                description: `${ticket.userName}'s ${ticket.highLevelCategory} request "${ticket.subject}" has passed L1 approval and requires your L2 approval.`,
                type: 'approval',
                role: 'L2_APPROVER',
                link: '/approver',
                meta: {
                    ticketNumber: ticket.ticketNumber,
                    category: ticket.highLevelCategory,
                    requesterName: ticket.userName
                }
            });
        }
    }
    /**
     * Notify when L2 approval is processed
     */
    async notifyL2Approval(ticket, status, approverName, comments) {
        // Notify the ticket requester
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} - L2 ${status}`,
            description: status === 'Approved'
                ? `Your request "${ticket.subject}" has been approved by ${approverName} at Level 2. It is now pending L3 (final) approval.`
                : `Your request "${ticket.subject}" has been rejected by ${approverName} at Level 2.${comments ? ` Reason: ${comments}` : ''}`,
            type: status === 'Approved' ? 'approval' : 'rejection',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                approverName,
                level: 'L2',
                status
            }
        });
        // If approved, notify L3 approvers
        if (status === 'Approved') {
            await this.createNotification({
                title: `Ticket Pending L3 (Final) Approval: ${ticket.ticketNumber}`,
                description: `${ticket.userName}'s ${ticket.highLevelCategory} request "${ticket.subject}" has passed L1 & L2 approval and requires your final L3 approval.`,
                type: 'approval',
                role: 'L3_APPROVER',
                link: '/approver',
                meta: {
                    ticketNumber: ticket.ticketNumber,
                    category: ticket.highLevelCategory,
                    requesterName: ticket.userName
                }
            });
        }
    }
    /**
     * Notify when L3 (final) approval is processed
     */
    async notifyL3Approval(ticket, status, approverName, comments) {
        // Notify the ticket requester
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} - ${status === 'Approved' ? 'Fully Approved' : 'L3 Rejected'}`,
            description: status === 'Approved'
                ? `Your request "${ticket.subject}" has been fully approved! It has been routed to the ${ticket.highLevelCategory} admin for processing.`
                : `Your request "${ticket.subject}" has been rejected by ${approverName} at Level 3 (final approval).${comments ? ` Reason: ${comments}` : ''}`,
            type: status === 'Approved' ? 'approval' : 'rejection',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                approverName,
                level: 'L3',
                status
            }
        });
        // If approved, notify IT Admin that ticket is routed
        if (status === 'Approved') {
            await this.createNotification({
                title: `Approved Ticket Routed: ${ticket.ticketNumber}`,
                description: `${ticket.userName}'s ${ticket.highLevelCategory} request "${ticket.subject}" has completed all approvals and is now ready for assignment.`,
                type: 'ticket',
                role: 'IT_ADMIN',
                link: '/itadmin/dashboard',
                meta: {
                    ticketNumber: ticket.ticketNumber,
                    category: ticket.highLevelCategory,
                    requesterName: ticket.userName,
                    fullyApproved: true
                }
            });
        }
    }
    /**
     * Notify when ticket is assigned
     */
    async notifyTicketAssigned(ticket, assignedTo, assignedBy) {
        // Notify the assigned specialist
        await this.createNotification({
            title: `Ticket Assigned: ${ticket.ticketNumber}`,
            description: `You have been assigned to handle ${ticket.highLevelCategory} request "${ticket.subject}" from ${ticket.userName}.`,
            type: 'ticket',
            userId: assignedTo.id,
            role: 'IT_EMPLOYEE',
            link: '/itadmin/tickets',
            meta: {
                ticketNumber: ticket.ticketNumber,
                category: ticket.highLevelCategory,
                requesterName: ticket.userName,
                assignedBy
            }
        });
        // Notify the ticket requester
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} Assigned`,
            description: `Your request "${ticket.subject}" has been assigned to ${assignedTo.name} for processing.`,
            type: 'ticket',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                assignedTo: assignedTo.name
            }
        });
    }
    /**
     * Notify when ticket is reassigned
     */
    async notifyTicketReassigned(ticket, previousAssignee, newAssignee, reason, reassignedBy) {
        // Notify previous assignee about reassignment
        await this.createNotification({
            title: `Ticket Reassigned: ${ticket.ticketNumber}`,
            description: `Ticket "${ticket.subject}" has been reassigned to ${newAssignee.name}. Reason: ${reason}`,
            type: 'ticket',
            userId: previousAssignee.id,
            role: 'IT_EMPLOYEE',
            link: '/itadmin/tickets',
            meta: {
                ticketNumber: ticket.ticketNumber,
                reassignedTo: newAssignee.name,
                reason,
                reassignedBy
            }
        });
        // Notify new assignee about assignment
        await this.createNotification({
            title: `Ticket Assigned: ${ticket.ticketNumber}`,
            description: `You have been assigned ${ticket.highLevelCategory} request "${ticket.subject}" (reassigned from ${previousAssignee.name}).`,
            type: 'ticket',
            userId: newAssignee.id,
            role: 'IT_EMPLOYEE',
            link: '/itadmin/tickets',
            meta: {
                ticketNumber: ticket.ticketNumber,
                category: ticket.highLevelCategory,
                requesterName: ticket.userName,
                previousAssignee: previousAssignee.name,
                reassignedBy
            }
        });
    }
    /**
     * Notify when ticket work is completed
     */
    async notifyWorkCompleted(ticket, completedBy) {
        // Notify the ticket requester
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} - Work Completed`,
            description: `${completedBy} has completed work on your request "${ticket.subject}". Please confirm the completion.`,
            type: 'ticket',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                completedBy,
                action: 'confirm_required'
            }
        });
    }
    /**
     * Notify when ticket is closed
     */
    async notifyTicketClosed(ticket, closedBy) {
        await this.createNotification({
            title: `Ticket ${ticket.ticketNumber} Closed`,
            description: `Your request "${ticket.subject}" has been closed by ${closedBy}.`,
            type: 'ticket',
            userId: ticket.userId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.ticketNumber,
                closedBy
            }
        });
    }
    /**
     * Notify when a new employee is added
     */
    async notifyEmployeeAdded(employee) {
        await this.createNotification({
            title: 'New Employee Added',
            description: `${employee.name} has joined as ${employee.designation || 'a new employee'} in ${employee.department || 'the organization'}.`,
            type: 'announcement',
            role: 'HR',
            meta: {
                employeeId: employee.employeeId,
                department: employee.department,
                designation: employee.designation
            }
        });
    }
    /**
     * Notify when an employee profile is updated
     */
    async notifyEmployeeUpdated(employee) {
        await this.createNotification({
            title: 'Employee Profile Updated',
            description: `The profile of ${employee.name} has been updated.`,
            type: 'system',
            role: 'HR',
            meta: {
                employeeId: employee.employeeId
            }
        });
    }
}
exports.NotificationService = NotificationService;
exports.default = new NotificationService();
//# sourceMappingURL=notificationService.js.map