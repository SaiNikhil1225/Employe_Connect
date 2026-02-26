import express, { Request, Response } from 'express';
import { Training } from '../models/Training';
import { TrainingEnrollment } from '../models/TrainingEnrollment';
import { SkillGap } from '../models/SkillGap';
import Employee from '../models/Employee';

const router = express.Router();

// Helper function to get allowed employee IDs based on role
const getAllowedEmployeeIds = async (role: string, userId: string, department?: string) => {
  if (role === 'HR' || role === 'SUPER_ADMIN' || role === 'RMG') {
    // HR/Admin can see all employees
    return null; // null means no restriction
  } else if (role === 'MANAGER' || role === 'L2_APPROVER' || role === 'L3_APPROVER') {
    // Manager can see their team members
    const manager: any = await Employee.findOne({ employeeId: userId });
    if (manager && manager.department) {
      const teamMembers = await Employee.find({ 
        department: manager.department,
        status: 'active'
      }).select('employeeId');
      return teamMembers.map((e: any) => e.employeeId);
    }
    return [userId]; // Fallback to only self
  } else {
    // Regular employee sees only their own data
    return [userId];
  }
};

// Helper function to apply stat card filters
const applyStatCardFilters = (query: Record<string, any>, filters: any) => {
  // Time period filter
  if (filters.timePeriod && filters.timePeriod !== 'all') {
    const days = parseInt(filters.timePeriod);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    if (!query.startDate) query.startDate = {};
    query.startDate.$gte = dateFrom;
  }

  // Training type filter
  if (filters.trainingType && filters.trainingType !== 'all') {
    query.trainingCategory = filters.trainingType;
  }

  // Department filter
  if (filters.department && filters.department !== 'all') {
    query.department = filters.department;
  }

  // Location filter
  if (filters.location && filters.location !== 'all') {
    query.location = filters.location;
  }

  // Cost range filter
  if (filters.costRange && filters.costRange !== 'all') {
    const [min, max] = filters.costRange.split('-');
    if (max === '+') {
      query.costPerEmployee = { $gte: parseInt(min) };
    } else {
      query.costPerEmployee = { 
        $gte: parseInt(min), 
        $lte: parseInt(max) 
      };
    }
  }

  // Certification status filter
  if (filters.certificationStatus && filters.certificationStatus !== 'all') {
    query.certificationStatus = filters.certificationStatus;
  }

  // Training status filter
  if (filters.trainingStatus && filters.trainingStatus !== 'all') {
    query.completionStatus = filters.trainingStatus;
  }

  // Training mode filter
  if (filters.trainingMode && filters.trainingMode !== 'all') {
    query.trainingMode = filters.trainingMode;
  }

  return query;
};

// ==================== TRAINING CRUD OPERATIONS ====================

// Get all trainings with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      category, 
      department, 
      location, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (status) query.status = status;
    if (category) query.trainingCategory = category;
    if (department) query.targetDepartments = { $in: [department] };
    if (location) query.targetLocations = { $in: [location] };
    
    if (startDate || endDate) {
      const dateQuery: { $gte?: Date; $lte?: Date } = {};
      if (startDate) dateQuery.$gte = new Date(startDate as string);
      if (endDate) dateQuery.$lte = new Date(endDate as string);
      query.startDate = dateQuery;
    }
    
    if (search) {
      query.$or = [
        { trainingName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { trainerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const trainings = await Training.find(query).sort({ startDate: -1 });
    res.json({ success: true, data: trainings });
  } catch (error) {
    console.error('Failed to fetch trainings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trainings' });
  }
});

// Get training by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const training = await Training.findOne({ trainingId: req.params.id });
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    res.json({ success: true, data: training });
  } catch (error) {
    console.error('Failed to fetch training:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch training' });
  }
});

// Create new training
router.post('/', async (req: Request, res: Response) => {
  try {
    const trainingData = req.body;
    
    // Generate training ID
    const count = await Training.countDocuments();
    trainingData.trainingId = `TRN${String(count + 1).padStart(5, '0')}`;
    
    // Calculate total budget
    trainingData.totalBudget = trainingData.costPerEmployee * trainingData.maxParticipants;
    
    const training = new Training(trainingData);
    await training.save();
    
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    console.error('Failed to create training:', error);
    res.status(500).json({ success: false, message: 'Failed to create training' });
  }
});

// Update training
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // Recalculate total budget if cost or participants changed
    if (updates.costPerEmployee || updates.maxParticipants) {
      const training = await Training.findOne({ trainingId: req.params.id });
      if (training) {
        updates.totalBudget = 
          (updates.costPerEmployee || training.costPerEmployee) * 
          (updates.maxParticipants || training.maxParticipants);
      }
    }
    
    const training = await Training.findOneAndUpdate(
      { trainingId: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    
    res.json({ success: true, data: training });
  } catch (error) {
    console.error('Failed to update training:', error);
    res.status(500).json({ success: false, message: 'Failed to update training' });
  }
});

// Delete training
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Check if there are enrollments
    const enrollmentCount = await TrainingEnrollment.countDocuments({ 
      trainingId: req.params.id 
    });
    
    if (enrollmentCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete training with existing enrollments' 
      });
    }
    
    const training = await Training.findOneAndDelete({ trainingId: req.params.id });
    
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    
    res.json({ success: true, message: 'Training deleted successfully' });
  } catch (error) {
    console.error('Failed to delete training:', error);
    res.status(500).json({ success: false, message: 'Failed to delete training' });
  }
});

// ==================== ENROLLMENT OPERATIONS ====================

// Get all enrollments with filters
router.get('/enrollments/all', async (req: Request, res: Response) => {
  try {
    const { 
      trainingId, 
      employeeId, 
      department, 
      location, 
      completionStatus,
      certificationStatus,
      grade,
      employmentType,
      dateFrom,
      dateTo,
      role,
      userId
    } = req.query;
    
    const query: Record<string, unknown> = {};
    
    // Apply role-based filtering
    if (role && userId) {
      const allowedIds = await getAllowedEmployeeIds(role as string, userId as string);
      if (allowedIds !== null) {
        query.employeeId = { $in: allowedIds };
      }
    }
    
    if (trainingId) query.trainingId = trainingId;
    if (employeeId && !role) query.employeeId = employeeId; // Only apply if not using role-based filtering
    if (department) query.department = department;
    if (location) query.location = location;
    if (completionStatus) query.completionStatus = completionStatus;
    if (certificationStatus) query.certificationStatus = certificationStatus;
    if (grade) query.grade = grade;
    if (employmentType) query.employmentType = employmentType;
    
    // Add date range filtering based on training start date
    if (dateFrom || dateTo) {
      const dateQuery: { $gte?: Date; $lte?: Date } = {};
      if (dateFrom) dateQuery.$gte = new Date(dateFrom as string);
      if (dateTo) dateQuery.$lte = new Date(dateTo as string);
      query.startDate = dateQuery;
    }
    
    const enrollments = await TrainingEnrollment.find(query).sort({ enrollmentDate: -1 });
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
  }
});

// Get enrollments for a specific training
router.get('/:trainingId/enrollments', async (req: Request, res: Response) => {
  try {
    const enrollments = await TrainingEnrollment.find({ 
      trainingId: req.params.trainingId 
    }).sort({ enrollmentDate: -1 });
    
    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Failed to fetch training enrollments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch training enrollments' });
  }
});

// Bulk enroll employees in training
router.post('/enroll', async (req: Request, res: Response) => {
  try {
    const { trainingId, employeeIds, startDate, endDate, durationHours } = req.body;
    
    if (!trainingId || !employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Training ID and employee IDs are required' 
      });
    }
    
    // Get training details
    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    
    // Check capacity
    const availableSlots = training.maxParticipants - training.currentEnrollments;
    if (employeeIds.length > availableSlots) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${availableSlots} slots available. Cannot assign ${employeeIds.length} employees.` 
      });
    }
    
    const enrollments = [];
    const errors = [];
    let enrollmentCount = await TrainingEnrollment.countDocuments();
    
    for (const empId of employeeIds) {
      try {
        // Check if already enrolled
        const existingEnrollment = await TrainingEnrollment.findOne({ 
          trainingId: training._id.toString(), 
          employeeId: empId 
        });
        
        if (existingEnrollment) {
          errors.push(`Employee ${empId} is already enrolled`);
          continue;
        }
        
        // Get employee details
        const employee: any = await Employee.findById(empId);
        if (!employee) {
          errors.push(`Employee ${empId} not found`);
          continue;
        }
        
        // Generate enrollment ID
        enrollmentCount += 1;
        const enrollmentId = `ENR${String(enrollmentCount).padStart(6, '0')}`;
        
        // Create enrollment
        const enrollment = new TrainingEnrollment({
          enrollmentId,
          trainingId: training._id.toString(),
          trainingName: training.trainingName,
          employeeId: employee.employeeId,
          employeeName: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          location: employee.location,
          grade: employee.grade,
          employmentType: employee.employmentType,
          trainingCategory: training.trainingCategory,
          trainingMode: training.trainingMode,
          startDate: startDate || training.startDate,
          endDate: endDate || training.endDate,
          durationHours: durationHours || training.durationHours,
          costPerEmployee: training.costPerEmployee,
          completionStatus: 'Not Started',
          hoursCompleted: 0,
          certificationStatus: training.certificationAvailable ? 'Not Started' : 'Not Applicable'
        });
        
        await enrollment.save();
        enrollments.push(enrollment);
      } catch (error: any) {
        errors.push(`Error enrolling employee ${empId}: ${error.message}`);
      }
    }
    
    // Update training enrollment count
    if (enrollments.length > 0) {
      training.currentEnrollments += enrollments.length;
      await training.save();
    }
    
    res.status(201).json({ 
      success: true, 
      data: enrollments,
      message: `Successfully enrolled ${enrollments.length} employee(s)`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Failed to create enrollments:', error);
    res.status(500).json({ success: false, message: 'Failed to create enrollments' });
  }
});

// Enroll employee in training
router.post('/:trainingId/enroll', async (req: Request, res: Response) => {
  try {
    const { trainingId } = req.params;
    const { employeeId, nominatedBy, approvedBy } = req.body;
    
    // Get training details
    const training = await Training.findOne({ trainingId });
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await TrainingEnrollment.findOne({ 
      trainingId, 
      employeeId 
    });
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee already enrolled in this training' 
      });
    }
    
    // Check capacity
    if (training.currentEnrollments >= training.maxParticipants) {
      return res.status(400).json({ 
        success: false, 
        message: 'Training has reached maximum capacity' 
      });
    }
    
    // Get employee details
    const employee: any = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    // Generate enrollment ID
    const count = await TrainingEnrollment.countDocuments();
    const enrollmentId = `ENR${String(count + 1).padStart(6, '0')}`;
    
    // Create enrollment
    const enrollment = new TrainingEnrollment({
      enrollmentId,
      trainingId,
      trainingName: training.trainingName,
      employeeId,
      employeeName: employee.name,
      email: employee.email,
      department: employee.department,
      designation: employee.designation,
      location: employee.location,
      grade: employee.grade,
      employmentType: employee.employmentType,
      trainingCategory: training.trainingCategory,
      trainingMode: training.trainingMode,
      startDate: training.startDate,
      endDate: training.endDate,
      durationHours: training.durationHours,
      costPerEmployee: training.costPerEmployee,
      certificationStatus: training.certificationAvailable ? 'Pending' : 'Not Applicable',
      nominatedBy,
      approvedBy,
      approvalDate: approvedBy ? new Date() : undefined
    });
    
    await enrollment.save();
    
    // Update training enrollment count
    training.currentEnrollments += 1;
    await training.save();
    
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    res.status(500).json({ success: false, message: 'Failed to create enrollment' });
  }
});

// Update enrollment
router.put('/enrollments/:enrollmentId', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    
    // If marking as completed and certification is available, update certification status
    if (updates.completionStatus === 'Completed' && updates.certificationStatus === 'Pending') {
      updates.certificationDate = new Date();
      updates.certificationStatus = 'Certified';
      
      // Calculate expiry if applicable
      const enrollment = await TrainingEnrollment.findOne({ 
        enrollmentId: req.params.enrollmentId 
      });
      if (enrollment) {
        const training = await Training.findOne({ trainingId: enrollment.trainingId });
        if (training?.certificationValidityMonths) {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + training.certificationValidityMonths);
          updates.certificationExpiryDate = expiryDate;
        }
      }
    }
    
    const enrollment = await TrainingEnrollment.findOneAndUpdate(
      { enrollmentId: req.params.enrollmentId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    // Update training feedback if provided
    if (updates.feedback?.rating) {
      const training = await Training.findOne({ trainingId: enrollment.trainingId });
      if (training) {
        training.feedback.push({
          employeeId: enrollment.employeeId,
          rating: updates.feedback.rating,
          comments: updates.feedback.comments,
          submittedAt: new Date()
        });
        
        // Calculate average rating
        const totalRating = training.feedback.reduce((sum, f) => sum + (f.rating || 0), 0);
        training.averageRating = totalRating / training.feedback.length;
        await training.save();
      }
    }
    
    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Failed to update enrollment:', error);
    res.status(500).json({ success: false, message: 'Failed to update enrollment' });
  }
});

// Cancel enrollment
router.delete('/enrollments/:enrollmentId', async (req: Request, res: Response) => {
  try {
    const enrollment = await TrainingEnrollment.findOne({ 
      enrollmentId: req.params.enrollmentId 
    });
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }
    
    // Update enrollment status
    enrollment.enrollmentStatus = 'Cancelled';
    enrollment.completionStatus = 'Cancelled';
    await enrollment.save();
    
    // Decrease training enrollment count
    await Training.findOneAndUpdate(
      { trainingId: enrollment.trainingId },
      { $inc: { currentEnrollments: -1 } }
    );
    
    res.json({ success: true, message: 'Enrollment cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel enrollment:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel enrollment' });
  }
});

// ==================== ANALYTICS & METRICS ====================

// Get training metrics
router.get('/analytics/metrics', async (req: Request, res: Response) => {
  try {
    const { 
      department, 
      location, 
      grade, 
      employmentType, 
      dateFrom, 
      dateTo,
      role,
      userId,
      cardFilters
    } = req.query;
    
    const enrollmentQuery: Record<string, unknown> = {};
    
    // Apply role-based filtering
    if (role && userId) {
      const allowedIds = await getAllowedEmployeeIds(role as string, userId as string);
      if (allowedIds !== null) {
        enrollmentQuery.employeeId = { $in: allowedIds };
      }
    }
    
    // Apply stat card filters if provided
    if (cardFilters) {
      try {
        const filters = JSON.parse(cardFilters as string);
        applyStatCardFilters(enrollmentQuery, filters);
      } catch (e) {
        console.error('Error parsing card filters:', e);
      }
    }
    
    if (department) enrollmentQuery.department = department;
    if (location) enrollmentQuery.location = location;
    if (grade) enrollmentQuery.grade = grade;
    if (employmentType) enrollmentQuery.employmentType = employmentType;
    
    if (dateFrom || dateTo) {
      const dateQuery: { $gte?: Date; $lte?: Date } = {};
      if (dateFrom) dateQuery.$gte = new Date(dateFrom as string);
      if (dateTo) dateQuery.$lte = new Date(dateTo as string);
      enrollmentQuery.startDate = dateQuery;
    }
    
    const enrollments = await TrainingEnrollment.find(enrollmentQuery);
    
    // Calculate metrics
    const totalEmployees = [...new Set(enrollments.map(e => e.employeeId))].length;
    
    // Training hours per employee
    const employeeHours: Record<string, number> = {};
    enrollments.forEach(e => {
      if (e.completionStatus === 'Completed') {
        employeeHours[e.employeeId] = (employeeHours[e.employeeId] || 0) + (e.hoursCompleted || e.durationHours || 0);
      }
    });
    
    const avgHoursPerEmployee = totalEmployees > 0 
      ? Object.values(employeeHours).reduce((a, b) => a + b, 0) / totalEmployees 
      : 0;
    
    // Training cost per employee
    const employeeCosts: Record<string, number> = {};
    enrollments.forEach(e => {
      employeeCosts[e.employeeId] = (employeeCosts[e.employeeId] || 0) + (e.costPerEmployee || 0);
    });
    
    const avgCostPerEmployee = totalEmployees > 0
      ? Object.values(employeeCosts).reduce((a, b) => a + b, 0) / totalEmployees
      : 0;
    
    // Certification completion percentage
    const certificationEligible = enrollments.filter(
      e => e.certificationStatus !== 'Not Applicable'
    ).length;
    const certificationCompleted = enrollments.filter(
      e => e.certificationStatus === 'Certified'
    ).length;
    const certificationCompletionRate = certificationEligible > 0
      ? (certificationCompleted / certificationEligible) * 100
      : 0;
    
    // Training completion rate
    const completedTrainings = enrollments.filter(
      e => e.completionStatus === 'Completed'
    ).length;
    const completionRate = enrollments.length > 0
      ? (completedTrainings / enrollments.length) * 100
      : 0;
    
    // Total investment
    const totalInvestment = enrollments.reduce((sum, e) => sum + (e.costPerEmployee || 0), 0);
    
    res.json({ 
      success: true, 
      data: {
        totalEmployees,
        totalEnrollments: enrollments.length,
        avgHoursPerEmployee: parseFloat(avgHoursPerEmployee.toFixed(2)),
        avgCostPerEmployee: parseFloat(avgCostPerEmployee.toFixed(2)),
        certificationCompletionRate: parseFloat(certificationCompletionRate.toFixed(2)),
        completionRate: parseFloat(completionRate.toFixed(2)),
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        employeeHoursData: employeeHours,
        employeeCostsData: employeeCosts
      }
    });
  } catch (error) {
    console.error('Failed to fetch training metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch training metrics' });
  }
});

// Get training hours by employee
router.get('/analytics/hours-by-employee', async (req: Request, res: Response) => {
  try {
    const { department, location, grade, employmentType } = req.query;
    
    const query: Record<string, unknown> = {
      completionStatus: 'Completed'
    };
    
    if (department) query.department = department;
    if (location) query.location = location;
    if (grade) query.grade = grade;
    if (employmentType) query.employmentType = employmentType;
    
    const enrollments = await TrainingEnrollment.find(query);
    
    // Group by employee
    const employeeData: Record<string, any> = {};
    
    enrollments.forEach(e => {
      if (!employeeData[e.employeeId]) {
        employeeData[e.employeeId] = {
          employeeId: e.employeeId,
          employeeName: e.employeeName,
          department: e.department,
          location: e.location,
          grade: e.grade,
          employmentType: e.employmentType,
          totalHours: 0,
          trainingCount: 0,
          certifications: 0
        };
      }
      
      employeeData[e.employeeId].totalHours += e.hoursCompleted || e.durationHours || 0;
      employeeData[e.employeeId].trainingCount += 1;
      if (e.certificationStatus === 'Certified') {
        employeeData[e.employeeId].certifications += 1;
      }
    });
    
    res.json({ success: true, data: Object.values(employeeData) });
  } catch (error) {
    console.error('Failed to fetch hours by employee:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hours by employee' });
  }
});

// ==================== SKILL GAP ANALYSIS ====================

// Get all skill gaps
router.get('/skill-gaps/all', async (req: Request, res: Response) => {
  try {
    const { department, location, grade, employmentType, priority } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (department) query.department = department;
    if (location) query.location = location;
    if (grade) query.grade = grade;
    if (employmentType) query.employmentType = employmentType;
    if (priority) query['skillGaps.priority'] = priority;
    
    const skillGaps = await SkillGap.find(query).sort({ overallGapScore: -1 });
    res.json({ success: true, data: skillGaps });
  } catch (error) {
    console.error('Failed to fetch skill gaps:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch skill gaps' });
  }
});

// Get skill gap for employee
router.get('/skill-gaps/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const skillGap = await SkillGap.findOne({ employeeId: req.params.employeeId });
    
    if (!skillGap) {
      return res.status(404).json({ success: false, message: 'Skill gap analysis not found' });
    }
    
    res.json({ success: true, data: skillGap });
  } catch (error) {
    console.error('Failed to fetch employee skill gap:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee skill gap' });
  }
});

// Create or update skill gap analysis
router.post('/skill-gaps', async (req: Request, res: Response) => {
  try {
    const skillGapData = req.body;
    const { employeeId } = skillGapData;
    
    // Calculate gaps
    const gaps = [];
    let totalGapScore = 0;
    let criticalCount = 0;
    
    const currentSkillsMap = new Map<string, any>(
      skillGapData.currentSkills?.map((s: any) => [s.skillName, s]) || []
    );
    
    for (const requiredSkill of skillGapData.requiredSkills || []) {
      const currentSkill = currentSkillsMap.get(requiredSkill.skillName) || {};
      
      const currentScore = (currentSkill as any).proficiencyScore || 0;
      const requiredScore = requiredSkill.requiredProficiencyScore || 100;
      const gapScore = Math.max(0, requiredScore - currentScore);
      
      if (gapScore > 0) {
        gaps.push({
          skillName: requiredSkill.skillName,
          currentLevel: (currentSkill as any).proficiencyLevel || 'None',
          requiredLevel: requiredSkill.requiredProficiencyLevel,
          gapScore,
          priority: requiredSkill.priority,
          category: requiredSkill.category,
          identifiedDate: new Date()
        });
        
        totalGapScore += gapScore;
        if (requiredSkill.priority === 'Critical') criticalCount++;
      }
    }
    
    skillGapData.skillGaps = gaps;
    skillGapData.totalGapsIdentified = gaps.length;
    skillGapData.criticalGapsCount = criticalCount;
    skillGapData.overallGapScore = gaps.length > 0 ? totalGapScore / gaps.length : 0;
    skillGapData.lastAssessmentDate = new Date();
    
    // Update or create skill gap record
    const skillGap = await SkillGap.findOneAndUpdate(
      { employeeId },
      skillGapData,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: skillGap });
  } catch (error) {
    console.error('Failed to save skill gap analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to save skill gap analysis' });
  }
});

// Get skill gap summary analytics
router.get('/skill-gaps/analytics/summary', async (req: Request, res: Response) => {
  try {
    const { department, location, grade, employmentType } = req.query;
    
    const query: Record<string, unknown> = {};
    
    if (department) query.department = department;
    if (location) query.location = location;
    if (grade) query.grade = grade;
    if (employmentType) query.employmentType = employmentType;
    
    const skillGaps = await SkillGap.find(query);
    
    // Aggregate gaps by skill
    const skillGapMap: Record<string, any> = {};
    
    skillGaps.forEach(sg => {
      sg.skillGaps.forEach(gap => {
        if (!skillGapMap[gap.skillName]) {
          skillGapMap[gap.skillName] = {
            skillName: gap.skillName,
            employeesWithGap: 0,
            avgGapScore: 0,
            criticalCount: 0,
            highCount: 0,
            mediumCount: 0,
            lowCount: 0,
            category: gap.category
          };
        }
        
        skillGapMap[gap.skillName].employeesWithGap += 1;
        skillGapMap[gap.skillName].avgGapScore += gap.gapScore;
        
        if (gap.priority === 'Critical') skillGapMap[gap.skillName].criticalCount += 1;
        else if (gap.priority === 'High') skillGapMap[gap.skillName].highCount += 1;
        else if (gap.priority === 'Medium') skillGapMap[gap.skillName].mediumCount += 1;
        else if (gap.priority === 'Low') skillGapMap[gap.skillName].lowCount += 1;
      });
    });
    
    // Calculate averages
    Object.values(skillGapMap).forEach((skill: any) => {
      skill.avgGapScore = skill.avgGapScore / skill.employeesWithGap;
    });
    
    // Sort by employees with gap (most common gaps)
    const sortedSkillGaps = Object.values(skillGapMap).sort(
      (a: any, b: any) => b.employeesWithGap - a.employeesWithGap
    );
    
    res.json({ 
      success: true, 
      data: {
        totalEmployeesAnalyzed: skillGaps.length,
        totalUniqueGaps: sortedSkillGaps.length,
        skillGaps: sortedSkillGaps
      }
    });
  } catch (error) {
    console.error('Failed to fetch skill gap summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch skill gap summary' });
  }
});

export default router;
