const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function checkDatabaseData() {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Check Employees
    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
    const employeeCount = await Employee.countDocuments({ status: 'active' });
    console.log(`📊 Active Employees: ${employeeCount}`);

    if (employeeCount > 0) {
      const sampleEmployee = await Employee.findOne({ status: 'active' }).lean();
      console.log('Sample Employee:', {
        employeeId: sampleEmployee?.employeeId,
        name: sampleEmployee?.name,
        department: sampleEmployee?.department,
        designation: sampleEmployee?.designation
      });
    }

    console.log('\n');

    // Check Allocations
    const Allocation = mongoose.model('Allocation', new mongoose.Schema({}, { strict: false }));
    const allocationCount = await Allocation.countDocuments({ status: 'active' });
    console.log(`📊 Active Allocations: ${allocationCount}`);

    if (allocationCount > 0) {
      const sampleAllocation = await Allocation.findOne({ status: 'active' }).lean();
      console.log('Sample Allocation:', {
        employeeId: sampleAllocation?.employeeId,
        projectId: sampleAllocation?.projectId,
        allocation: sampleAllocation?.allocation,
        billable: sampleAllocation?.billable
      });
    } else {
      console.log('⚠️  No allocations found in database!');
      console.log('This is why all employees show 0% utilization.');
    }

    console.log('\n');

    // Check Projects
    const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
    const projectCount = await Project.countDocuments({ status: { $in: ['Active', 'Draft'] } });
    console.log(`📊 Active Projects: ${projectCount}`);

    if (projectCount > 0) {
      const sampleProject = await Project.findOne({ status: 'Active' }).lean();
      console.log('Sample Project:', {
        projectId: sampleProject?.projectId,
        projectName: sampleProject?.projectName,
        status: sampleProject?.status
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Summary:');
    console.log(`   Employees: ${employeeCount}`);
    console.log(`   Allocations: ${allocationCount}`);
    console.log(`   Projects: ${projectCount}`);
    
    if (allocationCount === 0) {
      console.log('\n⚠️  ISSUE FOUND:');
      console.log('   No allocations exist in the database.');
      console.log('   This causes the RMG Analytics Dashboard to show:');
      console.log('   - 0% utilization');
      console.log('   - All employees on bench');
      console.log('   - No allocation data');
      console.log('\n💡 SOLUTION:');
      console.log('   You can either:');
      console.log('   1. Create allocations through the UI');
      console.log('   2. Import allocation data');
      console.log('   3. Create sample data for testing');
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabaseData();
