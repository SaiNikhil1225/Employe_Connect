import mongoose from 'mongoose';
import { Training } from '../models/Training';
import { TrainingEnrollment } from '../models/TrainingEnrollment';
import { SkillGap } from '../models/SkillGap';
import Employee from '../models/Employee';

/**
 * Seed Training Data
 * This script creates sample training programs and enrollments based on actual employee data
 */

export async function seedTrainingData() {
  try {
    console.log('Starting Training Data Seeding...');
    
    // Fetch actual employees from database
    const employees = await Employee.find({ isActive: true }).limit(100);
    
    if (employees.length === 0) {
      console.log('No employees found. Please add employees first.');
      return;
    }
    
    console.log(`Found ${employees.length} active employees`);
    
    // Get unique departments and locations from actual employees
    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const locations = [...new Set(employees.map(e => e.location).filter(Boolean))];
    
    console.log('Departments:', departments);
    console.log('Locations:', locations);
    
    // Clear existing training data (optional - comment out if you want to keep existing data)
    // await Training.deleteMany({});
    // await TrainingEnrollment.deleteMany({});
    // await SkillGap.deleteMany({});
    
    // Sample training programs based on actual company data
    const trainingPrograms = [
      {
        trainingName: 'React Advanced Development',
        trainingCategory: 'Technical',
        description: 'Advanced React concepts including hooks, context, performance optimization, and testing',
        trainerName: 'John Smith',
        trainerOrganization: 'Tech Training Solutions',
        trainingMode: 'Online',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-20'),
        durationHours: 40,
        maxParticipants: 30,
        costPerEmployee: 500,
        certificationAvailable: true,
        certificationName: 'React Advanced Developer',
        certificationValidityMonths: 24,
        location: 'Online Platform',
        status: 'Scheduled',
        skillsToBeAcquired: ['React Hooks', 'Context API', 'Performance Optimization', 'Testing'],
        targetDepartments: departments.filter(d => d?.includes('Engineering') || d?.includes('IT') || d?.includes('Technology')),
        targetLocations: locations.slice(0, 3),
        targetGrades: ['Mid Level', 'Senior', 'Lead'],
        targetEmploymentTypes: ['Permanent', 'Contract']
      },
      {
        trainingName: 'Leadership Excellence Program',
        trainingCategory: 'Leadership',
        description: 'Comprehensive leadership training covering team management, strategic thinking, and decision making',
        trainerName: 'Sarah Johnson',
        trainerOrganization: 'Leadership Academy',
        trainingMode: 'Hybrid',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        durationHours: 80,
        maxParticipants: 25,
        costPerEmployee: 1200,
        certificationAvailable: true,
        certificationName: 'Certified Leadership Professional',
        certificationValidityMonths: 36,
        location: locations[0] || 'Corporate Office',
        status: 'Scheduled',
        skillsToBeAcquired: ['Team Management', 'Strategic Planning', 'Decision Making', 'Conflict Resolution'],
        targetDepartments: departments,
        targetLocations: locations,
        targetGrades: ['Manager', 'Senior Manager', 'Director'],
        targetEmploymentTypes: ['Permanent']
      },
      {
        trainingName: 'Data Analytics with Python',
        trainingCategory: 'Technical',
        description: 'Learn data analysis using Python, Pandas, NumPy, and data visualization techniques',
        trainerName: 'Michael Chen',
        trainerOrganization: 'Data Science Institute',
        trainingMode: 'Online',
        startDate: new Date('2026-02-25'),
        endDate: new Date('2026-03-05'),
        durationHours: 60,
        maxParticipants: 40,
        costPerEmployee: 600,
        certificationAvailable: true,
        certificationName: 'Python Data Analyst',
        certificationValidityMonths: 24,
        location: 'Online Platform',
        status: 'Ongoing',
        skillsToBeAcquired: ['Python', 'Pandas', 'Data Visualization', 'Statistical Analysis'],
        targetDepartments: departments,
        targetLocations: locations,
        targetGrades: ['Entry Level', 'Junior', 'Mid Level'],
        targetEmploymentTypes: ['Permanent', 'Contract', 'Intern']
      },
      {
        trainingName: 'Effective Communication Skills',
        trainingCategory: 'Soft Skills',
        description: 'Enhance professional communication, presentation skills, and interpersonal effectiveness',
        trainerName: 'Emma Williams',
        trainerOrganization: 'Professional Skills Training',
        trainingMode: 'Offline',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-17'),
        durationHours: 24,
        maxParticipants: 50,
        costPerEmployee: 300,
        certificationAvailable: false,
        location: locations[0] || 'Training Center',
        status: 'Completed',
        skillsToBeAcquired: ['Presentation Skills', 'Active Listening', 'Professional Writing', 'Conflict Management'],
        targetDepartments: departments,
        targetLocations: locations,
        targetGrades: ['Entry Level', 'Junior', 'Mid Level', 'Senior'],
        targetEmploymentTypes: ['Permanent', 'Contract']
      },
      {
        trainingName: 'Cybersecurity Awareness',
        trainingCategory: 'Compliance',
        description: 'Essential cybersecurity practices, threat awareness, and data protection protocols',
        trainerName: 'Robert Davis',
        trainerOrganization: 'CyberSec Training',
        trainingMode: 'Online',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-02'),
        durationHours: 16,
        maxParticipants: 100,
        costPerEmployee: 150,
        certificationAvailable: true,
        certificationName: 'Security Awareness Certified',
        certificationValidityMonths: 12,
        location: 'Online Platform',
        status: 'Scheduled',
        skillsToBeAcquired: ['Security Best Practices', 'Threat Detection', 'Data Protection', 'Incident Response'],
        targetDepartments: departments,
        targetLocations: locations,
        targetGrades: ['Entry Level', 'Junior', 'Mid Level', 'Senior'],
        targetEmploymentTypes: ['Permanent', 'Contract']
      }
    ];
    
    // Create training programs
    const createdTrainings = [];
    for (let i = 0; i < trainingPrograms.length; i++) {
      const training = trainingPrograms[i];
      const trainingId = `TRN${String(i + 1).padStart(5, '0')}`;
      
      const newTraining = new Training({
        ...training,
        trainingId,
        totalBudget: training.costPerEmployee * training.maxParticipants,
        currentEnrollments: 0,
        createdBy: 'System',
        averageRating: 0,
        feedback: []
      });
      
      await newTraining.save();
      createdTrainings.push(newTraining);
      console.log(`Created training: ${training.trainingName}`);
    }
    
    // Enroll some employees in trainings
    let enrollmentCount = 0;
    for (const training of createdTrainings) {
      // Select random employees that match the training criteria
      const eligibleEmployees = employees.filter(emp => {
        const deptMatch = training.targetDepartments.length === 0 || 
                         training.targetDepartments.includes(emp.department);
        const locMatch = training.targetLocations.length === 0 || 
                        training.targetLocations.includes(emp.location);
        const empTypeMatch = training.targetEmploymentTypes.length === 0 || 
                            training.targetEmploymentTypes.includes(emp.employmentType);
        
        return deptMatch && locMatch && empTypeMatch;
      });
      
      // Enroll 20-40% of eligible employees
      const enrollmentRate = 0.2 + Math.random() * 0.2;
      const numToEnroll = Math.min(
        Math.floor(eligibleEmployees.length * enrollmentRate),
        training.maxParticipants
      );
      
      const shuffled = eligibleEmployees.sort(() => 0.5 - Math.random());
      const selectedEmployees = shuffled.slice(0, numToEnroll);
      
      for (const emp of selectedEmployees) {
        enrollmentCount++;
        const enrollmentId = `ENR${String(enrollmentCount).padStart(6, '0')}`;
        
        // Determine completion status based on training status
        let completionStatus = 'Not Started';
        let hoursCompleted = 0;
        let certificationStatus = training.certificationAvailable ? 'Pending' : 'Not Applicable';
        
        if (training.status === 'Completed') {
          completionStatus = Math.random() > 0.1 ? 'Completed' : 'In Progress';
          if (completionStatus === 'Completed') {
            hoursCompleted = training.durationHours;
            certificationStatus = training.certificationAvailable ? 
              (Math.random() > 0.2 ? 'Certified' : 'Pending') : 'Not Applicable';
          } else {
            hoursCompleted = Math.floor(training.durationHours * (0.5 + Math.random() * 0.4));
          }
        } else if (training.status === 'Ongoing') {
          completionStatus = 'In Progress';
          hoursCompleted = Math.floor(training.durationHours * (0.3 + Math.random() * 0.5));
        }
        
        const enrollment = new TrainingEnrollment({
          enrollmentId,
          trainingId: training.trainingId,
          trainingName: training.trainingName,
          employeeId: emp.employeeId,
          employeeName: emp.name,
          email: emp.email,
          department: emp.department,
          designation: emp.designation,
          location: emp.location,
          grade: emp.grade,
          employmentType: emp.employmentType,
          enrollmentStatus: 'Confirmed',
          trainingCategory: training.trainingCategory,
          trainingMode: training.trainingMode,
          startDate: training.startDate,
          endDate: training.endDate,
          durationHours: training.durationHours,
          costPerEmployee: training.costPerEmployee,
          completionStatus,
          hoursCompleted,
          attendancePercentage: completionStatus === 'Completed' ? 90 + Math.random() * 10 : 
                               completionStatus === 'In Progress' ? 60 + Math.random() * 30 : 0,
          certificationStatus,
          nominatedBy: 'Manager',
          approvedBy: 'HR'
        });
        
        await enrollment.save();
        
        // Update training enrollment count
        training.currentEnrollments += 1;
        await training.save();
      }
      
      console.log(`Enrolled ${selectedEmployees.length} employees in ${training.trainingName}`);
    }
    
    // Create skill gap analysis for some employees
    const skillCategories = ['Technical', 'Soft Skills', 'Leadership', 'Domain Knowledge'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    
    const employeesForSkillGap = employees.slice(0, Math.min(30, employees.length));
    
    for (const emp of employeesForSkillGap) {
      const numGaps = 2 + Math.floor(Math.random() * 4);
      const skillGaps = [];
      
      for (let i = 0; i < numGaps; i++) {
        const category = skillCategories[Math.floor(Math.random() * skillCategories.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        const gapScore = 20 + Math.floor(Math.random() * 80);
        
        skillGaps.push({
          skillName: `${category} Skill ${i + 1}`,
          currentLevel: 'Beginner',
          requiredLevel: 'Advanced',
          gapScore,
          priority,
          category,
          identifiedDate: new Date()
        });
      }
      
      const overallGapScore = skillGaps.reduce((sum, gap) => sum + gap.gapScore, 0) / skillGaps.length;
      const criticalGapsCount = skillGaps.filter(g => g.priority === 'Critical').length;
      
      const skillGapRecord = new SkillGap({
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        location: emp.location,
        grade: emp.grade,
        employmentType: emp.employmentType,
        skillGaps,
        overallGapScore,
        totalGapsIdentified: skillGaps.length,
        criticalGapsCount,
        assessedBy: 'Manager',
        lastAssessmentDate: new Date()
      });
      
      await skillGapRecord.save();
    }
    
    console.log(`Created skill gap analysis for ${employeesForSkillGap.length} employees`);
    
    console.log('\n✅ Training Data Seeding Completed Successfully!');
    console.log(`- Created ${createdTrainings.length} training programs`);
    console.log(`- Enrolled ${enrollmentCount} employees`);
    console.log(`- Created ${employeesForSkillGap.length} skill gap analyses`);
    
  } catch (error) {
    console.error('Error seeding training data:', error);
    throw error;
  }
}

// Run seeder if called directly
if (require.main === module) {
  const connectDB = require('../config/database').default;
  
  connectDB().then(async () => {
    await seedTrainingData();
    process.exit(0);
  }).catch((error: Error) => {
    console.error('Failed to seed training data:', error);
    process.exit(1);
  });
}
