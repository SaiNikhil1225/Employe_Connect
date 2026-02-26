import express, { Request, Response } from 'express';
import OffboardingChecklist from '../models/OffboardingChecklist';
import Employee from '../models/Employee';

const router = express.Router();

// Get all offboarding checklists
router.get('/', async (_req: Request, res: Response) => {
  try {
    const checklists = await OffboardingChecklist.find().sort({ initiatedDate: -1 });
    res.json({ success: true, data: checklists });
  } catch (error) {
    console.error('Failed to fetch offboarding checklists:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offboarding checklists' });
  }
});

// Get offboarding checklist by employee ID
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const checklist = await OffboardingChecklist.findOne({ 
      employeeId: req.params.employeeId 
    });
    
    if (!checklist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Offboarding checklist not found' 
      });
    }
    
    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to fetch offboarding checklist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offboarding checklist' });
  }
});

// Initiate offboarding process
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { 
      employeeId, 
      assignedTo, 
      resignationDate, 
      lastWorkingDay,
      reasonForLeaving,
      detailedReason 
    } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if checklist already exists
    const existing = await OffboardingChecklist.findOne({ employeeId });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offboarding checklist already exists for this employee' 
      });
    }

    const checklist = new OffboardingChecklist({
      employeeId,
      assignedTo,
      resignationDate,
      lastWorkingDay,
      reasonForLeaving,
      detailedReason,
      status: 'in-progress',
      initiatedDate: new Date()
    });

    await checklist.save();

    // Update employee offboarding status
    await Employee.findOneAndUpdate(
      { employeeId },
      {
        'offboardingStatus.status': 'in-progress',
        'offboardingStatus.initiatedDate': new Date(),
        'offboardingStatus.lastWorkingDay': lastWorkingDay,
        status: 'inactive'
      }
    );

    res.status(201).json({ 
      success: true, 
      data: checklist,
      message: 'Offboarding process initiated successfully'
    });
  } catch (error) {
    console.error('Failed to initiate offboarding:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate offboarding process' });
  }
});

// Schedule exit interview
router.patch('/:employeeId/exit-interview/schedule', async (req: Request, res: Response) => {
  try {
    const { scheduledDate, conductedBy } = req.body;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        'exitInterview.scheduled': true,
        'exitInterview.scheduledDate': scheduledDate,
        'exitInterview.conductedBy': conductedBy
      },
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to schedule exit interview:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule exit interview' });
  }
});

// Complete exit interview
router.patch('/:employeeId/exit-interview/complete', async (req: Request, res: Response) => {
  try {
    const { feedback, notes } = req.body;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        'exitInterview.completed': true,
        'exitInterview.completedDate': new Date(),
        'exitInterview.feedback': feedback,
        'exitInterview.notes': notes
      },
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee record
    await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        'offboardingStatus.exitInterviewDate': new Date(),
        'offboardingStatus.exitInterviewCompleted': true
      }
    );

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to complete exit interview:', error);
    res.status(500).json({ success: false, message: 'Failed to complete exit interview' });
  }
});

// Record asset return
router.patch('/:employeeId/assets/return/:assetType', async (req: Request, res: Response) => {
  try {
    const { assetId, condition, receivedBy } = req.body;
    const assetType = req.params.assetType;

    const updateData: any = {};
    updateData[`itAssetReturn.${assetType}.returned`] = true;
    updateData[`itAssetReturn.${assetType}.returnedDate`] = new Date();
    if (assetId) updateData[`itAssetReturn.${assetType}.assetId`] = assetId;
    if (condition) updateData[`itAssetReturn.${assetType}.condition`] = condition;
    if (receivedBy) updateData[`itAssetReturn.${assetType}.receivedBy`] = receivedBy;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Check if all assets are returned
    const allReturned = checkAllAssetsReturned(checklist.itAssetReturn);
    if (allReturned && checklist.itAssetReturn) {
      checklist.itAssetReturn.allAssetsReturned = true;
      await checklist.save();

      // Update employee record
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'offboardingStatus.assetsReturned': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to record asset return:', error);
    res.status(500).json({ success: false, message: 'Failed to record asset return' });
  }
});

// Revoke access
router.patch('/:employeeId/access/revoke/:accessType', async (req: Request, res: Response) => {
  try {
    const { completedBy, systems } = req.body;
    const accessType = req.params.accessType;

    const updateData: any = {};
    updateData[`accessRevocation.${accessType}.completed`] = true;
    updateData[`accessRevocation.${accessType}.completedDate`] = new Date();
    if (completedBy) updateData[`accessRevocation.${accessType}.completedBy`] = completedBy;
    if (systems) updateData[`accessRevocation.${accessType}.systems`] = systems;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Check if all access revoked
    const allRevoked = checkAllAccessRevoked(checklist.accessRevocation);
    if (allRevoked && checklist.accessRevocation) {
      checklist.accessRevocation.allAccessRevoked = true;
      await checklist.save();

      // Update employee record
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'offboardingStatus.accessRevoked': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to revoke access:', error);
    res.status(500).json({ success: false, message: 'Failed to revoke access' });
  }
});

// Update knowledge transfer
router.patch('/:employeeId/knowledge-transfer', async (req: Request, res: Response) => {
  try {
    const { 
      ktsessionScheduled, 
      ktsessionCompleted, 
      transferredTo, 
      transferredToName,
      documentationProvided,
      projectHandoverCompleted,
      notes 
    } = req.body;

    const updateData: any = {};
    if (ktsessionScheduled !== undefined) updateData['knowledgeTransfer.ktsessionScheduled'] = ktsessionScheduled;
    if (ktsessionCompleted !== undefined) {
      updateData['knowledgeTransfer.ktsessionCompleted'] = ktsessionCompleted;
      if (ktsessionCompleted) {
        updateData['knowledgeTransfer.completedDate'] = new Date();
      }
    }
    if (transferredTo) updateData['knowledgeTransfer.transferredTo'] = transferredTo;
    if (transferredToName) updateData['knowledgeTransfer.transferredToName'] = transferredToName;
    if (documentationProvided !== undefined) updateData['knowledgeTransfer.documentationProvided'] = documentationProvided;
    if (projectHandoverCompleted !== undefined) updateData['knowledgeTransfer.projectHandoverCompleted'] = projectHandoverCompleted;
    if (notes) updateData['knowledgeTransfer.notes'] = notes;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
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
    console.error('Failed to update knowledge transfer:', error);
    res.status(500).json({ success: false, message: 'Failed to update knowledge transfer' });
  }
});

// Update HR clearance
router.patch('/:employeeId/hr-clearance', async (req: Request, res: Response) => {
  try {
    const updateData: any = {};
    
    Object.keys(req.body).forEach(key => {
      updateData[`hrClearance.${key}`] = req.body[key];
    });

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee final settlement status
    if (req.body['finalSettlement.processed']) {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        {
          'offboardingStatus.finalSettlementStatus': 'completed',
          'offboardingStatus.finalSettlementAmount': req.body['finalSettlement.totalAmount']
        }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update HR clearance:', error);
    res.status(500).json({ success: false, message: 'Failed to update HR clearance' });
  }
});

// Issue document
router.patch('/:employeeId/documents/issue/:documentType', async (req: Request, res: Response) => {
  try {
    const { issuedBy } = req.body;
    const documentType = req.params.documentType;

    const updateData: any = {};
    updateData[`documents.${documentType}.issued`] = true;
    updateData[`documents.${documentType}.issuedDate`] = new Date();
    if (issuedBy) updateData[`documents.${documentType}.issuedBy`] = issuedBy;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee if experience letter issued
    if (documentType === 'experienceLetter') {
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'offboardingStatus.experienceLetterIssued': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to issue document:', error);
    res.status(500).json({ success: false, message: 'Failed to issue document' });
  }
});

// Update department clearance
router.patch('/:employeeId/department-clearance/:department', async (req: Request, res: Response) => {
  try {
    const { cleared, notes } = req.body;
    const department = req.params.department;

    const updateData: any = {};
    updateData[`departmentClearances.${department}Cleared`] = cleared;
    if (notes) updateData[`departmentClearances.${department}Notes`] = notes;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      updateData,
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Check if all clearances obtained
    const allCleared = checkAllClearancesObtained(checklist.departmentClearances);
    if (allCleared) {
      checklist.clearanceFormCompleted = true;
      await checklist.save();

      // Update employee
      await Employee.findOneAndUpdate(
        { employeeId: req.params.employeeId },
        { 'offboardingStatus.clearanceFormCompleted': true }
      );
    }

    await updateProgress(checklist);

    res.json({ success: true, data: checklist });
  } catch (error) {
    console.error('Failed to update department clearance:', error);
    res.status(500).json({ success: false, message: 'Failed to update department clearance' });
  }
});

// Complete offboarding
router.patch('/:employeeId/complete', async (req: Request, res: Response) => {
  try {
    const { eligibleForRehire, remarks } = req.body;

    const checklist = await OffboardingChecklist.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        status: 'completed',
        actualClearanceDate: new Date(),
        eligibleForRehire,
        remarks,
        progressPercentage: 100
      },
      { new: true }
    );

    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    // Update employee status
    await Employee.findOneAndUpdate(
      { employeeId: req.params.employeeId },
      {
        'offboardingStatus.status': 'completed',
        status: 'inactive',
        isActive: false
      }
    );

    res.json({ 
      success: true, 
      data: checklist,
      message: 'Offboarding process completed successfully'
    });
  } catch (error) {
    console.error('Failed to complete offboarding:', error);
    res.status(500).json({ success: false, message: 'Failed to complete offboarding' });
  }
});

// Get offboarding statistics
router.get('/stats/overview', async (_req: Request, res: Response) => {
  try {
    const total = await OffboardingChecklist.countDocuments();
    const inProgress = await OffboardingChecklist.countDocuments({ status: 'in-progress' });
    const completed = await OffboardingChecklist.countDocuments({ status: 'completed' });
    
    // Get pending clearances
    const pendingClearance = await OffboardingChecklist.countDocuments({
      status: 'in-progress',
      clearanceFormCompleted: false
    });

    res.json({
      success: true,
      data: {
        total,
        inProgress,
        completed,
        pendingClearance
      }
    });
  } catch (error) {
    console.error('Failed to fetch offboarding stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offboarding statistics' });
  }
});

// Helper functions
function checkAllAssetsReturned(itAssetReturn: any): boolean {
  const assets = ['laptop', 'phone', 'accessCard'];
  return assets.every(asset => {
    const assetData = itAssetReturn[asset];
    return !assetData.required || assetData.returned;
  });
}

function checkAllAccessRevoked(accessRevocation: any): boolean {
  return (
    accessRevocation.emailDisabled?.completed &&
    accessRevocation.systemAccessRevoked?.completed &&
    accessRevocation.vpnAccessRevoked?.completed &&
    accessRevocation.buildingAccessRevoked?.completed
  );
}

function checkAllClearancesObtained(departmentClearances: any): boolean {
  return (
    departmentClearances.financeCleared &&
    departmentClearances.itCleared &&
    departmentClearances.adminCleared &&
    departmentClearances.reportingManagerCleared &&
    departmentClearances.hrCleared
  );
}

async function updateProgress(checklist: any) {
  let totalItems = 0;
  let completedItems = 0;

  // Exit interview
  totalItems += 1;
  if (checklist.exitInterview?.completed) completedItems += 1;

  // IT assets
  const requiredAssets = ['laptop', 'phone', 'accessCard'].filter(
    asset => checklist.itAssetReturn?.[asset]?.required
  );
  totalItems += requiredAssets.length;
  completedItems += requiredAssets.filter(
    asset => checklist.itAssetReturn?.[asset]?.returned
  ).length;

  // Access revocations (4 items)
  totalItems += 4;
  if (checklist.accessRevocation?.emailDisabled?.completed) completedItems += 1;
  if (checklist.accessRevocation?.systemAccessRevoked?.completed) completedItems += 1;
  if (checklist.accessRevocation?.vpnAccessRevoked?.completed) completedItems += 1;
  if (checklist.accessRevocation?.buildingAccessRevoked?.completed) completedItems += 1;

  // Knowledge transfer
  totalItems += 1;
  if (checklist.knowledgeTransfer?.ktsessionCompleted) completedItems += 1;

  // HR clearance items
  totalItems += 2; // PF and final settlement
  if (checklist.hrClearance?.pfSettlement?.completed) completedItems += 1;
  if (checklist.hrClearance?.finalSettlement?.processed) completedItems += 1;

  // Documents (5 items)
  totalItems += 5;
  if (checklist.documents?.relievingLetter?.issued) completedItems += 1;
  if (checklist.documents?.experienceLetter?.issued) completedItems += 1;
  if (checklist.documents?.serviceCertificate?.issued) completedItems += 1;
  if (checklist.documents?.form16?.issued) completedItems += 1;
  if (checklist.documents?.noDueCertificate?.issued) completedItems += 1;

  // Department clearances (5 items)
  totalItems += 5;
  if (checklist.departmentClearances?.financeCleared) completedItems += 1;
  if (checklist.departmentClearances?.itCleared) completedItems += 1;
  if (checklist.departmentClearances?.adminCleared) completedItems += 1;
  if (checklist.departmentClearances?.reportingManagerCleared) completedItems += 1;
  if (checklist.departmentClearances?.hrCleared) completedItems += 1;

  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  checklist.progressPercentage = progressPercentage;
  await checklist.save();
}

export default router;
