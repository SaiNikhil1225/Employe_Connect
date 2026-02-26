import express, { Request, Response } from 'express';
import OnboardingChecklist from '../models/OnboardingChecklist';
import Employee from '../models/Employee';

const router = express.Router();

// Get all onboarding checklists
router.get('/', async (_req: Request, res: Response) => {
  try {
    const checklists = await OnboardingChecklist.find().sort({ createdAt: -1 });
    res.json({ success: true, data: checklists });
  } catch (error) {
    console.error('Failed to fetch onboarding checklists:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch onboarding checklists' });
  }
});

// Get onboarding checklist by employee ID
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const checklist = await OnboardingChecklist.findOne({ 
      employeeId: req.params.employeeId 
    });
    
    if (!checklist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Onboarding checklist not found' 
      });
    }
    
    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to fetch onboarding checklist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch onboarding checklist' });
  }
});

// Create onboarding checklist for new employee
router.post('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, assignedTo, expectedCompletionDate } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if checklist already exists
    const existing = await OnboardingChecklist.findOne({ employeeId });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Onboarding checklist already exists for this employee' 
      });
    }

    const checklist = new OnboardingChecklist({
      employeeId,
      assignedTo,
      expectedCompletionDate,
      status: 'pending'
    });

    await checklist.save();

    // Update employee onboarding status
    await Employee.findOneAndUpdate(
      { employeeId },
      {
        'onboardingStatus.status': 'in-progress',
        'onboardingStatus.startDate': new Date()
      }
    );

    res.status(201).json({ 
      success: true, 
      data: checklist,
      message: 'Onboarding checklist created successfully'
    });
  } catch (error) {
    console.error('Failed to create onboarding checklist:', error);
    res.status(500).json({ success: false, message: 'Failed to create onboarding checklist' });
  }
});

// Update pre-joining task
router.patch('/:employeeId/pre-joining/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, notes, status, documentList, receivedDocuments } = req.body;
    const updatePath = `preJoiningTasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (notes !== undefined) updateData[`${updatePath}.notes`] = notes;
    if (status) updateData[`${updatePath}.status`] = status;
    if (documentList) updateData[`${updatePath}.documentList`] = documentList;
    if (receivedDocuments) updateData[`${updatePath}.receivedDocuments`] = receivedDocuments;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Calculate progress
    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update day 1 task
router.patch('/:employeeId/day1/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, workstationNumber, items, cardNumber, buddyEmployeeId, buddyName, duration } = req.body;
    const updatePath = `day1Tasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (workstationNumber) updateData[`${updatePath}.workstationNumber`] = workstationNumber;
    if (items) updateData[`${updatePath}.items`] = items;
    if (cardNumber) updateData[`${updatePath}.cardNumber`] = cardNumber;
    if (buddyEmployeeId) updateData[`${updatePath}.buddyEmployeeId`] = buddyEmployeeId;
    if (buddyName) updateData[`${updatePath}.buddyName`] = buddyName;
    if (duration) updateData[`${updatePath}.duration`] = duration;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // If buddy assigned, update employee record
    if (buddyEmployeeId && req.params.taskName === 'buddyAssigned') {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        {
          'onboardingStatus.assignedBuddyId': buddyEmployeeId,
          'onboardingStatus.assignedBuddy': { employeeId: buddyEmployeeId, name: buddyName }
        }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update IT task
router.patch('/:employeeId/it/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, emailAddress, systems, assetId, serialNumber, phoneNumber, softwareList } = req.body;
    const updatePath = `itTasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (emailAddress) updateData[`${updatePath}.emailAddress`] = emailAddress;
    if (systems) updateData[`${updatePath}.systems`] = systems;
    if (assetId) updateData[`${updatePath}.assetId`] = assetId;
    if (serialNumber) updateData[`${updatePath}.serialNumber`] = serialNumber;
    if (phoneNumber) updateData[`${updatePath}.phoneNumber`] = phoneNumber;
    if (softwareList) updateData[`${updatePath}.softwareList`] = softwareList;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee record for system access
    if (completed && req.params.taskName === 'systemAccessProvided') {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'onboardingStatus.systemAccessProvided': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update HR task
router.patch('/:employeeId/hr/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, pfNumber, esiNumber, policyNumber, acknowledged, trainingDate } = req.body;
    const updatePath = `hrTasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (pfNumber) updateData[`${updatePath}.pfNumber`] = pfNumber;
    if (esiNumber) updateData[`${updatePath}.esiNumber`] = esiNumber;
    if (policyNumber) updateData[`${updatePath}.policyNumber`] = policyNumber;
    if (acknowledged !== undefined) updateData[`${updatePath}.acknowledged`] = acknowledged;
    if (trainingDate) updateData[`${updatePath}.trainingDate`] = trainingDate;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update training task
router.patch('/:employeeId/training/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, trainingDate, feedback, trainings } = req.body;
    const updatePath = `trainingTasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (trainingDate) updateData[`${updatePath}.trainingDate`] = trainingDate;
    if (feedback) updateData[`${updatePath}.feedback`] = feedback;
    if (trainings) updateData[`${updatePath}.trainings`] = trainings;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee training status
    if (completed && req.params.taskName === 'inductionTrainingCompleted') {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'onboardingStatus.trainingCompleted': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update week 1 task
router.patch('/:employeeId/week1/:taskName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, meetingDate, feedback } = req.body;
    const updatePath = `week1Tasks.${req.params.taskName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (meetingDate) updateData[`${updatePath}.meetingDate`] = meetingDate;
    if (feedback) updateData[`${updatePath}.feedback`] = feedback;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
});

// Update milestone check-in
router.patch('/:employeeId/milestone/:milestoneName', async (req: Request, res: Response) => {
  try {
    const { completed, completedBy, feedback, concerns, performanceRating, probationStatus } = req.body;
    const updatePath = `milestones.${req.params.milestoneName}`;
    
    const updateData: any = {};
    if (completed !== undefined) {
      updateData[`${updatePath}.completed`] = completed;
      updateData[`${updatePath}.completedDate`] = completed ? new Date() : null;
    }
    if (completedBy) updateData[`${updatePath}.completedBy`] = completedBy;
    if (feedback) updateData[`${updatePath}.feedback`] = feedback;
    if (concerns) updateData[`${updatePath}.concerns`] = concerns;
    if (performanceRating) updateData[`${updatePath}.performanceRating`] = performanceRating;
    if (probationStatus) updateData[`${updatePath}.probationStatus`] = probationStatus;

    const checklist = await OnboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // If day 90 review completed, update employee probation status
    if (completed && req.params.milestoneName === 'day90Review' && probationStatus) {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 
          probationStatus,
          'onboardingStatus.status': 'completed',
          'onboardingStatus.completionDate': new Date()
        }
      );
      
      // Mark checklist as completed
      checklist.status = 'completed';
      checklist.actualCompletionDate = new Date();
      await checklist.save();
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update milestone:', error);
    res.status(500).json({ success: false, message: 'Failed to update milestone' });
  }
});

// Get onboarding statistics
router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const total = await OnboardingChecklist.countDocuments();
    const pending = await OnboardingChecklist.countDocuments({ status: 'pending' });
    const inProgress = await OnboardingChecklist.countDocuments({ status: 'in-progress' });
    const completed = await OnboardingChecklist.countDocuments({ status: 'completed' });
    
    // Get delayed onboardings (expected completion date passed but not completed)
    const delayed = await OnboardingChecklist.countDocuments({
      status: { $ne: 'completed' },
      expectedCompletionDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        completed,
        delayed
      }
    });
  } catch (error) {
    console.error('Failed to fetch onboarding stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch onboarding statistics' });
  }
});

// Helper function to calculate progress percentage
async function updateProgress(checklist: any) {
  let totalTasks = 0;
  let completedTasks = 0;

  // Count pre-joining tasks
  Object.values(checklist.preJoiningTasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count day 1 tasks
  Object.values(checklist.day1Tasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count IT tasks
  Object.values(checklist.itTasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count HR tasks
  Object.values(checklist.hrTasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count training tasks
  Object.values(checklist.trainingTasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count week 1 tasks
  Object.values(checklist.week1Tasks || {}).forEach((task: any) => {
    totalTasks++;
    if (task.completed) completedTasks++;
  });

  // Count milestones
  Object.values(checklist.milestones || {}).forEach((milestone: any) => {
    totalTasks++;
    if (milestone.completed) completedTasks++;
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  checklist.progressPercentage = progressPercentage;
  
  // Update status based on progress
  if (progressPercentage === 100) {
    checklist.status = 'completed';
    if (!checklist.actualCompletionDate) {
      checklist.actualCompletionDate = new Date();
    }
  } else if (progressPercentage > 0) {
    checklist.status = 'in-progress';
  }

  await checklist.save();
}

export default router;
