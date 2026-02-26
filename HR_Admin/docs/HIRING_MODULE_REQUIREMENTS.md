# Hiring Module Requirements Document

**Version:** 1.0  
**Last Updated:** January 29, 2026  
**Status:** Ready for Implementation

---

## 📋 Executive Summary

The Hiring Module enables **Hiring Managers** to raise hiring requests for their departments, while **HR** manages the recruitment process. This creates a streamlined workflow where managers identify resource needs and HR handles the recruitment lifecycle.

---

## 🎯 Module Overview

### Purpose
Enable department managers to request new hires while HR manages the recruitment process from request to closure.

### Key Users
1. **Hiring Managers** - Department heads, team leads who need to fill positions
2. **HR Team** - Human Resources personnel managing recruitment
3. **Admin** - System administrators

### Core Workflow
```
Hiring Manager creates request (Draft)
    ↓
Submit to HR (Submitted)
    ↓
HR acknowledges and opens recruitment (Open)
    ↓
HR manages recruitment process (In Progress)
    ↓
HR closes request with outcome (Closed)
```

---

## 👥 User Roles & Permissions

### 1. Hiring Manager
**Can:**
- Create hiring requests for their department
- Save requests as drafts
- Edit/delete draft requests
- Submit requests to HR
- View own requests (all statuses)
- View request history

**Cannot:**
- View other managers' requests
- Update request status (after submission)
- Delete submitted requests
- Access HR notes

### 2. HR
**Can:**
- View all hiring requests (across all departments)
- Create requests (for company-wide positions)
- Update request status
- Assign requests to HR recruiters
- Add internal HR notes
- Close requests with reasons
- Edit any request (if needed)
- Delete any request

**Cannot:**
- (Full access granted)

### 3. Admin
**Can:**
- Full access to all features
- Manage system settings
- View analytics and reports

---

## 🗂️ Data Model

### HiringRequest Schema

```typescript
interface HiringRequest {
  _id: string;
  requestNumber: string; // Auto-generated: HIR-2026-001, HIR-2026-002, etc.
  
  // Hiring Manager Information
  hiringManagerId: string; // Employee ID from User collection
  hiringManagerName: string;
  department: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  
  // Position Details
  jobTitle: string; // Required
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern'; // Required
  hiringType: 'New Position' | 'Replacement'; // Required
  
  // Replacement Details (conditional - only if hiringType = 'Replacement')
  replacementDetails?: {
    employeeName: string;
    reasonForReplacement: string;
    lastWorkingDay: Date;
  };
  
  // Experience Requirements
  minimumYears: number; // Required (0-50)
  preferredIndustry?: string; // Optional
  
  // Work Details
  workLocation: 'On-site' | 'Remote' | 'Hybrid'; // Required
  preferredJoiningDate: Date; // Required
  shiftOrHours?: string; // Optional (e.g., "9 AM - 6 PM", "Rotational Shifts")
  
  // Compensation
  budgetRange: {
    min: number; // Required
    max: number; // Required (must be >= min)
    currency: string; // Default: 'INR'
  };
  
  // Business Justification
  justification: string; // Required - Why is this position needed?
  
  // Status Management
  status: 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
  
  // HR Management Fields
  hrAssignedTo?: string; // HR recruiter Employee ID
  hrAssignedToName?: string;
  hrNotes?: string; // Internal HR notes (not visible to hiring manager)
  closureReason?: string; // Required when status = 'Closed'
  closureType?: 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
  
  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID who created
  lastModifiedBy: string; // User ID who last modified
  submittedAt?: Date; // When manager submitted to HR
  openedAt?: Date; // When HR opened for recruitment
  closedAt?: Date; // When HR closed the request
  
  // Activity History
  activityLog: Array<{
    action: string; // e.g., "Created", "Submitted", "Status changed to Open"
    performedBy: string; // User ID
    performedByName: string;
    timestamp: Date;
    notes?: string;
  }>;
}
```

### Mongoose Schema Indexes
```typescript
- requestNumber: unique, index
- hiringManagerId: index
- department: index
- status: index
- createdAt: index (descending)
- submittedAt: index
```

---

## 🛠️ Technical Implementation

### Backend Structure

#### 1. Model (`server/src/models/HiringRequest.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IHiringRequest extends Document {
  requestNumber: string;
  hiringManagerId: string;
  hiringManagerName: string;
  department: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  hiringType: 'New Position' | 'Replacement';
  replacementDetails?: {
    employeeName: string;
    reasonForReplacement: string;
    lastWorkingDay: Date;
  };
  minimumYears: number;
  preferredIndustry?: string;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  preferredJoiningDate: Date;
  shiftOrHours?: string;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  justification: string;
  status: 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
  hrAssignedTo?: string;
  hrAssignedToName?: string;
  hrNotes?: string;
  closureReason?: string;
  closureType?: 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  submittedAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
  activityLog: Array<{
    action: string;
    performedBy: string;
    performedByName: string;
    timestamp: Date;
    notes?: string;
  }>;
}

const HiringRequestSchema = new Schema<IHiringRequest>({
  requestNumber: { type: String, required: true, unique: true },
  hiringManagerId: { type: String, required: true, index: true },
  hiringManagerName: { type: String, required: true },
  department: { type: String, required: true, index: true },
  designation: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  jobTitle: { type: String, required: true },
  employmentType: { 
    type: String, 
    required: true,
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern']
  },
  hiringType: { 
    type: String, 
    required: true,
    enum: ['New Position', 'Replacement']
  },
  replacementDetails: {
    employeeName: String,
    reasonForReplacement: String,
    lastWorkingDay: Date
  },
  minimumYears: { type: Number, required: true, min: 0, max: 50 },
  preferredIndustry: String,
  workLocation: { 
    type: String, 
    required: true,
    enum: ['On-site', 'Remote', 'Hybrid']
  },
  preferredJoiningDate: { type: Date, required: true },
  shiftOrHours: String,
  budgetRange: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' }
  },
  justification: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    default: 'Draft',
    enum: ['Draft', 'Submitted', 'Open', 'In Progress', 'Closed'],
    index: true
  },
  hrAssignedTo: String,
  hrAssignedToName: String,
  hrNotes: String,
  closureReason: String,
  closureType: {
    type: String,
    enum: ['Position Filled', 'Request Cancelled', 'Budget Denied', 'Other']
  },
  createdBy: { type: String, required: true },
  lastModifiedBy: { type: String, required: true },
  submittedAt: Date,
  openedAt: Date,
  closedAt: Date,
  activityLog: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    performedByName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, {
  timestamps: true
});

// Auto-generate request number
HiringRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('HiringRequest').countDocuments({
      requestNumber: new RegExp(`^HIR-${year}-`)
    });
    this.requestNumber = `HIR-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Validation: max >= min for budget
HiringRequestSchema.pre('save', function(next) {
  if (this.budgetRange.max < this.budgetRange.min) {
    next(new Error('Budget max must be greater than or equal to min'));
  }
  next();
});

// Validation: replacement details required if hiring type is Replacement
HiringRequestSchema.pre('save', function(next) {
  if (this.hiringType === 'Replacement' && !this.replacementDetails) {
    next(new Error('Replacement details required for replacement hiring type'));
  }
  next();
});

export default mongoose.model<IHiringRequest>('HiringRequest', HiringRequestSchema);
```

#### 2. Routes (`server/src/routes/hiring.ts`)

```typescript
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import * as hiringController from '../controllers/hiringController';

const router = express.Router();

// Hiring Manager Routes (authenticated users with HIRING_MANAGER, HR, or ADMIN role)
router.post('/requests', 
  authenticateToken, 
  checkRole(['HIRING_MANAGER', 'HR', 'ADMIN']),
  hiringController.createHiringRequest
);

router.get('/requests/my-requests', 
  authenticateToken, 
  checkRole(['HIRING_MANAGER', 'HR', 'ADMIN']),
  hiringController.getMyRequests
);

router.get('/requests/:id', 
  authenticateToken,
  hiringController.getRequestById // Will check ownership inside controller
);

router.patch('/requests/:id', 
  authenticateToken,
  hiringController.updateRequest // Can only update drafts, ownership check inside
);

router.delete('/requests/:id', 
  authenticateToken,
  hiringController.deleteRequest // Can only delete drafts, ownership check inside
);

router.post('/requests/:id/submit', 
  authenticateToken,
  checkRole(['HIRING_MANAGER', 'HR', 'ADMIN']),
  hiringController.submitRequest
);

// HR-Only Routes
router.get('/requests', 
  authenticateToken, 
  checkRole(['HR', 'ADMIN']),
  hiringController.getAllRequests
);

router.patch('/requests/:id/status', 
  authenticateToken, 
  checkRole(['HR', 'ADMIN']),
  hiringController.updateStatus
);

router.patch('/requests/:id/assign', 
  authenticateToken, 
  checkRole(['HR', 'ADMIN']),
  hiringController.assignRecruiter
);

router.post('/requests/:id/close', 
  authenticateToken, 
  checkRole(['HR', 'ADMIN']),
  hiringController.closeRequest
);

router.get('/statistics', 
  authenticateToken, 
  checkRole(['HR', 'ADMIN']),
  hiringController.getStatistics
);

export default router;
```

#### 3. Controller (`server/src/controllers/hiringController.ts`)

```typescript
import { Request, Response } from 'express';
import HiringRequest from '../models/HiringRequest';
import User from '../models/User';

// Create hiring request
export const createHiringRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hiringRequest = new HiringRequest({
      ...req.body,
      hiringManagerId: userId,
      hiringManagerName: user.name,
      department: user.department || req.body.department,
      designation: user.designation || req.body.designation,
      contactEmail: user.email,
      contactPhone: user.phone || req.body.contactPhone,
      createdBy: userId,
      lastModifiedBy: userId,
      activityLog: [{
        action: 'Created',
        performedBy: userId,
        performedByName: user.name,
        timestamp: new Date()
      }]
    });

    await hiringRequest.save();
    res.status(201).json(hiringRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get hiring manager's own requests
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { status, startDate, endDate } = req.query;

    const filter: any = { hiringManagerId: userId };

    if (status) {
      filter.status = { $in: (status as string).split(',') };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const requests = await HiringRequest.find(filter)
      .sort({ createdAt: -1 })
      .select('-hrNotes'); // Don't send HR notes to hiring managers

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all requests (HR only)
export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const { status, department, employmentType, startDate, endDate, search } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = { $in: (status as string).split(',') };
    }

    if (department) {
      filter.department = department;
    }

    if (employmentType) {
      filter.employmentType = { $in: (employmentType as string).split(',') };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    if (search) {
      filter.$or = [
        { jobTitle: new RegExp(search as string, 'i') },
        { requestNumber: new RegExp(search as string, 'i') },
        { hiringManagerName: new RegExp(search as string, 'i') }
      ];
    }

    const requests = await HiringRequest.find(filter)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get request by ID
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check access: own request or HR/Admin
    if (request.hiringManagerId !== userId && !['HR', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove HR notes if not HR/Admin
    if (!['HR', 'ADMIN'].includes(userRole)) {
      request.hrNotes = undefined;
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update request (only drafts)
export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check access and status
    if (request.hiringManagerId !== userId && !['HR', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (request.status !== 'Draft' && !['HR', 'ADMIN'].includes(userRole)) {
      return res.status(400).json({ error: 'Can only edit draft requests' });
    }

    const user = await User.findById(userId);
    
    Object.assign(request, req.body);
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Updated',
      performedBy: userId,
      performedByName: user.name,
      timestamp: new Date(),
      notes: req.body.updateNotes
    });

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete request (only drafts)
export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check access and status
    if (request.hiringManagerId !== userId && !['HR', 'ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (request.status !== 'Draft' && !['HR', 'ADMIN'].includes(userRole)) {
      return res.status(400).json({ error: 'Can only delete draft requests' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit request to HR
export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.hiringManagerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (request.status !== 'Draft') {
      return res.status(400).json({ error: 'Can only submit draft requests' });
    }

    const user = await User.findById(userId);

    request.status = 'Submitted';
    request.submittedAt = new Date();
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Submitted to HR',
      performedBy: userId,
      performedByName: user.name,
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to HR team

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status (HR only)
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const user = await User.findById(userId);
    const oldStatus = request.status;
    request.status = status;
    request.lastModifiedBy = userId;

    if (status === 'Open' && !request.openedAt) {
      request.openedAt = new Date();
    }

    request.activityLog.push({
      action: `Status changed from ${oldStatus} to ${status}`,
      performedBy: userId,
      performedByName: user.name,
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to hiring manager

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign recruiter (HR only)
export const assignRecruiter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { recruiterId } = req.body;
    const userId = req.user.id;

    const request = await HiringRequest.findById(id);
    const recruiter = await User.findById(recruiterId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }

    const user = await User.findById(userId);

    request.hrAssignedTo = recruiterId;
    request.hrAssignedToName = recruiter.name;
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: `Assigned to ${recruiter.name}`,
      performedBy: userId,
      performedByName: user.name,
      timestamp: new Date()
    });

    await request.save();

    // TODO: Send notification to assigned recruiter

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Close request (HR only)
export const closeRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { closureReason, closureType } = req.body;
    const userId = req.user.id;

    if (!closureReason) {
      return res.status(400).json({ error: 'Closure reason is required' });
    }

    const request = await HiringRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const user = await User.findById(userId);

    request.status = 'Closed';
    request.closureReason = closureReason;
    request.closureType = closureType;
    request.closedAt = new Date();
    request.lastModifiedBy = userId;
    request.activityLog.push({
      action: 'Closed',
      performedBy: userId,
      performedByName: user.name,
      timestamp: new Date(),
      notes: closureReason
    });

    await request.save();

    // TODO: Send notification to hiring manager

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statistics (HR only)
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const total = await HiringRequest.countDocuments();
    const draft = await HiringRequest.countDocuments({ status: 'Draft' });
    const submitted = await HiringRequest.countDocuments({ status: 'Submitted' });
    const open = await HiringRequest.countDocuments({ status: 'Open' });
    const inProgress = await HiringRequest.countDocuments({ status: 'In Progress' });
    const closed = await HiringRequest.countDocuments({ status: 'Closed' });

    // Get department-wise breakdown
    const byDepartment = await HiringRequest.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get employment type breakdown
    const byEmploymentType = await HiringRequest.aggregate([
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    // Average time to close (in days)
    const closedRequests = await HiringRequest.find({ 
      status: 'Closed',
      submittedAt: { $exists: true },
      closedAt: { $exists: true }
    });

    let avgTimeToClose = 0;
    if (closedRequests.length > 0) {
      const totalDays = closedRequests.reduce((sum, req) => {
        const days = Math.floor((req.closedAt.getTime() - req.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgTimeToClose = Math.round(totalDays / closedRequests.length);
    }

    res.json({
      total,
      byStatus: { draft, submitted, open, inProgress, closed },
      byDepartment,
      byEmploymentType,
      avgTimeToClose
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### 4. Middleware (`server/src/middleware/checkRole.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};
```

---

### Frontend Structure

#### 1. Types (`src/types/hiring.ts`)

```typescript
export interface HiringRequest {
  _id: string;
  requestNumber: string;
  hiringManagerId: string;
  hiringManagerName: string;
  department: string;
  designation: string;
  contactEmail: string;
  contactPhone: string;
  jobTitle: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';
  hiringType: 'New Position' | 'Replacement';
  replacementDetails?: {
    employeeName: string;
    reasonForReplacement: string;
    lastWorkingDay: Date;
  };
  minimumYears: number;
  preferredIndustry?: string;
  workLocation: 'On-site' | 'Remote' | 'Hybrid';
  preferredJoiningDate: Date;
  shiftOrHours?: string;
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  justification: string;
  status: 'Draft' | 'Submitted' | 'Open' | 'In Progress' | 'Closed';
  hrAssignedTo?: string;
  hrAssignedToName?: string;
  hrNotes?: string;
  closureReason?: string;
  closureType?: 'Position Filled' | 'Request Cancelled' | 'Budget Denied' | 'Other';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  submittedAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
  activityLog: Array<{
    action: string;
    performedBy: string;
    performedByName: string;
    timestamp: Date;
    notes?: string;
  }>;
}

export interface HiringStatistics {
  total: number;
  byStatus: {
    draft: number;
    submitted: number;
    open: number;
    inProgress: number;
    closed: number;
  };
  byDepartment: Array<{ _id: string; count: number }>;
  byEmploymentType: Array<{ _id: string; count: number }>;
  avgTimeToClose: number;
}

export interface HiringFilters {
  status: string[];
  department: string;
  employmentType: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}
```

#### 2. Store (`src/store/hiringStore.ts`)

```typescript
import { create } from 'zustand';
import { HiringRequest, HiringStatistics, HiringFilters } from '../types/hiring';
import hiringService from '../services/hiringService';

interface HiringStore {
  requests: HiringRequest[];
  currentRequest: HiringRequest | null;
  statistics: HiringStatistics | null;
  isLoading: boolean;
  error: string | null;
  filters: HiringFilters;

  // Actions
  fetchRequests: (isHR?: boolean) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: Partial<HiringRequest>) => Promise<void>;
  updateRequest: (id: string, data: Partial<HiringRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  submitRequest: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  assignRecruiter: (id: string, recruiterId: string) => Promise<void>;
  closeRequest: (id: string, closureReason: string, closureType: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  setFilters: (filters: Partial<HiringFilters>) => void;
  clearFilters: () => void;
  setCurrentRequest: (request: HiringRequest | null) => void;
}

const useHiringStore = create<HiringStore>((set, get) => ({
  requests: [],
  currentRequest: null,
  statistics: null,
  isLoading: false,
  error: null,
  filters: {
    status: [],
    department: '',
    employmentType: [],
    dateRange: { start: null, end: null },
    searchQuery: ''
  },

  fetchRequests: async (isHR = false) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const requests = isHR 
        ? await hiringService.getAllRequests(filters)
        : await hiringService.getMyRequests(filters);
      set({ requests, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchRequestById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const request = await hiringService.getRequestById(id);
      set({ currentRequest: request, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createRequest: async (data: Partial<HiringRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await hiringService.createRequest(data);
      set(state => ({ 
        requests: [newRequest, ...state.requests],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateRequest: async (id: string, data: Partial<HiringRequest>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.updateRequest(id, data);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await hiringService.deleteRequest(id);
      set(state => ({
        requests: state.requests.filter(r => r._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  submitRequest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.submitRequest(id);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.updateStatus(id, status);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  assignRecruiter: async (id: string, recruiterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.assignRecruiter(id, recruiterId);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  closeRequest: async (id: string, closureReason: string, closureType: string) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await hiringService.closeRequest(id, closureReason, closureType);
      set(state => ({
        requests: state.requests.map(r => r._id === id ? updated : r),
        currentRequest: state.currentRequest?._id === id ? updated : state.currentRequest,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchStatistics: async () => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await hiringService.getStatistics();
      set({ statistics, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<HiringFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        status: [],
        department: '',
        employmentType: [],
        dateRange: { start: null, end: null },
        searchQuery: ''
      }
    });
  },

  setCurrentRequest: (request: HiringRequest | null) => {
    set({ currentRequest: request });
  }
}));

export default useHiringStore;
```

#### 3. Service (`src/services/hiringService.ts`)

```typescript
import axios from 'axios';
import { HiringRequest, HiringStatistics, HiringFilters } from '../types/hiring';

const API_BASE = '/api/hiring';

class HiringService {
  async getMyRequests(filters?: Partial<HiringFilters>): Promise<HiringRequest[]> {
    const params = this.buildQueryParams(filters);
    const response = await axios.get(`${API_BASE}/requests/my-requests`, { params });
    return response.data;
  }

  async getAllRequests(filters?: Partial<HiringFilters>): Promise<HiringRequest[]> {
    const params = this.buildQueryParams(filters);
    const response = await axios.get(`${API_BASE}/requests`, { params });
    return response.data;
  }

  async getRequestById(id: string): Promise<HiringRequest> {
    const response = await axios.get(`${API_BASE}/requests/${id}`);
    return response.data;
  }

  async createRequest(data: Partial<HiringRequest>): Promise<HiringRequest> {
    const response = await axios.post(`${API_BASE}/requests`, data);
    return response.data;
  }

  async updateRequest(id: string, data: Partial<HiringRequest>): Promise<HiringRequest> {
    const response = await axios.patch(`${API_BASE}/requests/${id}`, data);
    return response.data;
  }

  async deleteRequest(id: string): Promise<void> {
    await axios.delete(`${API_BASE}/requests/${id}`);
  }

  async submitRequest(id: string): Promise<HiringRequest> {
    const response = await axios.post(`${API_BASE}/requests/${id}/submit`);
    return response.data;
  }

  async updateStatus(id: string, status: string): Promise<HiringRequest> {
    const response = await axios.patch(`${API_BASE}/requests/${id}/status`, { status });
    return response.data;
  }

  async assignRecruiter(id: string, recruiterId: string): Promise<HiringRequest> {
    const response = await axios.patch(`${API_BASE}/requests/${id}/assign`, { recruiterId });
    return response.data;
  }

  async closeRequest(id: string, closureReason: string, closureType: string): Promise<HiringRequest> {
    const response = await axios.post(`${API_BASE}/requests/${id}/close`, { 
      closureReason, 
      closureType 
    });
    return response.data;
  }

  async getStatistics(): Promise<HiringStatistics> {
    const response = await axios.get(`${API_BASE}/statistics`);
    return response.data;
  }

  private buildQueryParams(filters?: Partial<HiringFilters>): any {
    if (!filters) return {};

    const params: any = {};

    if (filters.status && filters.status.length > 0) {
      params.status = filters.status.join(',');
    }

    if (filters.department) {
      params.department = filters.department;
    }

    if (filters.employmentType && filters.employmentType.length > 0) {
      params.employmentType = filters.employmentType.join(',');
    }

    if (filters.dateRange?.start) {
      params.startDate = filters.dateRange.start.toISOString();
    }

    if (filters.dateRange?.end) {
      params.endDate = filters.dateRange.end.toISOString();
    }

    if (filters.searchQuery) {
      params.search = filters.searchQuery;
    }

    return params;
  }
}

export default new HiringService();
```

#### 4. Form Validation Schema (`src/schemas/hiringSchema.ts`)

```typescript
import { z } from 'zod';

export const hiringRequestSchema = z.object({
  // Position Details
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern'], {
    required_error: 'Employment type is required'
  }),
  hiringType: z.enum(['New Position', 'Replacement'], {
    required_error: 'Hiring type is required'
  }),

  // Conditional Replacement Details
  replacementDetails: z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    reasonForReplacement: z.string().min(1, 'Reason is required'),
    lastWorkingDay: z.date({ required_error: 'Last working day is required' })
  }).optional(),

  // Experience
  minimumYears: z.number()
    .min(0, 'Minimum years must be at least 0')
    .max(50, 'Minimum years cannot exceed 50'),
  preferredIndustry: z.string().optional(),

  // Work Details
  workLocation: z.enum(['On-site', 'Remote', 'Hybrid'], {
    required_error: 'Work location is required'
  }),
  preferredJoiningDate: z.date({ required_error: 'Preferred joining date is required' }),
  shiftOrHours: z.string().optional(),

  // Compensation
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be at least 0'),
    max: z.number().min(0, 'Maximum budget must be at least 0')
  }).refine(data => data.max >= data.min, {
    message: 'Maximum budget must be greater than or equal to minimum',
    path: ['max']
  }),

  // Business Justification
  justification: z.string()
    .min(20, 'Justification must be at least 20 characters')
    .max(1000, 'Justification cannot exceed 1000 characters'),

  // Contact (auto-filled but can be overridden)
  contactPhone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits')
    .optional()
}).refine(data => {
  // If hiring type is Replacement, replacement details are required
  if (data.hiringType === 'Replacement' && !data.replacementDetails) {
    return false;
  }
  return true;
}, {
  message: 'Replacement details are required for replacement hiring type',
  path: ['replacementDetails']
});

export type HiringRequestFormData = z.infer<typeof hiringRequestSchema>;
```

---

## 🎨 Page Components

### 1. Hiring Manager Pages

**a. My Hiring Requests Page** (`src/pages/hiring-manager/MyHiringRequestsPage.tsx`)
- Table view of all hiring manager's requests
- Filters: Status, Date Range
- Search by job title or request number
- Actions: View, Edit (drafts only), Delete (drafts only), Submit
- "Create New Request" button

**b. Create/Edit Request Page** (`src/pages/hiring-manager/HiringRequestFormPage.tsx`)
- Multi-section form based on [Hiring_Request_Form.md](Hiring_Request_Form.md)
- Conditional fields (replacement details)
- Form validation with error messages
- "Save as Draft" and "Submit to HR" buttons

**c. Request Details Page** (`src/pages/hiring-manager/HiringRequestDetailsPage.tsx`)
- View all request details
- Activity timeline
- Status badge
- Edit button (if draft)
- Delete button (if draft)

### 2. HR Pages

**a. All Hiring Requests Page** (`src/pages/hr/HiringRequestsPage.tsx`)
- Table view of all requests across all departments
- Advanced filters: Status, Department, Employment Type, Date Range
- Search by job title, request number, hiring manager name
- Actions: View, Edit, Assign, Update Status, Close
- Statistics widgets at top

**b. Request Details Page** (`src/pages/hr/HRHiringRequestDetailsPage.tsx`)
- View all request details (including HR notes)
- Activity timeline
- Quick actions: Assign Recruiter, Update Status, Close Request
- HR Notes section (private)
- Hiring manager contact info

---

## 🎨 UI Components

### 1. Status Badge Component
```typescript
// Color coding:
// Draft: Gray
// Submitted: Blue
// Open: Green
// In Progress: Yellow
// Closed: Gray (with checkmark)
```

### 2. Activity Timeline Component
- Vertical timeline showing all activities
- Icons for different actions (created, submitted, status change, etc.)
- Timestamps and user names
- Expandable notes/comments

### 3. Request Form Component
- Section 1: Position Details
- Section 2: Replacement Details (conditional)
- Section 3: Experience Requirements
- Section 4: Work Details & Timeline
- Section 5: Compensation & Budget
- Section 6: Business Justification

### 4. Filter Sidebar Component
- Status multi-select checkboxes
- Department dropdown (HR only)
- Employment type multi-select
- Date range picker
- Clear all filters button

### 5. Statistics Dashboard Widget
```
┌─────────────────────────────────────┐
│  Hiring Requests Overview           │
├─────────────────────────────────────┤
│  Total: 45    Open: 12              │
│  Submitted: 8  In Progress: 15      │
│  Closed: 10                         │
│  Avg. Time to Close: 18 days        │
└─────────────────────────────────────┘
```

---

## 📱 Navigation Structure

### Hiring Manager Role
```
Main Menu
├── Dashboard
├── My Hiring Requests
│   ├── All Requests
│   ├── Drafts
│   ├── Submitted
│   └── Create New
└── Profile
```

### HR Role
```
Main Menu
├── HR Dashboard
├── Hiring Management
│   ├── All Requests
│   ├── Submitted Requests
│   ├── Active Recruitment
│   ├── Assigned to Me
│   ├── Create Request
│   └── Statistics
├── Employee Management
└── Profile
```

---

## 🔔 Notification System

### Email Notifications

**1. When Hiring Manager Submits Request**
- **To:** HR Team
- **Subject:** New Hiring Request - [Job Title]
- **Body:** [Manager Name] has submitted a hiring request for [Job Title] in [Department]

**2. When HR Opens Request for Recruitment**
- **To:** Hiring Manager
- **Subject:** Hiring Request [Request Number] - Opened
- **Body:** Your hiring request for [Job Title] has been opened for recruitment

**3. When Status Changes**
- **To:** Hiring Manager
- **Subject:** Hiring Request [Request Number] - Status Update
- **Body:** Status changed to [New Status]

**4. When Request is Closed**
- **To:** Hiring Manager
- **Subject:** Hiring Request [Request Number] - Closed
- **Body:** Your hiring request has been closed. Reason: [Closure Reason]

**5. When Recruiter is Assigned**
- **To:** Assigned Recruiter
- **Subject:** Hiring Request [Request Number] - Assigned to You
- **Body:** You have been assigned to recruit for [Job Title]

### In-App Notifications
- Real-time notifications using existing notification system
- Badge count on "My Requests" or "Hiring Management" menu
- Toast notifications for immediate actions

---

## 🧪 Testing Strategy

### Unit Tests
- Form validation logic
- Request number generation
- Budget range validation (max >= min)
- Conditional replacement details validation
- Status transition rules

### Integration Tests
- Create request API
- Submit request workflow
- Update status flow
- Assign recruiter
- Close request with reason
- Filter and search functionality

### E2E Tests
1. **Hiring Manager Flow:**
   - Create draft request
   - Edit draft
   - Submit to HR
   - View submitted request (read-only)

2. **HR Flow:**
   - View all requests
   - Filter by department
   - Assign recruiter
   - Update status to Open
   - Update status to In Progress
   - Close request

3. **Notifications:**
   - Manager submits → HR receives notification
   - HR updates status → Manager receives notification

---

## 📊 Reports & Analytics (Future Phase)

### Dashboard Metrics
- Total requests (all-time)
- Active requests (Open + In Progress)
- Requests by status (pie chart)
- Requests by department (bar chart)
- Requests by employment type (pie chart)
- Average time to close (days)
- Requests created this month
- Requests closed this month

### Exportable Reports
- All requests (Excel/CSV)
- Department-wise hiring report
- Monthly hiring summary
- Budget utilization report

---

## 🚀 Implementation Roadmap

### Phase 1: Core MVP (Week 1-2)
- [ ] Backend: Model, Routes, Controllers
- [ ] Backend: Authentication & Authorization
- [ ] Frontend: Store, Service, Types
- [ ] Frontend: Basic form component
- [ ] Frontend: Request list page (for both roles)
- [ ] Frontend: Request details page
- [ ] Testing: Unit tests for model and validation

### Phase 2: Enhanced Features (Week 3)
- [ ] Activity timeline component
- [ ] Advanced filtering
- [ ] HR-specific features (assign, update status, close)
- [ ] Form auto-fill from user profile
- [ ] Integration tests

### Phase 3: Notifications & Polish (Week 4)
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Dashboard widgets
- [ ] Statistics page
- [ ] E2E tests
- [ ] Mobile responsiveness
- [ ] UI/UX polish

### Phase 4: Future Enhancements
- [ ] Auto-save drafts
- [ ] Bulk actions (approve multiple)
- [ ] Analytics dashboard
- [ ] Export to Excel
- [ ] Integration with onboarding module
- [ ] Calendar integration for joining dates
- [ ] Document attachments (job description, etc.)

---

## ✅ Acceptance Criteria

### For Hiring Manager:
- ✅ Can create hiring request in < 3 minutes
- ✅ Can save as draft and complete later
- ✅ Can edit/delete drafts only
- ✅ Cannot edit submitted requests
- ✅ Receives notification when status changes
- ✅ Can view request history/timeline

### For HR:
- ✅ Can view all requests across departments
- ✅ Can filter by multiple criteria
- ✅ Can assign recruiter to request
- ✅ Can update status with single click
- ✅ Can add private HR notes
- ✅ Must provide closure reason when closing
- ✅ Can view statistics dashboard

### System:
- ✅ Unique request numbers auto-generated
- ✅ All required fields validated
- ✅ Budget max >= min enforced
- ✅ Replacement details required if hiring type = Replacement
- ✅ Activity log captures all changes
- ✅ Mobile-responsive UI
- ✅ Loading states and error handling

---

## 📝 Form Field Reference

### Required Fields (*)
- Job Title *
- Employment Type *
- Hiring Type *
- Minimum Years Experience *
- Work Location *
- Preferred Joining Date *
- Budget Range (Min & Max) *
- Business Justification *

### Conditional Required
- If Hiring Type = "Replacement":
  - Employee Name *
  - Reason for Replacement *
  - Last Working Day *

### Optional Fields
- Preferred Industry
- Shift/Working Hours

### Auto-Filled (from user profile)
- Hiring Manager Name
- Department
- Designation
- Contact Email
- Contact Phone (can be overridden)

---

## 🔐 Security Considerations

1. **Access Control:**
   - Hiring managers can only view/edit own requests
   - HR can view/edit all requests
   - Role-based route protection

2. **Data Privacy:**
   - HR notes not visible to hiring managers
   - Salary ranges visible only to creator and HR
   - Activity log shows who made changes

3. **Input Validation:**
   - Server-side validation for all inputs
   - Sanitize user inputs to prevent XSS
   - Validate file uploads (future)

4. **Audit Trail:**
   - Activity log for compliance
   - Track who created, modified, submitted, closed
   - Immutable history

---

## 📚 Additional Notes

### Integration Points
1. **User Management:** Fetch user details for auto-filling requester info
2. **Notification System:** Trigger notifications on status changes
3. **Dashboard:** Add hiring widgets to existing dashboards
4. **Onboarding (Future):** Auto-create onboarding task when request closed as "Position Filled"

### Business Rules
1. Only drafts can be edited/deleted by hiring manager
2. Only HR can change status after submission
3. Closure reason mandatory when closing request
4. Request number format: HIR-YYYY-###
5. Budget max must be >= min
6. Replacement details required for replacement hiring type

---

## 🎯 Success Metrics

- **Efficiency:** Reduce hiring request processing time by 60%
- **Visibility:** 100% of hiring requests tracked in system
- **Compliance:** Complete audit trail for all requests
- **User Adoption:** 90% of managers use the system within 1 month
- **Accuracy:** < 5% of requests require rework/correction
- **Speed:** Average time from submission to HR acknowledgment < 2 days

---

**Document Status:** ✅ Ready for Implementation  
**Next Steps:** Begin Phase 1 - Backend Model & Routes

