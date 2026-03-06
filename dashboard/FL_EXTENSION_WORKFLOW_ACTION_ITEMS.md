# Financial Line Extension Workflow - Action Items

**Date**: February 17, 2026  
**Status**: 📋 Planning Phase  
**Priority**: High - Cross-Module Integration Required

---

## 🎯 Overview

This document outlines the action items required to implement the complete FL date extension workflow with resource allocation updates, approval flows, and cascade updates across the system.

---

## 📦 Feature 1: Resource Allocation Auto-Update on FL Date Extension

### **Goal**: When FL dates are extended, automatically update all associated resource allocation dates

### Prerequisites:
- ✅ FL date extension validation (already implemented)
- ✅ FL-Resource relationship exists in database
- ⏳ Resource allocation date update API
- ⏳ Conflict detection for resource availability

### Action Items:

#### **1.1 Backend API Enhancement** (Priority: High)

**File**: `server/src/routes/financialLines.ts`

**Tasks**:
- [ ] **Task 1.1.1**: Create `PATCH /api/financial-lines/:id/extend-dates` endpoint
  - Accept: `{ scheduleStart, scheduleFinish, extendResources: boolean }`
  - Validate: New dates within project boundaries
  - Return: Updated FL + list of affected resources

- [ ] **Task 1.1.2**: Implement helper function `getAffectedResources(flId)`
  ```javascript
  // Query FL-Resources collection for all resources allocated to this FL
  // Return array of resource IDs and current allocation periods
  ```

- [ ] **Task 1.1.3**: Implement `updateResourceAllocationDates(flId, newEndDate)`
  ```javascript
  // For each resource allocated to FL:
  //   - Check if resource end date < FL new end date
  //   - If yes, extend resource end date to match FL end date
  //   - Log change in audit trail
  //   - Return list of updated resources
  ```

- [ ] **Task 1.1.4**: Add transaction support
  - Wrap FL date update + resource updates in MongoDB transaction
  - Rollback all changes if any operation fails

**Estimated Time**: 6-8 hours

---

#### **1.2 Resource Availability Validation** (Priority: High)

**File**: `server/src/services/resourceAvailability.js` (CREATE NEW)

**Tasks**:
- [ ] **Task 1.2.1**: Create `checkResourceAvailability()` function
  ```javascript
  /**
   * Check if resource is available for extended period
   * @param {string} resourceId - Employee ID
   * @param {Date} startDate - Extension start date
   * @param {Date} endDate - Extension end date
   * @param {string} excludeFLId - Current FL to exclude from check
   * @returns {Object} { available: boolean, conflicts: Array }
   */
  ```

- [ ] **Task 1.2.2**: Query all FL allocations for the resource
  - Get all FLs where resource is allocated
  - Exclude current FL being extended
  - Check for date overlaps

- [ ] **Task 1.2.3**: Calculate utilization % for overlapping periods
  - If total utilization > 100% → Return conflicts
  - Return details: Conflicting FL numbers, dates, utilization %

**Estimated Time**: 4-6 hours

---

#### **1.3 Frontend Integration** (Priority: High)

**File**: `src/pages/rmg/financial-lines/components/CreateFLForm.tsx`

**Tasks**:
- [ ] **Task 1.3.1**: Enhance `checkDateExtension()` function
  ```typescript
  const checkDateExtension = async () => {
    // ... existing code ...
    
    if (isAfter(newEndDate, previousEndDate)) {
      // NEW: Check affected resources
      const response = await axios.get(
        `/api/financial-lines/${editData._id}/affected-resources?newEndDate=${newEndDate}`
      );
      
      const { affectedResources, conflicts } = response.data;
      
      if (conflicts.length > 0) {
        // Show conflict warning dialog
        showResourceConflictDialog(conflicts);
      }
      
      // Show extension confirmation with resource list
      const confirmed = await showExtensionDialogWithResources(affectedResources);
      if (!confirmed) return false;
    }
  };
  ```

- [ ] **Task 1.3.2**: Create `ResourceConflictDialog.tsx` component
  - Display list of resources with conflicts
  - Show conflicting FL numbers and dates
  - Options: "Cancel Extension" or "Proceed Anyway" (with warning)

- [ ] **Task 1.3.3**: Create `ExtensionConfirmationDialog.tsx` component
  - Show list of resources that will be auto-extended
  - Display old vs new end dates for each resource
  - Checkbox: "Also extend resource allocations"
  - Buttons: Cancel, Confirm Extension

- [ ] **Task 1.3.4**: Update `handleCompleteSubmit()` to call new API
  ```typescript
  // If dates extended and user confirmed resource updates
  if (datesExtended && extendResources) {
    await axios.patch(`/api/financial-lines/${editData._id}/extend-dates`, {
      scheduleStart: step1Data.scheduleStart,
      scheduleFinish: step1Data.scheduleFinish,
      extendResources: true
    });
  }
  ```

**Estimated Time**: 8-10 hours

---

#### **1.4 UI Components for Resource Extension** (Priority: Medium)

**Files**: CREATE NEW in `src/pages/rmg/financial-lines/components/`

**Tasks**:
- [ ] **Task 1.4.1**: Create `ResourceExtensionDialog.tsx`
  - Props: `affectedResources[]`, `newEndDate`, `onConfirm`, `onCancel`
  - Table showing: Resource Name, Current End Date, New End Date, Status
  - Footer: Total resources affected count

- [ ] **Task 1.4.2**: Create `ConflictResolutionDialog.tsx`
  - Show resources with >100% utilization
  - Options for each conflict:
    - Skip resource (don't extend)
    - Reduce allocation % in conflicting FL
    - Notify resource manager for approval

**Estimated Time**: 6-8 hours

---

## 📦 Feature 2: Resource Extension Workflow with Approval Flow

### **Goal**: Allow manual resource allocation extension with manager approval

### Prerequisites:
- ✅ Resource allocation module exists
- ⏳ Approval workflow system
- ⏳ Notification system
- ⏳ Manager hierarchy data

### Action Items:

#### **2.1 Backend - Approval Workflow** (Priority: High)

**File**: `server/src/models/ApprovalRequest.js` (CREATE NEW)

**Tasks**:
- [ ] **Task 2.1.1**: Create ApprovalRequest schema
  ```javascript
  {
    requestId: String (auto),
    type: 'RESOURCE_EXTENSION',
    requestedBy: { employeeId, name },
    entityId: String (resourceAllocationId),
    currentData: {
      resourceId,
      flId,
      currentEndDate,
      currentAllocation%
    },
    requestedData: {
      newEndDate,
      newAllocation%,
      reason: String
    },
    approvalChain: [{
      approverId: String,
      approverName: String,
      level: Number,
      status: 'Pending' | 'Approved' | 'Rejected',
      comments: String,
      timestamp: Date
    }],
    finalStatus: 'Pending' | 'Approved' | 'Rejected',
    createdAt: Date,
    updatedAt: Date
  }
  ```

- [ ] **Task 2.1.2**: Create approval routes
  - `POST /api/approvals/request` - Create new approval request
  - `GET /api/approvals/:id` - Get approval request details
  - `GET /api/approvals/my-pending` - Get pending approvals for logged-in user
  - `POST /api/approvals/:id/approve` - Approve request
  - `POST /api/approvals/:id/reject` - Reject request

- [ ] **Task 2.1.3**: Implement approval logic
  ```javascript
  // Determine approval chain based on:
  // - Resource allocation % change
  // - Duration of extension
  // - Employee level (junior vs senior)
  
  const getApprovalChain = (resourceId, extensionData) => {
    const approvers = [];
    
    // L1: Project Manager (always required)
    approvers.push({ level: 1, approverId: projectManager });
    
    // L2: Delivery Manager (if extension > 3 months)
    if (monthsDiff > 3) {
      approvers.push({ level: 2, approverId: deliveryManager });
    }
    
    // L3: HR/Admin (if allocation % > 80%)
    if (allocationPercent > 80) {
      approvers.push({ level: 3, approverId: hrAdmin });
    }
    
    return approvers;
  };
  ```

**Estimated Time**: 10-12 hours

---

#### **2.2 Frontend - Resource Extension Form** (Priority: High)

**File**: `src/pages/rmg/resources/components/ExtendResourceAllocationForm.tsx` (CREATE NEW)

**Tasks**:
- [ ] **Task 2.2.1**: Create extension request form
  ```tsx
  interface ExtensionFormProps {
    resourceAllocation: ResourceAllocation;
    onSuccess: () => void;
    onCancel: () => void;
  }
  
  Fields:
  - Current End Date (read-only)
  - New End Date (date picker, min = current end date + 1)
  - Allocation % for Extended Period (0-100)
  - Reason for Extension (textarea, required)
  - Estimated Hours for Extended Period (calculated)
  ```

- [ ] **Task 2.2.2**: Add validation
  - New end date must be within FL end date
  - New end date must be within project end date
  - Total allocation % across all projects ≤ 100%
  - Reason must be at least 50 characters

- [ ] **Task 2.2.3**: Integrate with approval API
  ```typescript
  const handleSubmit = async () => {
    const response = await axios.post('/api/approvals/request', {
      type: 'RESOURCE_EXTENSION',
      entityId: resourceAllocation._id,
      requestedData: {
        newEndDate: formData.newEndDate,
        newAllocation: formData.allocationPercent,
        reason: formData.reason
      }
    });
    
    toast.success(`Extension request submitted. Approval ID: ${response.data.requestId}`);
  };
  ```

**Estimated Time**: 8-10 hours

---

#### **2.3 Approval Dashboard** (Priority: Medium)

**File**: `src/pages/rmg/approvals/ApprovalsPage.tsx` (CREATE NEW)

**Tasks**:
- [ ] **Task 2.3.1**: Create approvals list page
  - Tabs: Pending, Approved, Rejected, All
  - Filters: Request Type, Date Range, Requestor
  - Search by Request ID or Resource Name

- [ ] **Task 2.3.2**: Create approval detail drawer
  - Show resource details (name, current project, current FL)
  - Show current allocation dates and %
  - Show requested changes (highlighted in diff format)
  - Display reason for extension
  - Show approval chain with status indicators
  - Action buttons: Approve, Reject, Add Comments

- [ ] **Task 2.3.3**: Implement approval actions
  ```typescript
  const handleApprove = async (approvalId: string, comments: string) => {
    await axios.post(`/api/approvals/${approvalId}/approve`, { comments });
    toast.success('Request approved');
    // Trigger email notification to requestor
    // If final approver, automatically update resource allocation
  };
  ```

**Estimated Time**: 12-15 hours

---

#### **2.4 Notification System Integration** (Priority: Medium)

**File**: `server/src/services/notificationService.js` (CREATE NEW)

**Tasks**:
- [ ] **Task 2.4.1**: Create notification templates
  ```javascript
  templates = {
    APPROVAL_REQUESTED: {
      subject: 'New Approval Request: Resource Extension',
      body: `{approverName}, you have a new approval request...`
    },
    APPROVAL_APPROVED: {
      subject: 'Approval Request Approved',
      body: `Your request #{requestId} has been approved...`
    },
    APPROVAL_REJECTED: {
      subject: 'Approval Request Rejected',
      body: `Your request #{requestId} has been rejected...`
    }
  }
  ```

- [ ] **Task 2.4.2**: Implement email sending
  - Use NodeMailer or similar library
  - Queue emails in background job
  - Store notification history in database

- [ ] **Task 2.4.3**: Add in-app notifications
  - Create NotificationBell component in header
  - Show unread count badge
  - Store notifications in MongoDB
  - Mark as read functionality

**Estimated Time**: 8-10 hours

---

## 📦 Feature 3: Project End Date Extension Workflow

### **Goal**: Allow project end date extension with cascade impact analysis

### Prerequisites:
- ✅ Project edit form exists
- ⏳ FL impact analysis
- ⏳ Resource impact analysis

### Action Items:

#### **3.1 Backend - Project Date Extension API** (Priority: High)

**File**: `server/src/routes/projects.ts`

**Tasks**:
- [ ] **Task 3.1.1**: Create `POST /api/projects/:id/extend-dates` endpoint
  ```javascript
  // Input: { newEndDate, reason, extendDependencies: boolean }
  // Steps:
  // 1. Validate new end date > current end date
  // 2. Get all FLs where FL end date > project current end date
  // 3. Get all resources where resource end date > project current end date
  // 4. Return impact analysis: { affectedFLs: [], affectedResources: [] }
  ```

- [ ] **Task 3.1.2**: Create `getProjectExtensionImpact(projectId, newEndDate)`
  ```javascript
  const impact = {
    financialLines: {
      total: 10,
      withinNewDate: 7,  // FLs that end before new project end date
      exceedNewDate: 3,   // FLs that still exceed new project end date
      details: [
        { flNo, flName, currentEndDate, status: 'OK' | 'STILL_EXCEEDS' }
      ]
    },
    resources: {
      total: 25,
      withinNewDate: 20,
      exceedNewDate: 5,
      details: [...]
    },
    estimatedImpact: {
      budgetChange: 0,  // If new POs needed
      revenueChange: 0  // If more revenue can be recognized
    }
  };
  ```

- [ ] **Task 3.1.3**: Implement cascade update
  ```javascript
  if (extendDependencies) {
    // Update project end date
    await Project.updateOne({ _id: projectId }, { projectEndDate: newEndDate });
    
    // Option 1: Auto-extend FLs (if they end exactly on old project end date)
    await FinancialLine.updateMany(
      { projectId, scheduleFinish: oldProjectEndDate },
      { scheduleFinish: newEndDate }
    );
    
    // Option 2: Flag FLs for manual review
    await FinancialLine.updateMany(
      { projectId, scheduleFinish: { $gte: oldProjectEndDate } },
      { $set: { requiresDateReview: true } }
    );
  }
  ```

**Estimated Time**: 8-10 hours

---

#### **3.2 Frontend - Project Extension Dialog** (Priority: High)

**File**: `src/pages/rmg/projects/components/ExtendProjectDatesDialog.tsx` (CREATE NEW)

**Tasks**:
- [ ] **Task 3.2.1**: Create extension dialog component
  ```tsx
  interface Props {
    project: Project;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }
  
  Steps:
  1. Date Selection
     - Current End Date (read-only)
     - New End Date (date picker)
     - Reason for Extension (textarea)
  
  2. Impact Analysis (auto-loads when date selected)
     - Show affected FLs count
     - Show affected resources count
     - Estimated budget impact
     - Warning messages if any FLs still exceed new date
  
  3. Extension Options
     - Checkbox: "Auto-extend Financial Lines ending on project end date"
     - Checkbox: "Auto-extend Resource Allocations ending on project end date"
     - Checkbox: "Send notification to Project Stakeholders"
  
  4. Confirmation
     - Summary of changes
     - Submit button: "Extend Project Dates"
  ```

- [ ] **Task 3.2.2**: Implement impact analysis call
  ```typescript
  const fetchImpactAnalysis = async (newEndDate: Date) => {
    const response = await axios.post(
      `/api/projects/${project._id}/analyze-extension-impact`,
      { newEndDate }
    );
    setImpact(response.data);
  };
  
  // Call on new end date selection (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newEndDate) fetchImpactAnalysis(newEndDate);
    }, 500);
    return () => clearTimeout(timer);
  }, [newEndDate]);
  ```

- [ ] **Task 3.2.3**: Add warning alerts
  ```tsx
  {impact.financialLines.exceedNewDate > 0 && (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Manual FL Review Required</AlertTitle>
      <AlertDescription>
        {impact.financialLines.exceedNewDate} Financial Lines still end after 
        the new project date. You'll need to manually adjust these FLs.
      </AlertDescription>
    </Alert>
  )}
  ```

**Estimated Time**: 10-12 hours

---

#### **3.3 Project Edit Page Integration** (Priority: Medium)

**File**: `src/pages/rmg/projects/ProjectDetailPage.tsx`

**Tasks**:
- [ ] **Task 3.3.1**: Add "Extend Project Dates" button
  - Location: Project header or Edit dropdown
  - Icon: Calendar with arrow
  - Permission check: Only PM/DM can extend

- [ ] **Task 3.3.2**: Handle extension success
  ```typescript
  const handleExtensionSuccess = () => {
    // Refresh project data
    fetchProjectById(id);
    
    // Show success message with links
    toast.success(
      <div>
        <p>Project dates extended successfully!</p>
        <Button variant="link" onClick={() => navigate('/financial-lines')}>
          Review Financial Lines →
        </Button>
      </div>
    );
    
    // If FLs flagged for review, show notification
    if (impact.financialLines.requiresReview > 0) {
      toast.warning(`${impact.financialLines.requiresReview} FLs need date review`);
    }
  };
  ```

**Estimated Time**: 4-6 hours

---

## 📦 Feature 4: Cascade Updates for Related Resources

### **Goal**: Automatically update related entities when FL dates change

### Prerequisites:
- ✅ FL-Resource relationship
- ⏳ Event-driven architecture
- ⏳ Change tracking system

### Action Items:

#### **4.1 Backend - Event System** (Priority: High)

**File**: `server/src/services/eventBus.js` (CREATE NEW)

**Tasks**:
- [ ] **Task 4.1.1**: Create event bus system
  ```javascript
  class EventBus {
    constructor() {
      this.listeners = {};
    }
    
    on(event, callback) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(callback);
    }
    
    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
      }
    }
  }
  
  // Events:
  // - 'fl:dateChanged'
  // - 'project:dateChanged'
  // - 'resource:allocated'
  // - 'resource:deallocated'
  ```

- [ ] **Task 4.1.2**: Register FL date change listeners
  ```javascript
  eventBus.on('fl:dateChanged', async (data) => {
    const { flId, oldDates, newDates, userId } = data;
    
    // 1. Update resource allocations
    await updateResourceDatesForFL(flId, newDates);
    
    // 2. Log change in audit trail
    await AuditLog.create({
      entity: 'FinancialLine',
      entityId: flId,
      action: 'DATE_CHANGED',
      oldData: oldDates,
      newData: newDates,
      userId
    });
    
    // 3. Send notifications
    await notifyStakeholders(flId, 'dates_changed');
  });
  ```

- [ ] **Task 4.1.3**: Implement cascade update logic
  ```javascript
  const updateResourceDatesForFL = async (flId, newDates) => {
    const resources = await FLResource.find({ flId });
    
    for (const resource of resources) {
      // Only update if resource end date was tied to FL end date
      if (resource.endDate === oldFLEndDate) {
        await FLResource.updateOne(
          { _id: resource._id },
          { 
            endDate: newDates.scheduleFinish,
            lastModifiedBy: 'SYSTEM_CASCADE',
            cascadeReason: 'FL_DATE_EXTENDED'
          }
        );
        
        // Emit resource date changed event
        eventBus.emit('resource:dateChanged', { resourceId: resource._id });
      }
    }
  };
  ```

**Estimated Time**: 10-12 hours

---

#### **4.2 Change Tracking & Audit Trail** (Priority: Medium)

**File**: `server/src/models/AuditLog.js` (CREATE NEW)

**Tasks**:
- [ ] **Task 4.2.1**: Create AuditLog schema
  ```javascript
  {
    logId: String (auto),
    entity: String (Project | FinancialLine | Resource),
    entityId: ObjectId,
    entityNumber: String (for display),
    action: String (CREATED | UPDATED | DELETED | DATE_CHANGED),
    fieldChanged: String,
    oldValue: Mixed,
    newValue: Mixed,
    userId: ObjectId,
    username: String,
    reason: String (manual change reason or 'CASCADE'),
    cascadeSource: String (if cascaded from another entity),
    timestamp: Date,
    ipAddress: String
  }
  ```

- [ ] **Task 4.2.2**: Add audit logging middleware
  ```javascript
  // Wrap update operations with audit logging
  const auditedUpdate = async (model, filter, update, userId) => {
    const oldDoc = await model.findOne(filter);
    const result = await model.updateOne(filter, update);
    
    // Compare old vs new and log differences
    const changedFields = detectChanges(oldDoc, update);
    await logChanges(model.modelName, oldDoc._id, changedFields, userId);
    
    return result;
  };
  ```

- [ ] **Task 4.2.3**: Create audit log viewer API
  - `GET /api/audit-logs?entity=FinancialLine&entityId=xxx`
  - `GET /api/audit-logs/cascade-chain?from=FL_123`

**Estimated Time**: 8-10 hours

---

#### **4.3 Frontend - Change History Viewer** (Priority: Low)

**File**: `src/components/shared/ChangeHistoryDrawer.tsx` (CREATE NEW)

**Tasks**:
- [ ] **Task 4.3.1**: Create change history component
  ```tsx
  interface Props {
    entity: 'Project' | 'FinancialLine' | 'Resource';
    entityId: string;
  }
  
  Display:
  - Timeline view of all changes
  - Filter by: Field Changed, User, Date Range
  - Show old vs new values
  - Highlight cascaded changes in different color
  - "View Cascade Chain" button for cascaded changes
  ```

- [ ] **Task 4.3.2**: Add to FL detail page
  - Button: "View Change History" in FL detail drawer
  - Shows all date changes, funding changes, etc.

**Estimated Time**: 6-8 hours

---

## 📊 Implementation Summary

### **Total Estimated Time by Priority**

| Priority | Features | Estimated Hours |
|----------|----------|----------------|
| **High** | Core backend APIs, validation, basic UI | 80-100 hours |
| **Medium** | Approval dashboard, notifications, audit | 50-60 hours |
| **Low** | Enhanced UI, history viewer | 20-30 hours |
| **TOTAL** | | **150-190 hours** |

### **Implementation Phases**

#### **Phase 1: Foundation (Week 1-2)**
- Backend APIs for FL extension
- Resource availability validation
- Basic frontend integration
- **Deliverable**: FL extension auto-updates resource dates

#### **Phase 2: Approval Workflow (Week 3-4)**  
- Approval request system
- Notification service
- Approval dashboard
- **Deliverable**: Full approval workflow operational

#### **Phase 3: Project Integration (Week 5-6)**
- Project date extension workflow
- Impact analysis
- Cascade update system
- **Deliverable**: End-to-end project extension workflow

#### **Phase 4: Polish & Audit (Week 7)**
- Audit trail system
- Change history viewer
- Testing and bug fixes
- **Deliverable**: Production-ready system

---

## 🔗 Dependencies & Prerequisites

### **External Systems Required**:
1. **Email Service**: SendGrid / AWS SES / NodeMailer
2. **Background Job Queue**: Bull / Agenda (for async notifications)
3. **MongoDB Transactions**: Ensure MongoDB 4.0+ for multi-document transactions

### **Database Collections to Create**:
1. `approval_requests` - Approval workflow tracking
2. `audit_logs` - Change history tracking
3. `notifications` - In-app notifications
4. `approval_templates` - Approval rules configuration

### **Environment Variables Needed**:
```env
EMAIL_SERVICE_API_KEY=xxx
SMTP_HOST=smtp.example.com
SMTP_PORT=587
NOTIFICATION_FROM_EMAIL=noreply@rmg.com
APPROVAL_ADMIN_EMAILS=admin@rmg.com
```

---

## ⚠️ Risks & Challenges

### **Technical Risks**:
1. **Race Conditions**: Multiple users extending FL/Project simultaneously
   - **Mitigation**: Implement optimistic locking with version numbers

2. **Data Inconsistency**: Cascade updates fail midway
   - **Mitigation**: Use MongoDB transactions, rollback on error

3. **Performance**: Complex impact analysis on large projects
   - **Mitigation**: Add database indexes, cache impact analysis results

### **Business Logic Risks**:
1. **Over-Extension**: Users extending dates without proper budget allocation
   - **Mitigation**: Add budget validation in extension workflow

2. **Resource Conflicts**: Auto-extending resources creates >100% utilization
   - **Mitigation**: Mandatory conflict resolution before extension

---

## 📋 Checklist for Each Feature

Use this checklist when implementing each feature:

### **Backend**:
- [ ] API endpoints created with proper validation
- [ ] Database schema/models created
- [ ] Business logic implemented with error handling
- [ ] Unit tests written (coverage >80%)
- [ ] API documentation updated (Swagger/Postman)

### **Frontend**:
- [ ] UI components created following design system
- [ ] Form validation with user-friendly error messages
- [ ] Loading states and error boundaries
- [ ] TypeScript types defined
- [ ] Responsive design (mobile/tablet/desktop)

### **Integration**:
- [ ] Frontend-backend integration tested
- [ ] Error scenarios handled gracefully
- [ ] Success/failure notifications shown
- [ ] Data refresh triggers working
- [ ] Optimistic UI updates where applicable

### **Testing**:
- [ ] Happy path tested
- [ ] Edge cases tested (dates, validations, conflicts)
- [ ] Error scenarios tested (API failures, network issues)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance testing (100+ records)

---

## 🎓 Learning Resources

### **Related Technologies**:
1. **MongoDB Transactions**: https://docs.mongodb.com/manual/core/transactions/
2. **Event-Driven Architecture**: https://martinfowler.com/articles/201701-event-driven.html
3. **Approval Workflow Patterns**: https://www.workflowgen.com/approval-workflow-patterns/

### **Code Examples**:
- Approval workflow: Look at existing helpdesk workflow in codebase
- Date validation: Reference FL creation validation logic
- Cascade updates: Study existing FL-PO relationship updates

---

## 📞 Support & Questions

For technical questions or clarification on any action item:
1. Review existing similar functionality in codebase (Helpdesk approval flow)
2. Check PROJECT_FL_ENHANCEMENTS_SUMMARY.md for current state
3. Consult team lead for business rule clarifications

---

**Document Version**: 1.0  
**Last Updated**: February 17, 2026  
**Status**: Ready for Implementation Planning
