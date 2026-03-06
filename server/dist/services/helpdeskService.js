"use strict";
/**
 * Helpdesk Service
 * Centralizes all business logic for ticket management
 * Separates concerns from route handlers for better testability
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpdeskService = void 0;
const HelpdeskTicket_1 = __importDefault(require("../models/HelpdeskTicket"));
const TicketCounter_1 = __importDefault(require("../models/TicketCounter"));
const ITSpecialist_1 = __importDefault(require("../models/ITSpecialist"));
const Employee_1 = __importDefault(require("../models/Employee"));
const errorHandler_1 = require("../utils/errorHandler");
const notificationService_1 = __importDefault(require("./notificationService"));
class HelpdeskService {
    /**
     * Helper to get employeeId from email for notifications
     * This ensures notifications match the frontend's query pattern
     */
    async getEmployeeIdFromEmail(email) {
        try {
            const employee = await Employee_1.default.findOne({ email });
            return employee?.employeeId || null;
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Generate next ticket number atomically
     * Prevents race conditions using MongoDB's findOneAndUpdate
     */
    async generateTicketNumber() {
        try {
            return await TicketCounter_1.default.getNextSequence();
        }
        catch (error) {
            throw new errorHandler_1.ApiError(500, 'Failed to generate ticket number', 'TICKET_NUMBER_ERROR');
        }
    }
    /**
     * Calculate SLA deadlines based on ticket type
     */
    calculateSLA(requiresApproval) {
        const now = new Date();
        const approvalSlaHours = 24;
        const processingSlaHours = 48;
        return {
            approvalSlaHours,
            processingSlaHours,
            startAt: now.toISOString(),
            dueAt: new Date(now.getTime() + (processingSlaHours * 60 * 60 * 1000)).toISOString(),
            approvalDeadline: requiresApproval
                ? new Date(now.getTime() + (approvalSlaHours * 60 * 60 * 1000)).toISOString()
                : undefined,
            processingDeadline: new Date(now.getTime() + (processingSlaHours * 60 * 60 * 1000)).toISOString(),
            isOverdue: false,
            status: 'On Track'
        };
    }
    /**
     * Determine initial ticket status and routing based on approval requirement
     */
    determineInitialFlow(module, requiresApproval) {
        if (requiresApproval) {
            return {
                status: 'Pending Level-1 Approval',
                currentApprovalLevel: 'L1',
                approvalCompleted: false,
                approvalStatus: 'Pending',
                routedTo: null, // Not routed until approvals complete
                historyMessage: `Ticket created for ${module} module - sent for L1 approval`
            };
        }
        else {
            return {
                status: 'Routed',
                currentApprovalLevel: 'NONE',
                approvalCompleted: true,
                approvalStatus: 'Approved',
                routedTo: module,
                historyMessage: `Ticket created for ${module} module - routed directly to ${module} admin`
            };
        }
    }
    /**
     * Create new helpdesk ticket with workflow
     */
    async createTicket(ticketData) {
        const ticketNumber = await this.generateTicketNumber();
        const module = ticketData.highLevelCategory;
        const requiresApproval = ticketData.requiresApproval || false;
        const initialFlow = this.determineInitialFlow(module, requiresApproval);
        const sla = this.calculateSLA(requiresApproval);
        const ticket = new HelpdeskTicket_1.default({
            ticketNumber,
            userId: ticketData.userId,
            userName: ticketData.userName,
            userEmail: ticketData.userEmail,
            userDepartment: ticketData.userDepartment || '',
            highLevelCategory: module,
            subCategory: ticketData.subCategory,
            subject: ticketData.subject,
            description: ticketData.description,
            urgency: ticketData.urgency || 'medium',
            status: initialFlow.status,
            requiresApproval,
            currentApprovalLevel: initialFlow.currentApprovalLevel,
            approvalLevel: initialFlow.currentApprovalLevel,
            approvalCompleted: initialFlow.approvalCompleted,
            approvalStatus: initialFlow.approvalStatus,
            routedTo: initialFlow.routedTo,
            approverHistory: [],
            sla,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            conversation: [],
            attachments: ticketData.attachments || [],
            history: [{
                    action: 'created',
                    timestamp: new Date().toISOString(),
                    by: ticketData.userName,
                    performedByRole: 'employee',
                    details: initialFlow.historyMessage,
                    previousStatus: undefined,
                    newStatus: initialFlow.status
                }]
        });
        await ticket.save();
        // Create notifications for ticket creation
        await notificationService_1.default.notifyTicketCreated({
            ticketNumber,
            userId: ticketData.userId,
            userName: ticketData.userName,
            subject: ticketData.subject,
            highLevelCategory: module,
            requiresApproval
        });
        // Log successful ticket creation (non-sensitive info only)
        console.log(`✅ Ticket created: ${ticketNumber} | User: ${ticketData.userName} | Category: ${module} | Approval: ${requiresApproval ? 'Required' : 'Not Required'}`);
        return ticket;
    }
    /**
     * Get all tickets with optional filtering
     */
    async getAllTickets(filters) {
        const query = {};
        if (filters?.userId)
            query.userId = filters.userId;
        if (filters?.status)
            query.status = filters.status;
        return await HelpdeskTicket_1.default.find(query).sort({ createdAt: -1 });
    }
    /**
     * Get tickets by user ID
     */
    async getTicketsByUserId(userId) {
        return await HelpdeskTicket_1.default.find({ userId }).sort({ createdAt: -1 });
    }
    /**
     * Get single ticket by ID
     */
    async getTicketById(ticketId) {
        const ticket = await HelpdeskTicket_1.default.findById(ticketId);
        if (!ticket) {
            throw new errorHandler_1.ApiError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
        }
        return ticket;
    }
    /**
     * Update ticket status
     */
    async updateTicketStatus(ticketId, status, performedBy, reason) {
        const ticket = await this.getTicketById(ticketId);
        const previousStatus = ticket.get('status');
        // Special handling for cancellation
        if (status === 'Cancelled') {
            // Check if ticket can be cancelled
            const nonCancellableStatuses = [
                'Cancelled',
                'Closed',
                'Auto-Closed',
                'Confirmed',
                'Rejected',
                'Completed',
                'Completed - Awaiting IT Closure'
            ];
            if (nonCancellableStatuses.includes(previousStatus)) {
                throw new errorHandler_1.ApiError(400, 'Ticket cannot be cancelled in current status', 'CANNOT_CANCEL');
            }
            ticket.set('closedAt', new Date().toISOString());
            ticket.set('closedBy', performedBy);
            ticket.set('closingReason', 'User Cancellation');
            ticket.set('closingNote', `Ticket cancelled by ${performedBy}${reason ? ': ' + reason : ''}`);
        }
        ticket.set('status', status);
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: status === 'Cancelled' ? 'cancelled' : 'status_updated',
            timestamp: new Date().toISOString(),
            by: performedBy,
            details: reason || `Status changed from ${previousStatus} to ${status}`,
            previousStatus,
            newStatus: status
        });
        ticket.set('history', history);
        await ticket.save();
        return ticket;
    }
    /**
     * Add message to ticket conversation
     */
    async addMessage(ticketId, messageData) {
        const ticket = await this.getTicketById(ticketId);
        const conversation = ticket.get('conversation') || [];
        conversation.push({
            sender: messageData.sender,
            senderName: messageData.senderName,
            message: messageData.message,
            timestamp: new Date().toISOString(),
            ...(messageData.attachments && { attachments: messageData.attachments })
        });
        ticket.set('conversation', conversation);
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'message_added',
            timestamp: new Date().toISOString(),
            by: messageData.senderName,
            details: 'Added message to conversation'
        });
        ticket.set('history', history);
        ticket.set('updatedAt', new Date().toISOString());
        await ticket.save();
        // Send notification to the appropriate recipient
        const ticketNumber = ticket.get('ticketNumber');
        const isFromEmployee = messageData.sender === 'employee';
        const assignment = ticket.get('assignment');
        if (isFromEmployee && assignment?.assignedToId) {
            // Employee sent message -> notify assigned specialist
            // assignedToId should already be the employeeId (like IT001)
            await notificationService_1.default.createNotification({
                title: `New Message on Ticket ${ticketNumber}`,
                description: `${messageData.senderName} sent a message: "${messageData.message.substring(0, 100)}${messageData.message.length > 100 ? '...' : ''}"`,
                type: 'ticket',
                userId: assignment.assignedToId,
                role: 'IT_EMPLOYEE',
                link: '/itadmin/tickets',
                meta: { ticketNumber, ticketId }
            });
        }
        else if (!isFromEmployee) {
            // IT Specialist/Admin sent message -> notify employee (ticket owner)
            // Use email to look up the correct employeeId for notification matching
            const ticketOwnerEmail = ticket.get('userEmail');
            const recipientId = await this.getEmployeeIdFromEmail(ticketOwnerEmail) || ticket.get('userId');
            await notificationService_1.default.createNotification({
                title: `New Message on Ticket ${ticketNumber}`,
                description: `${messageData.senderName} replied: "${messageData.message.substring(0, 100)}${messageData.message.length > 100 ? '...' : ''}"`,
                type: 'ticket',
                userId: recipientId,
                role: 'EMPLOYEE',
                link: '/helpdesk',
                meta: { ticketNumber, ticketId }
            });
        }
        return ticket;
    }
    /**
     * Assign ticket to IT specialist
     */
    async assignTicket(ticketId, assignmentData) {
        const ticket = await this.getTicketById(ticketId);
        // Update assignment
        ticket.set('assignment', {
            assignedToId: assignmentData.employeeId,
            assignedToName: assignmentData.employeeName,
            assignedTo: assignmentData.employeeName, // Legacy field
            assignedBy: assignmentData.assignedById,
            assignedByName: assignmentData.assignedByName,
            assignedByRole: 'IT_ADMIN',
            assignedAt: new Date().toISOString(),
            assignmentNotes: assignmentData.notes
        });
        ticket.set('status', 'Assigned');
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'assigned',
            timestamp: new Date().toISOString(),
            by: assignmentData.assignedByName,
            details: `Assigned to ${assignmentData.employeeName}${assignmentData.notes ? ': ' + assignmentData.notes : ''}`
        });
        ticket.set('history', history);
        await ticket.save();
        // Send notifications for ticket assignment
        await notificationService_1.default.notifyTicketAssigned({
            ticketNumber: ticket.get('ticketNumber'),
            userId: ticket.get('userId'),
            userName: ticket.get('userName'),
            subject: ticket.get('subject'),
            highLevelCategory: ticket.get('highLevelCategory')
        }, {
            id: assignmentData.employeeId,
            name: assignmentData.employeeName
        }, assignmentData.assignedByName);
        // Update specialist's active ticket count
        await ITSpecialist_1.default.findOneAndUpdate({ employeeId: assignmentData.employeeId }, { $inc: { activeTicketCount: 1 } }, { runValidators: true });
        return ticket;
    }
    /**
     * Reassign ticket to a different specialist
     */
    async reassignTicket(ticketId, reassignmentData) {
        const ticket = await this.getTicketById(ticketId);
        // Validate ticket is currently assigned
        const currentAssignment = ticket.get('assignment');
        if (!currentAssignment || !currentAssignment.assignedToId) {
            throw new errorHandler_1.ApiError(400, 'Ticket must be assigned before it can be reassigned');
        }
        // Validate reason is provided
        if (!reassignmentData.reason || reassignmentData.reason.trim() === '') {
            throw new errorHandler_1.ApiError(400, 'Reassignment reason is required');
        }
        const previousAssigneeId = currentAssignment.assignedToId;
        const previousAssigneeName = currentAssignment.assignedToName;
        // Update assignment
        ticket.set('assignment', {
            assignedToId: reassignmentData.newEmployeeId,
            assignedToName: reassignmentData.newEmployeeName,
            assignedTo: reassignmentData.newEmployeeName, // Legacy field
            assignedBy: reassignmentData.reassignedById,
            assignedByName: reassignmentData.reassignedByName,
            assignedByRole: 'IT_ADMIN',
            assignedAt: new Date().toISOString(),
            assignmentNotes: reassignmentData.reason,
            previousAssigneeId,
            previousAssigneeName
        });
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'reassigned',
            timestamp: new Date().toISOString(),
            by: reassignmentData.reassignedByName,
            details: `Reassigned from ${previousAssigneeName} to ${reassignmentData.newEmployeeName}. Reason: ${reassignmentData.reason}`
        });
        ticket.set('history', history);
        await ticket.save();
        // Notify previous assignee about reassignment
        await notificationService_1.default.notifyTicketReassigned({
            ticketNumber: ticket.get('ticketNumber'),
            userId: ticket.get('userId'),
            userName: ticket.get('userName'),
            subject: ticket.get('subject'),
            highLevelCategory: ticket.get('highLevelCategory')
        }, {
            id: previousAssigneeId,
            name: previousAssigneeName
        }, {
            id: reassignmentData.newEmployeeId,
            name: reassignmentData.newEmployeeName
        }, reassignmentData.reason, reassignmentData.reassignedByName);
        // Notify new assignee about assignment
        await notificationService_1.default.notifyTicketAssigned({
            ticketNumber: ticket.get('ticketNumber'),
            userId: ticket.get('userId'),
            userName: ticket.get('userName'),
            subject: ticket.get('subject'),
            highLevelCategory: ticket.get('highLevelCategory')
        }, {
            id: reassignmentData.newEmployeeId,
            name: reassignmentData.newEmployeeName
        }, reassignmentData.reassignedByName);
        // Update specialist ticket counts
        await ITSpecialist_1.default.findOneAndUpdate({ employeeId: previousAssigneeId }, { $inc: { activeTicketCount: -1 } }, { runValidators: true });
        await ITSpecialist_1.default.findOneAndUpdate({ employeeId: reassignmentData.newEmployeeId }, { $inc: { activeTicketCount: 1 } }, { runValidators: true });
        return ticket;
    }
    /**
     * Update ticket progress
     */
    async updateProgress(ticketId, progressStatus, notes, updatedBy) {
        const ticket = await this.getTicketById(ticketId);
        const specialistName = updatedBy || ticket.get('assignment')?.assignedToName || 'System';
        // Update progress
        ticket.set('progress', {
            status: progressStatus,
            notes: notes || ticket.get('progress')?.notes,
            lastUpdated: new Date().toISOString()
        });
        // Update ticket status based on progress
        if (progressStatus === 'In Progress') {
            ticket.set('status', 'In Progress');
        }
        else if (progressStatus === 'On Hold') {
            ticket.set('status', 'On Hold');
        }
        else if (progressStatus === 'Completed') {
            ticket.set('status', 'Completed');
        }
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'progress_updated',
            timestamp: new Date().toISOString(),
            by: specialistName,
            details: `Progress updated to ${progressStatus}${notes ? ': ' + notes : ''}`
        });
        ticket.set('history', history);
        // Add conversation message if notes are provided
        if (notes && notes.trim().length > 0) {
            const conversation = ticket.get('conversation') || [];
            conversation.push({
                sender: 'specialist',
                senderName: specialistName,
                message: `**Progress Update: ${progressStatus}**\n\n${notes}`,
                timestamp: new Date().toISOString(),
                type: 'status_update'
            });
            ticket.set('conversation', conversation);
        }
        await ticket.save();
        // Send notification to the ticket owner about progress update
        // Use email to look up the correct employeeId for notification matching
        const ticketOwnerEmail = ticket.get('userEmail');
        const recipientId = await this.getEmployeeIdFromEmail(ticketOwnerEmail) || ticket.get('userId');
        await notificationService_1.default.createNotification({
            title: `Ticket ${ticket.get('ticketNumber')} - Progress Updated`,
            description: `Your ticket "${ticket.get('subject')}" status has been updated to "${progressStatus}"${notes ? `. Note: ${notes.substring(0, 100)}${notes.length > 100 ? '...' : ''}` : '.'}`,
            type: 'ticket',
            userId: recipientId,
            role: 'EMPLOYEE',
            link: '/helpdesk',
            meta: {
                ticketNumber: ticket.get('ticketNumber'),
                ticketId,
                progressStatus,
                updatedBy: specialistName
            }
        });
        return ticket;
    }
    /**
     * Mark work as complete
     */
    async completeWork(ticketId, resolutionNotes, completedBy) {
        const ticket = await this.getTicketById(ticketId);
        if (!resolutionNotes || resolutionNotes.trim().length === 0) {
            throw new errorHandler_1.ApiError(400, 'Resolution notes are required', 'MISSING_RESOLUTION_NOTES');
        }
        ticket.set('resolution', {
            resolvedBy: completedBy,
            resolvedAt: new Date().toISOString(),
            notes: resolutionNotes
        });
        ticket.set('status', 'Completed');
        // Update progress
        ticket.set('progress', {
            ...ticket.get('progress'),
            status: 'Completed',
            lastUpdated: new Date().toISOString()
        });
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'work_completed',
            timestamp: new Date().toISOString(),
            by: completedBy,
            details: `Work completed: ${resolutionNotes}`
        });
        ticket.set('history', history);
        // Add conversation message for work completion
        const conversation = ticket.get('conversation') || [];
        conversation.push({
            sender: 'specialist',
            senderName: completedBy,
            message: `**Work Completed**\n\n${resolutionNotes}`,
            timestamp: new Date().toISOString(),
            type: 'closing_note'
        });
        ticket.set('conversation', conversation);
        await ticket.save();
        // Send notification to the ticket owner about work completion
        // Use email to look up the correct employeeId for notification matching
        const ticketOwnerEmail = ticket.get('userEmail');
        const recipientId = await this.getEmployeeIdFromEmail(ticketOwnerEmail) || ticket.get('userId');
        await notificationService_1.default.notifyWorkCompleted({
            ticketNumber: ticket.get('ticketNumber'),
            userId: recipientId,
            userName: ticket.get('userName'),
            subject: ticket.get('subject')
        }, completedBy);
        return ticket;
    }
    /**
     * User confirms completion
     */
    async confirmCompletion(ticketId, confirmedBy, feedback) {
        const ticket = await this.getTicketById(ticketId);
        if (ticket.get('status') !== 'Completed') {
            throw new errorHandler_1.ApiError(400, 'Ticket must be in Completed status', 'INVALID_STATUS');
        }
        ticket.set('status', 'Confirmed');
        ticket.set('userConfirmedAt', new Date().toISOString());
        ticket.set('updatedAt', new Date().toISOString());
        // Add feedback to conversation if provided
        if (feedback) {
            const conversation = ticket.get('conversation') || [];
            conversation.push({
                sender: 'employee',
                senderName: confirmedBy,
                message: `User confirmed resolution with feedback: ${feedback}`,
                timestamp: new Date().toISOString()
            });
            ticket.set('conversation', conversation);
        }
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'user_confirmed',
            timestamp: new Date().toISOString(),
            by: confirmedBy,
            details: feedback ? `User confirmed resolution with feedback: ${feedback}` : 'User confirmed resolution. Awaiting IT closure.'
        });
        ticket.set('history', history);
        await ticket.save();
        return ticket;
    }
    /**
     * Pause ticket
     */
    async pauseTicket(ticketId, pausedBy, reason) {
        const ticket = await this.getTicketById(ticketId);
        const currentStatus = ticket.get('status');
        if (currentStatus !== 'In Progress' && currentStatus !== 'Assigned') {
            throw new errorHandler_1.ApiError(400, 'Ticket must be In Progress or Assigned to pause', 'INVALID_STATUS');
        }
        ticket.set('status', 'Paused');
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'paused',
            timestamp: new Date().toISOString(),
            by: pausedBy,
            details: reason ? `Ticket paused: ${reason}` : 'Ticket paused'
        });
        ticket.set('history', history);
        await ticket.save();
        return ticket;
    }
    /**
     * Resume ticket
     */
    async resumeTicket(ticketId, resumedBy) {
        const ticket = await this.getTicketById(ticketId);
        if (ticket.get('status') !== 'Paused') {
            throw new errorHandler_1.ApiError(400, 'Ticket must be Paused to resume', 'INVALID_STATUS');
        }
        ticket.set('status', 'In Progress');
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'resumed',
            timestamp: new Date().toISOString(),
            by: resumedBy,
            details: 'Ticket resumed'
        });
        ticket.set('history', history);
        await ticket.save();
        return ticket;
    }
    /**
     * Close ticket (IT Specialist) - after user confirmation
     */
    async closeTicket(ticketId, closedBy, closingNotes) {
        const ticket = await this.getTicketById(ticketId);
        const currentStatus = ticket.get('status');
        if (currentStatus !== 'Confirmed' && currentStatus !== 'Completed - Awaiting IT Closure') {
            throw new errorHandler_1.ApiError(400, 'Ticket must be confirmed by user before IT can close it', 'INVALID_STATUS');
        }
        ticket.set('status', 'Closed');
        ticket.set('closedAt', new Date().toISOString());
        ticket.set('closedBy', closedBy);
        ticket.set('closingReason', 'Resolved'); // Changed from 'IT Specialist Closure' to match enum
        if (closingNotes) {
            ticket.set('closingNote', closingNotes);
        }
        ticket.set('updatedAt', new Date().toISOString());
        // Add history entry
        const history = ticket.get('history') || [];
        history.push({
            action: 'closed',
            timestamp: new Date().toISOString(),
            by: closedBy,
            details: closingNotes ? `Ticket closed: ${closingNotes}` : 'Ticket closed by IT Specialist'
        });
        ticket.set('history', history);
        await ticket.save();
        return ticket;
    }
    /**
     * Delete ticket (admin only)
     */
    async deleteTicket(ticketId) {
        const ticket = await HelpdeskTicket_1.default.findByIdAndDelete(ticketId);
        if (!ticket) {
            throw new errorHandler_1.ApiError(404, 'Ticket not found', 'TICKET_NOT_FOUND');
        }
    }
}
exports.HelpdeskService = HelpdeskService;
exports.default = new HelpdeskService();
//# sourceMappingURL=helpdeskService.js.map