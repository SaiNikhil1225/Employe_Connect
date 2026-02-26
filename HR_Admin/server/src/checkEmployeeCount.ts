import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== CHECKING EMPLOYEE DATA FOR LEAVE & ATTENDANCE ===\n');
    
    // Check total active employees
    const activeCount = await Employee.countDocuments({ status: 'active' });
    console.log(`✅ Total Active Employees: ${activeCount}`);
    
    // Check if there are any employees without status field
    const noStatusCount = await Employee.countDocuments({ status: { $exists: false } });
    console.log(`   Employees without status field: ${noStatusCount}`);
    
    // Check employee status breakdown
    const statusBreakdown = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n📊 Employee Status Breakdown:');
    statusBreakdown.forEach(s => {
      console.log(`   ${s._id || 'undefined'}: ${s.count}`);
    });
    
    // Show sample active employees
    const sampleEmployees = await Employee.find({ status: 'active' }).limit(5);
    console.log('\n👥 Sample Active Employees:');
    sampleEmployees.forEach(emp => {
      console.log(`   - ${emp.employeeId}: ${emp.name} (${emp.department || 'No Dept'})`);
    });
    
    console.log('\n✅ Database check complete!');
    console.log(`\n💡 The KPIs API should return totalEmployees: ${activeCount}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();
