import express, { Request, Response } from 'express';
import {
  OnboardingStatus,
  OnboardingChecklistItem,
  OnboardingDocument,
  WelcomeKitItem,
  TrainingSchedule
} from '../models/OnboardingNew';
import { Employee } from '../models/Employee';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Helper function to initialize onboarding for an employee
const initializeOnboardingForEmployee = async (employeeId: string, employee: any) => {
  try {
    // Check if onboarding already exists
    const existingOnboarding = await OnboardingStatus.findOne({ employeeId });
    if (existingOnboarding) {
      return { success: true, message: 'Onboarding already initialized' };
    }

    // Create onboarding status
    const onboardingStatus = new OnboardingStatus({
      employeeId,
      employeeName: employee.displayName || employee.firstName + ' ' + employee.lastName,
      designation: employee.designation || 'Not Set',
      department: employee.department || 'Not Set',
      joiningDate: employee.joiningDate || new Date(),
      status: 'not-started',
      progressPercentage: 0,
      currentPhase: 'pre-joining'
    });

    await onboardingStatus.save();

    // Initialize default checklist items
    const defaultChecklist = [
      // Pre-joining
      { category: 'pre-joining', task: 'Offer Letter Sent', description: 'Send offer letter to candidate', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Offer Letter Accepted', description: 'Candidate accepts offer letter', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Background Verification', description: 'Complete background verification', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Documents Requested', description: 'Request required documents from employee', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'IT Setup Request', description: 'Request IT equipment and access', assignedTo: 'it', mandatory: true },
      
      // Day 1
      { category: 'day-1', task: 'Workstation Setup', description: 'Prepare employee workstation', assignedTo: 'it', mandatory: true },
      { category: 'day-1', task: 'Welcome Kit Preparation', description: 'Prepare welcome kit items', assignedTo: 'admin', mandatory: true },
      { category: 'day-1', task: 'Access Card Issued', description: 'Issue office access card', assignedTo: 'admin', mandatory: true },
      { category: 'day-1', task: 'Welcome Email', description: 'Send welcome email to team', assignedTo: 'hr', mandatory: true },
      { category: 'day-1', task: 'Buddy Assignment', description: 'Assign buddy for initial guidance', assignedTo: 'hr', mandatory: true },
      { category: 'day-1', task: 'Orientation Session', description: 'Complete company orientation', assignedTo: 'hr', mandatory: true },
      
      // Week 1
      { category: 'week-1', task: 'Team Introduction', description: 'Introduce to team members', assignedTo: 'manager', mandatory: true },
      { category: 'week-1', task: 'System Access', description: 'Provide all necessary system access', assignedTo: 'it', mandatory: true },
      { category: 'week-1', task: 'Role Training', description: 'Begin role-specific training', assignedTo: 'manager', mandatory: true },
      { category: 'week-1', task: 'Policy Review', description: 'Review company policies and procedures', assignedTo: 'hr', mandatory: true },
      
      // Month 1
      { category: 'month-1', task: 'Performance Goals', description: 'Set initial performance goals', assignedTo: 'manager', mandatory: true },
      { category: 'month-1', task: 'First Project Assignment', description: 'Assign first project/task', assignedTo: 'manager', mandatory: true },
      { category: 'month-1', task: '30-Day Feedback', description: 'Conduct 30-day feedback session', assignedTo: 'manager', mandatory: true },
      
      // Probation
      { category: 'probation', task: 'Mid-Probation Review', description: 'Mid-probation performance review', assignedTo: 'manager', mandatory: true },
      { category: 'probation', task: 'Final Probation Review', description: 'Final probation assessment', assignedTo: 'manager', mandatory: true }
    ];

    const checklistItems = defaultChecklist.map(item => ({
      employeeId,
      ...item
    }));

    await OnboardingChecklistItem.insertMany(checklistItems);

    // Initialize default documents
    const defaultDocuments = [
      { documentType: 'PAN Card', documentName: 'PAN Card Copy', required: true },
      { documentType: 'Aadhaar Card', documentName: 'Aadhaar Card Copy', required: true },
      { documentType: 'Educational Certificates', documentName: 'Degree/Diploma Certificates', required: true },
      { documentType: 'Previous Employment', documentName: 'Experience/Relieving Letters', required: false },
      { documentType: 'Bank Details', documentName: 'Cancelled Cheque/Bank Statement', required: true },
      { documentType: 'Address Proof', documentName: 'Address Proof Document', required: true },
      { documentType: 'Passport Photo', documentName: 'Recent Passport Size Photos', required: true }
    ];

    const documents = defaultDocuments.map(doc => ({
      employeeId,
      ...doc,
      status: 'pending'
    }));

    await OnboardingDocument.insertMany(documents);

    // Initialize default welcome kit items
    const defaultWelcomeKit = [
      { itemName: 'Laptop', itemType: 'laptop' },
      { itemName: 'Mouse', itemType: 'mouse' },
      { itemName: 'Keyboard', itemType: 'keyboard' },
      { itemName: 'Headset', itemType: 'headset' },
      { itemName: 'Employee ID Card', itemType: 'accessories' },
      { itemName: 'Company Handbook', itemType: 'stationery' }
    ];

    const welcomeKitItems = defaultWelcomeKit.map(item => ({
      employeeId,
      ...item,
      status: 'pending'
    }));

    await WelcomeKitItem.insertMany(welcomeKitItems);

    // Initialize default training schedule
    const defaultTrainings = [
      { trainingName: 'Company Orientation', trainingType: 'orientation', duration: '4 hours', mandatory: true },
      { trainingName: 'IT Security & Compliance', trainingType: 'compliance', duration: '2 hours', mandatory: true },
      { trainingName: 'HR Policies', trainingType: 'compliance', duration: '1 hour', mandatory: true },
      { trainingName: 'Department Overview', trainingType: 'department-specific', duration: '3 hours', mandatory: true }
    ];

    const trainings = defaultTrainings.map(training => ({
      employeeId,
      ...training,
      status: 'scheduled'
    }));

    await TrainingSchedule.insertMany(trainings);

    return { success: true, message: 'Onboarding initialized successfully' };
  } catch (error: any) {
    console.error('Error initializing onboarding:', error);
    return { success: false, message: error.message };
  }
};

// Helper function to calculate progress
const calculateProgress = async (employeeId: string): Promise<number> => {
  const [checklist, documents, welcomeKit, trainings] = await Promise.all([
    OnboardingChecklistItem.find({ employeeId }),
    OnboardingDocument.find({ employeeId }),
    WelcomeKitItem.find({ employeeId }),
    TrainingSchedule.find({ employeeId })
  ]);

  let totalProgress = 0;
  let sections = 0;

  // Checklist progress (25%)
  if (checklist.length > 0) {
    const completedTasks = checklist.filter(item => item.status === 'completed').length;
    totalProgress += (completedTasks / checklist.length) * 25;
    sections++;
  }

  // Documents progress (25%)
  if (documents.length > 0) {
    const verifiedDocs = documents.filter(doc => doc.status === 'verified').length;
    totalProgress += (verifiedDocs / documents.length) * 25;
    sections++;
  }

  // Welcome Kit progress (25%)
  if (welcomeKit.length > 0) {
    const deliveredItems = welcomeKit.filter(item => item.status === 'delivered').length;
    totalProgress += (deliveredItems / welcomeKit.length) * 25;
    sections++;
  }

  // Trainings progress (25%)
  if (trainings.length > 0) {
    const completedTrainings = trainings.filter(training => training.status === 'completed').length;
    totalProgress += (completedTrainings / trainings.length) * 25;
    sections++;
  }

  return sections > 0 ? Math.round(totalProgress) : 0;
};

// ==================== ONBOARDING STATUS ROUTES ====================

// GET all onboarding statuses
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const statuses = await OnboardingStatus.find().sort({ createdAt: -1 });
    res.json({ success: true, data: statuses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET onboarding status by employee ID
router.get('/status/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    let status = await OnboardingStatus.findOne({ employeeId });
    
    // If onboarding doesn't exist, auto-initialize it for existing employees
    if (!status) {
      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }

      // Auto-initialize onboarding
      const initResult = await initializeOnboardingForEmployee(employeeId, employee);
      if (!initResult.success) {
        return res.status(500).json({ success: false, message: initResult.message });
      }
      
      status = await OnboardingStatus.findOne({ employeeId });
      if (!status) {
        return res.status(500).json({ success: false, message: 'Failed to initialize onboarding' });
      }
    }

    // Get all related data
    const [checklist, documents, welcomeKit, trainings] = await Promise.all([
      OnboardingChecklistItem.find({ employeeId }).sort({ category: 1 }),
      OnboardingDocument.find({ employeeId }),
      WelcomeKitItem.find({ employeeId }),
      TrainingSchedule.find({ employeeId }).sort({ scheduledDate: 1 })
    ]);

    // Calculate current progress
    const progressPercentage = await calculateProgress(employeeId);

    const response = {
      ...status.toObject(),
      progressPercentage,
      checklist,
      documents,
      welcomeKit,
      trainings
    };

    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Initialize onboarding for a new employee
router.post('/initialize', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId, employeeName, designation, department, joiningDate, hrContact, managerContact } = req.body;

    // Check if employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if onboarding already exists
    const existingOnboarding = await OnboardingStatus.findOne({ employeeId });
    if (existingOnboarding) {
      return res.status(400).json({ success: false, message: 'Onboarding already initialized for this employee' });
    }

    // Create onboarding status
    const onboardingStatus = new OnboardingStatus({
      employeeId,
      employeeName,
      designation,
      department,
      joiningDate,
      status: 'not-started',
      progressPercentage: 0,
      currentPhase: 'pre-joining',
      hrContact,
      managerContact
    });

    await onboardingStatus.save();

    // Initialize default checklist items
    const defaultChecklist = [
      // Pre-joining
      { category: 'pre-joining', task: 'Offer Letter Sent', description: 'Send offer letter to candidate', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Offer Letter Accepted', description: 'Candidate accepts offer letter', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Background Verification', description: 'Complete background verification', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'Documents Requested', description: 'Request required documents from employee', assignedTo: 'hr', mandatory: true },
      { category: 'pre-joining', task: 'IT Setup Request', description: 'Request IT equipment and access', assignedTo: 'it', mandatory: true },
      
      // Day 1
      { category: 'day-1', task: 'Workstation Setup', description: 'Prepare employee workstation', assignedTo: 'it', mandatory: true },
      { category: 'day-1', task: 'Welcome Kit Preparation', description: 'Prepare welcome kit items', assignedTo: 'admin', mandatory: true },
      { category: 'day-1', task: 'Access Card Issued', description: 'Issue office access card', assignedTo: 'admin', mandatory: true },
      { category: 'day-1', task: 'Welcome Email', description: 'Send welcome email to team', assignedTo: 'hr', mandatory: true },
      { category: 'day-1', task: 'Buddy Assignment', description: 'Assign buddy for initial guidance', assignedTo: 'hr', mandatory: true },
      { category: 'day-1', task: 'Orientation Session', description: 'Complete company orientation', assignedTo: 'hr', mandatory: true },
      
      // Week 1
      { category: 'week-1', task: 'Team Introduction', description: 'Introduce to team members', assignedTo: 'manager', mandatory: true },
      { category: 'week-1', task: 'System Access', description: 'Provide all necessary system access', assignedTo: 'it', mandatory: true },
      { category: 'week-1', task: 'Role Training', description: 'Begin role-specific training', assignedTo: 'manager', mandatory: true },
      { category: 'week-1', task: 'Policy Review', description: 'Review company policies and procedures', assignedTo: 'hr', mandatory: true },
      
      // Month 1
      { category: 'month-1', task: 'Performance Goals', description: 'Set initial performance goals', assignedTo: 'manager', mandatory: true },
      { category: 'month-1', task: 'First Project Assignment', description: 'Assign first project/task', assignedTo: 'manager', mandatory: true },
      { category: 'month-1', task: '30-Day Feedback', description: 'Conduct 30-day feedback session', assignedTo: 'manager', mandatory: true },
      
      // Probation
      { category: 'probation', task: 'Mid-Probation Review', description: 'Mid-probation performance review', assignedTo: 'manager', mandatory: true },
      { category: 'probation', task: 'Final Probation Review', description: 'Final probation assessment', assignedTo: 'manager', mandatory: true }
    ];

    const checklistItems = defaultChecklist.map(item => ({
      employeeId,
      ...item
    }));

    await OnboardingChecklistItem.insertMany(checklistItems);

    // Initialize default documents
    const defaultDocuments = [
      { documentType: 'PAN Card', documentName: 'PAN Card Copy', required: true },
      { documentType: 'Aadhaar Card', documentName: 'Aadhaar Card Copy', required: true },
      { documentType: 'Educational Certificates', documentName: 'Degree/Diploma Certificates', required: true },
      { documentType: 'Previous Employment', documentName: 'Experience/Relieving Letters', required: false },
      { documentType: 'Bank Details', documentName: 'Cancelled Cheque/Bank Statement', required: true },
      { documentType: 'Address Proof', documentName: 'Address Proof Document', required: true },
      { documentType: 'Passport Photo', documentName: 'Recent Passport Size Photos', required: true }
    ];

    const documents = defaultDocuments.map(doc => ({
      employeeId,
      ...doc,
      status: 'pending'
    }));

    await OnboardingDocument.insertMany(documents);

    // Initialize default welcome kit items
    const defaultWelcomeKit = [
      { itemName: 'Laptop', itemType: 'laptop' },
      { itemName: 'Mouse', itemType: 'mouse' },
      { itemName: 'Keyboard', itemType: 'keyboard' },
      { itemName: 'Headset', itemType: 'headset' },
      { itemName: 'Employee ID Card', itemType: 'accessories' },
      { itemName: 'Company Handbook', itemType: 'stationery' }
    ];

    const welcomeKitItems = defaultWelcomeKit.map(item => ({
      employeeId,
      ...item,
      status: 'pending'
    }));

    await WelcomeKitItem.insertMany(welcomeKitItems);

    // Initialize default training schedule
    const defaultTrainings = [
      { trainingName: 'Company Orientation', trainingType: 'orientation', duration: '4 hours', mandatory: true },
      { trainingName: 'IT Security & Compliance', trainingType: 'compliance', duration: '2 hours', mandatory: true },
      { trainingName: 'HR Policies', trainingType: 'compliance', duration: '1 hour', mandatory: true },
      { trainingName: 'Department Overview', trainingType: 'department-specific', duration: '3 hours', mandatory: true }
    ];

    const trainings = defaultTrainings.map(training => ({
      employeeId,
      ...training,
      status: 'scheduled'
    }));

    await TrainingSchedule.insertMany(trainings);

    res.status(201).json({
      success: true,
      message: 'Onboarding initialized successfully',
      data: onboardingStatus
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH - Update onboarding status
router.patch('/status/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { status, currentPhase, buddy, mentor, hrContact, managerContact } = req.body;

    const onboarding = await OnboardingStatus.findOne({ employeeId });
    if (!onboarding) {
      return res.status(404).json({ success: false, message: 'Onboarding status not found' });
    }

    // Update fields
    if (status) onboarding.status = status;
    if (currentPhase) onboarding.currentPhase = currentPhase;
    if (buddy) onboarding.buddy = buddy;
    if (mentor) onboarding.mentor = mentor;
    if (hrContact) onboarding.hrContact = hrContact;
    if (managerContact) onboarding.managerContact = managerContact;

    // Calculate and update progress
    onboarding.progressPercentage = await calculateProgress(employeeId);
    onboarding.lastUpdated = new Date();

    await onboarding.save();

    res.json({ success: true, data: onboarding, message: 'Onboarding status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CHECKLIST ROUTES ====================

// GET checklist items for an employee
router.get('/checklist/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const items = await OnboardingChecklistItem.find({ employeeId }).sort({ category: 1 });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Add checklist item
router.post('/checklist', authenticateToken, async (req: Request, res: Response) => {
  try {
    const item = new OnboardingChecklistItem(req.body);
    await item.save();

    // Update progress
    const progress = await calculateProgress(req.body.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: req.body.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.status(201).json({ success: true, data: item, message: 'Checklist item added' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH - Update checklist item
router.patch('/checklist/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await OnboardingChecklistItem.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    // Update progress
    const progress = await calculateProgress(item.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: item.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.json({ success: true, data: item, message: 'Checklist item updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE checklist item
router.delete('/checklist/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await OnboardingChecklistItem.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found' });
    }

    // Update progress
    const progress = await calculateProgress(item.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: item.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.json({ success: true, message: 'Checklist item deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== DOCUMENTS ROUTES ====================

// GET documents for an employee
router.get('/documents/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const documents = await OnboardingDocument.find({ employeeId });
    res.json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Add document
router.post('/documents', authenticateToken, async (req: Request, res: Response) => {
  try {
    const document = new OnboardingDocument(req.body);
    await document.save();

    // Update progress
    const progress = await calculateProgress(req.body.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: req.body.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.status(201).json({ success: true, data: document, message: 'Document added' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH - Update document
router.patch('/documents/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await OnboardingDocument.findByIdAndUpdate(id, updates, { new: true });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Update progress
    const progress = await calculateProgress(document.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: document.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.json({ success: true, data: document, message: 'Document updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== WELCOME KIT ROUTES ====================

// GET welcome kit items for an employee
router.get('/welcome-kit/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const items = await WelcomeKitItem.find({ employeeId });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Add welcome kit item
router.post('/welcome-kit', authenticateToken, async (req: Request, res: Response) => {
  try {
    const item = new WelcomeKitItem(req.body);
    await item.save();

    // Update progress
    const progress = await calculateProgress(req.body.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: req.body.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.status(201).json({ success: true, data: item, message: 'Welcome kit item added' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH - Update welcome kit item
router.patch('/welcome-kit/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await WelcomeKitItem.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Welcome kit item not found' });
    }

    // Update progress
    const progress = await calculateProgress(item.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: item.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.json({ success: true, data: item, message: 'Welcome kit item updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== TRAINING ROUTES ====================

// GET training schedule for an employee
router.get('/trainings/:employeeId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const trainings = await TrainingSchedule.find({ employeeId }).sort({ scheduledDate: 1 });
    res.json({ success: true, data: trainings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST - Add training
router.post('/trainings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const training = new TrainingSchedule(req.body);
    await training.save();

    // Update progress
    const progress = await calculateProgress(req.body.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: req.body.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.status(201).json({ success: true, data: training, message: 'Training scheduled' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH - Update training
router.patch('/trainings/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const training = await TrainingSchedule.findByIdAndUpdate(id, updates, { new: true });
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    // Update progress
    const progress = await calculateProgress(training.employeeId);
    await OnboardingStatus.findOneAndUpdate(
      { employeeId: training.employeeId },
      { progressPercentage: progress, lastUpdated: new Date() }
    );

    res.json({ success: true, data: training, message: 'Training updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
