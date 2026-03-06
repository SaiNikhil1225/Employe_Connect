import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
    strict: true;
}> & {
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    strict: true;
}, {
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    strict: true;
}>> & mongoose.FlatRecord<{
    status: "Approved" | "Rejected" | "In Progress" | "On Hold" | "Completed" | "open" | "pending" | "in-progress" | "resolved" | "closed" | "cancelled" | "Reopened" | "Pending Level-1 Approval" | "Pending Level-2 Approval" | "Pending Level-3 Approval" | "Cancelled" | "Routed" | "In Queue" | "Assigned" | "Paused" | "Confirmed" | "Closed" | "Auto-Closed";
    attachments: string[];
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    highLevelCategory: "IT" | "Facilities" | "Finance";
    subCategory: string;
    subject: string;
    description: string;
    urgency: "low" | "medium" | "high" | "critical";
    requiresApproval: boolean;
    currentApprovalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalLevel: "L1" | "L2" | "L3" | "NONE";
    approvalCompleted: boolean;
    approvalStatus: "Approved" | "Rejected" | "Pending" | "Not Required";
    approverHistory: mongoose.Types.DocumentArray<{
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }> & {
        level: "L1" | "L2" | "L3";
        approverId: string;
        approverName: string;
        approverEmail: string;
        status: "Approved" | "Rejected";
        timestamp: NativeDate;
        comments?: string | null | undefined;
    }>;
    routedTo: "IT" | "Facilities" | "Finance" | null;
    conversation: mongoose.Types.DocumentArray<{
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }> & {
        timestamp: string;
        sender: "system" | "employee" | "manager" | "specialist" | "itadmin";
        senderName: string;
        message: string;
        attachments: string[];
        type?: "message" | "status_update" | "closing_note" | "approval_note" | null | undefined;
    }>;
    history: mongoose.Types.DocumentArray<{
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }> & {
        timestamp: string;
        action: string;
        by: string;
        details?: string | null | undefined;
        previousStatus?: string | null | undefined;
        newStatus?: string | null | undefined;
        performedByRole?: "system" | "employee" | "manager" | "specialist" | "itadmin" | null | undefined;
    }>;
    id?: string | null | undefined;
    progress?: {
        status?: "Not Started" | "In Progress" | "On Hold" | "Completed" | null | undefined;
        lastUpdated?: string | null | undefined;
        notes?: string | null | undefined;
    } | null | undefined;
    resolution?: {
        notes?: string | null | undefined;
        resolvedBy?: string | null | undefined;
        resolvedAt?: string | null | undefined;
    } | null | undefined;
    assignment?: {
        assignedToId?: string | null | undefined;
        assignedToName?: string | null | undefined;
        assignedTo?: string | null | undefined;
        assignedBy?: string | null | undefined;
        assignedByName?: string | null | undefined;
        assignedAt?: string | null | undefined;
        queue?: string | null | undefined;
        assignedByRole?: "IT_ADMIN" | "system" | null | undefined;
        assignmentNotes?: string | null | undefined;
    } | null | undefined;
    sla?: {
        approvalSlaHours: number;
        processingSlaHours: number;
        isOverdue: boolean;
        status?: "On Track" | "At Risk" | "Overdue" | null | undefined;
        startAt?: string | null | undefined;
        dueAt?: string | null | undefined;
        approvalDeadline?: string | null | undefined;
        processingDeadline?: string | null | undefined;
        overdueBy?: number | null | undefined;
    } | null | undefined;
    userConfirmedAt?: string | null | undefined;
    closedAt?: string | null | undefined;
    closedBy?: string | null | undefined;
    approval?: any;
    processing?: any;
    userDepartment?: string | null | undefined;
    module?: "IT" | "Facilities" | "Finance" | null | undefined;
    closingReason?: "Auto-Closed" | "Resolved" | "User Confirmed" | "User Cancellation" | null | undefined;
    closingNote?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=HelpdeskTicket.d.ts.map