/**
 * Helpdesk Service
 * Centralizes all business logic for ticket management
 * Separates concerns from route handlers for better testability
 */
interface TicketData {
    userId: string;
    userName: string;
    userEmail: string;
    userDepartment?: string;
    highLevelCategory: 'IT' | 'Facilities' | 'Finance';
    subCategory: string;
    subject: string;
    description: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    requiresApproval?: boolean;
    attachments?: string[];
}
interface AssignmentData {
    employeeId: string;
    employeeName: string;
    assignedById: string;
    assignedByName: string;
    notes?: string;
}
interface ReassignmentData {
    newEmployeeId: string;
    newEmployeeName: string;
    reassignedById: string;
    reassignedByName: string;
    reason: string;
}
interface ConversationMessageData {
    sender: 'employee' | 'manager' | 'specialist' | 'itadmin' | 'system';
    senderName: string;
    message: string;
    attachments?: string[];
}
export declare class HelpdeskService {
    /**
     * Helper to get employeeId from email for notifications
     * This ensures notifications match the frontend's query pattern
     */
    private getEmployeeIdFromEmail;
    /**
     * Generate next ticket number atomically
     * Prevents race conditions using MongoDB's findOneAndUpdate
     */
    private generateTicketNumber;
    /**
     * Calculate SLA deadlines based on ticket type
     */
    private calculateSLA;
    /**
     * Determine initial ticket status and routing based on approval requirement
     */
    private determineInitialFlow;
    /**
     * Create new helpdesk ticket with workflow
     */
    createTicket(ticketData: TicketData): Promise<any>;
    /**
     * Get all tickets with optional filtering
     */
    getAllTickets(filters?: {
        userId?: string;
        status?: string;
    }): Promise<any[]>;
    /**
     * Get tickets by user ID
     */
    getTicketsByUserId(userId: string): Promise<any[]>;
    /**
     * Get single ticket by ID
     */
    getTicketById(ticketId: string): Promise<any>;
    /**
     * Update ticket status
     */
    updateTicketStatus(ticketId: string, status: string, performedBy: string, reason?: string): Promise<any>;
    /**
     * Add message to ticket conversation
     */
    addMessage(ticketId: string, messageData: ConversationMessageData): Promise<any>;
    /**
     * Assign ticket to IT specialist
     */
    assignTicket(ticketId: string, assignmentData: AssignmentData): Promise<any>;
    /**
     * Reassign ticket to a different specialist
     */
    reassignTicket(ticketId: string, reassignmentData: ReassignmentData): Promise<any>;
    /**
     * Update ticket progress
     */
    updateProgress(ticketId: string, progressStatus: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed', notes?: string, updatedBy?: string): Promise<any>;
    /**
     * Mark work as complete
     */
    completeWork(ticketId: string, resolutionNotes: string, completedBy: string): Promise<any>;
    /**
     * User confirms completion
     */
    confirmCompletion(ticketId: string, confirmedBy: string, feedback?: string): Promise<any>;
    /**
     * Pause ticket
     */
    pauseTicket(ticketId: string, pausedBy: string, reason?: string): Promise<any>;
    /**
     * Resume ticket
     */
    resumeTicket(ticketId: string, resumedBy: string): Promise<any>;
    /**
     * Close ticket (IT Specialist) - after user confirmation
     */
    closeTicket(ticketId: string, closedBy: string, closingNotes?: string): Promise<any>;
    /**
     * Delete ticket (admin only)
     */
    deleteTicket(ticketId: string): Promise<void>;
}
declare const _default: HelpdeskService;
export default _default;
//# sourceMappingURL=helpdeskService.d.ts.map