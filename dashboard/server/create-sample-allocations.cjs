const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function createSampleAllocations() {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Get employees
    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
    const employees = await Employee.find({ status: 'active' }).limit(20).lean();
    
    if (employees.length === 0) {
      console.log('❌ No active employees found!');
      return;
    }

    console.log(`📊 Found ${employees.length} employees\n`);

    // Get or create projects
    const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
    let projects = await Project.find({ status: { $in: ['Active', 'Draft'] } }).lean();
    
    if (projects.length === 0) {
      console.log('⚠️  No projects found. Creating sample projects...\n');
      
      const sampleProjects = [
        {
          projectId: 'PROJ001',
          projectName: 'E-Commerce Platform Modernization',
          customerId: 'CUST001',
          customerName: 'Tech Corp',
          billingType: 'T&M',
          projectManager: 'John Smith',
          deliveryManager: 'Jane Doe',
          projectStartDate: new Date('2024-01-01'),
          projectEndDate: new Date('2024-12-31'),
          status: 'Active',
          estimatedValue: 500000,
          actualValue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          projectId: 'PROJ002',
          projectName: 'Mobile App Development',
          customerId: 'CUST002',
          customerName: 'Retail Inc',
          billingType: 'Fixed',
          projectManager: 'Alice Johnson',
          deliveryManager: 'Bob Wilson',
          projectStartDate: new Date('2024-02-01'),
          projectEndDate: new Date('2024-11-30'),
          status: 'Active',
          estimatedValue: 300000,
          actualValue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          projectId: 'PROJ003',
          projectName: 'Data Analytics Dashboard',
          customerId: 'CUST003',
          customerName: 'Finance Solutions',
          billingType: 'T&M',
          projectManager: 'Carol Davis',
          deliveryManager: 'David Brown',
          projectStartDate: new Date('2024-03-01'),
          projectEndDate: new Date('2024-09-30'),
          status: 'Active',
          estimatedValue: 250000,
          actualValue: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await Project.insertMany(sampleProjects);
      projects = sampleProjects;
      console.log(`✅ Created ${projects.length} sample projects\n`);
    } else {
      console.log(`📊 Found ${projects.length} existing projects\n`);
    }

    // Create allocations
    const Allocation = mongoose.model('Allocation', new mongoose.Schema({}, { strict: false }));
    
    // Define allocation templates with varying percentages and billability
    const allocationTemplates = [
      { allocation: 100, billable: true, role: 'Full Stack Developer' },
      { allocation: 80, billable: true, role: 'Senior Developer' },
      { allocation: 60, billable: true, role: 'UI/UX Developer' },
      { allocation: 50, billable: true, role: 'Backend Developer' },
      { allocation: 40, billable: false, role: 'Trainee' },
      { allocation: 30, billable: true, role: 'QA Engineer' },
      { allocation: 20, billable: false, role: 'Support' }
    ];

    const allocations = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    // Allocate employees to projects (leave some on bench)
    const employeesToAllocate = employees.slice(0, 15); // Allocate only 15 out of 20
    
    employeesToAllocate.forEach((emp, index) => {
      const project = projects[index % projects.length];
      const template = allocationTemplates[index % allocationTemplates.length];
      
      // Some employees get multiple allocations
      if (index % 3 === 0 && index < 12) {
        // Primary allocation
        allocations.push({
          employeeId: emp.employeeId,
          projectId: project.projectId,
          allocation: template.allocation,
          startDate: startDate,
          endDate: endDate,
          role: template.role,
          billable: template.billable,
          status: 'active',
          createdAt: today,
          updatedAt: today
        });
        
        // Secondary allocation (causes some over-allocation)
        const secondProject = projects[(index + 1) % projects.length];
        allocations.push({
          employeeId: emp.employeeId,
          projectId: secondProject.projectId,
          allocation: 40,
          startDate: startDate,
          endDate: endDate,
          role: 'Support Role',
          billable: false,
          status: 'active',
          createdAt: today,
          updatedAt: today
        });
      } else {
        // Single allocation
        allocations.push({
          employeeId: emp.employeeId,
          projectId: project.projectId,
          allocation: template.allocation,
          startDate: startDate,
          endDate: endDate,
          role: template.role,
          billable: template.billable,
          status: 'active',
          createdAt: today,
          updatedAt: today
        });
      }
    });

    console.log(`📝 Creating ${allocations.length} sample allocations...\n`);
    await Allocation.insertMany(allocations);
    
    console.log('✅ Sample allocations created successfully!\n');
    console.log('=' . repeat(60));
    console.log('\n📊 Allocation Summary:');
    console.log(`   Total Employees: ${employees.length}`);
    console.log(`   Allocated Employees: ${employeesToAllocate.length}`);
    console.log(`   Bench Employees: ${employees.length - employeesToAllocate.length}`);
    console.log(`   Total Allocations: ${allocations.length}`);
    console.log(`   Active Projects: ${projects.length}`);
    
    // Calculate utilization stats
const util = {};
    allocations.forEach(a => {
      if (!util[a.employeeId]) util[a.employeeId] = 0;
      util[a.employeeId] += a.allocation;
    });
    
    const overAllocated = Object.values(util).filter(u => u > 100).length;
    const optimal = Object.values(util).filter(u => u >= 70 && u <= 100).length;
    const underAllocated = Object.values(util).filter(u => u > 0 && u < 70).length;
    
    console.log('\n📈 Expected Dashboard Metrics:');
    console.log(`   Over-allocated: ${overAllocated} employees (>100%)`);
    console.log(`   Optimal: ${optimal} employees (70-100%)`);
    console.log(`   Under-allocated: ${underAllocated} employees (<70%)`);
    console.log(`   Bench: ${employees.length - employeesToAllocate.length} employees (0%)`);
    
    console.log('\n✅ Sample data creation complete!');
    console.log('🔄 Refresh your RMG Analytics Dashboard to see the data.\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSampleAllocations();
