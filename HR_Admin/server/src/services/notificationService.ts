/**
 * Notification Service
 * Handles automatic notification creation for helpdesk workflow events
 */

import Notification from '../models/Notification';
import Employee from '../models/Employee';

interface NotificationData {
  title: string;
  description: string;
  type: 'leave' | 'ticket' | 'system' | 'announcement' | 'reminder' | 'celebration' | 'approval' | 'rejection' | 'employee';
  userId?: string;
  role: string;
  meta?: Record<string, unknown>;
  link?: string;
  recipientIds?: string[];
  relatedEmployeeId?: string;
  isGlobal?: boolean;
  visibleToRoles?: string[];
}

export class NotificationService {
  /**
   * Get all HR and Admin user IDs
   */
  private async getHRAndAdminIds(): Promise<string[]> {
    try {
      const hrAdmins = await Employee.find({
        role: { $in: ['HR', 'IT_ADMIN', 'SUPER_ADMIN'] },
        isActive: true
      }).select('employeeId');
      
      return hrAdmins.map(emp => emp.employeeId).filter(Boolean);
    } catch (error) {
      console.error('Failed to get HR/Admin IDs:', error);
      return [];
    }
  }

  /**
   * Calculate notification recipients based on type and context
   */
  async getNotificationRecipients(
    type: string,
    context: {
      employeeId?: string;
      reportingManagerId?: string;
      dottedLineManagerId?: string;
      departmentId?: string;
    }
  ): Promise<string[]> {
    const recipients = new Set<string>();

    try {
      // Get HR and Admin IDs
      const hrAdminIds = await this.getHRAndAdminIds();
      hrAdminIds.forEach(id => recipients.add(id));

      // Add employee-specific recipients based on notification type
      if (type === 'new_employee' || type === 'employee_updated' || type === 'pip_added' || type === 'pip_removed') {
        // Add the employee
        if (context.employeeId) {
          recipients.add(context.employeeId);
        }

        // Add reporting manager
        if (context.reportingManagerId) {
          recipients.add(context.reportingManagerId);
        }

        // Add dotted line manager
        if (context.dottedLineManagerId) {
          recipients.add(context.dottedLineManagerId);
        }
      }

      if (type === 'leave_request') {
        // Leave request visible to applicant, manager, and HR
        if (context.employeeId) {
          recipients.add(context.employeeId);
        }
        if (context.reportingManagerId) {
          recipients.add(context.reportingManagerId);
        }
      }

      if (type === 'leave_approved' || type === 'leave_rejected') {
        // Leave decision visible only to the applicant
        if (context.employeeId) {
          recipients.add(context.employeeId);
        }
      }

      if (type === 'onboarding_task') {
        // Onboarding tasks visible to employee and HR
        if (context.employeeId) {
          recipients.add(context.employeeId);
        }
      }

      return Array.from(recipients);
    } catch (error) {
      console.error('Failed to calculate notification recipients:', error);
      return [];
    }
  }

  /**
   * Create a notification
   */
  async createNotification(data: NotificationData): Promise<void> {
    try {
      // Store link in meta if provided
      const meta = {
        ...(data.meta || {}),
        ...(data.link && { actionUrl: data.link })
      };
      
      const notification = new Notification({
        title: data.title,
        description: data.description,
        type: data.type,
        userId: data.userId,
        role: data.role,
        meta,
        recipientIds: data.recipientIds || [],
        relatedEmployeeId: data.relatedEmployeeId,
        isGlobal: data.isGlobal || false,
        visibleToRoles: data.visibleToRoles || []
      });
      await notification.save();
      console.log(`📬 Notification created: "${data.title}" for ${data.recipientIds?.length || 0} recipients`);
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Notify when a new employee is added
   */
  async notifyEmployeeAdded(employee: {
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    reportingManagerId?: string;
    dottedLineManagerId?: string;
  }): Promise<void> {
    const recipients = await this.getNotificationRecipients('new_employee', {
      employeeId: employee.employeeId,
      reportingManagerId: employee.reportingManagerId,
      dottedLineManagerId: employee.dottedLineManagerId
    });

    await this.createNotification({
      title: 'New Employee Added',
      description: `${employee.name} has joined as ${employee.designation} in ${employee.department} department.`,
      type: 'employee',
      role: 'HR',
      recipientIds: recipients,
      relatedEmployeeId: employee.employeeId,
      isGlobal: false,
      link: '/employees',
      meta: {
        employeeId: employee.employeeId,
        employeeName: employee.name,
        department: employee.department
      }
    });
  }

  /**
   * Notify when employee is updated
   */
  async notifyEmployeeUpdated(employee: {
    employeeId: string;
    name: string;
    reportingManagerId?: string;
    dottedLineManagerId?: string;
    changes?: string;
  }): Promise<void> {
    const recipients = await this.getNotificationRecipients('employee_updated', {
      employeeId: employee.employeeId,
      reportingManagerId: employee.reportingManagerId,
      dottedLineManagerId: employee.dottedLineManagerId
    });

    await this.createNotification({
      title: 'Employee Profile Updated',
      description: `Profile for ${employee.name} has been updated.${employee.changes ? ` Changes: ${employee.changes}` : ''}`,
      type: 'employee',
      role: 'HR',
      recipientIds: recipients,
      relatedEmployeeId: employee.employeeId,
      isGlobal: false,
      link: '/employees',
      meta: {
        employeeId: employee.employeeId,
        employeeName: employee.name
      }
    });
  }

  /**
   * Notify when a ticket is created
   */
  async notifyTicketCreated(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
    highLevelCategory: string;
    requiresApproval: boolean;
  }): Promise<void> {
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
    } else {
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
  async notifyL1Approval(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
    highLevelCategory: string;
  }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void> {
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
  async notifyL2Approval(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
    highLevelCategory: string;
  }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void> {
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
  async notifyL3Approval(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
    highLevelCategory: string;
  }, status: 'Approved' | 'Rejected', approverName: string, comments?: string): Promise<void> {
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
  async notifyTicketAssigned(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
    highLevelCategory: string;
  }, assignedTo: {
    id: string;
    name: string;
  }, assignedBy: string): Promise<void> {
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
   * Notify when ticket work is completed
   */
  async notifyWorkCompleted(ticket: {
    ticketNumber: string;
    userId: string;
    userName: string;
    subject: string;
  }, completedBy: string): Promise<void> {
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
  async notifyTicketClosed(ticket: {
    ticketNumber: string;
    userId: string;
    subject: string;
  }, closedBy: string): Promise<void> {
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
}

export default new NotificationService();
