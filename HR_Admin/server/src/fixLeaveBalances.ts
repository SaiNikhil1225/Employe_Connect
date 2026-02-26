import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const LeaveSchema = new mongoose.Schema({}, { strict: false, collection: 'leaves' });
const LeaveBalanceSchema = new mongoose.Schema({}, { strict: false, collection: 'leavebalances' });

const Employee = mongoose.model('Employee', EmployeeSchema);
const Leave = mongoose.model('Leave', LeaveSchema);
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);

async function fixLeaveBalances() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const employees = await Employee.find({ status: 'active' });
    console.log(`Found ${employees.length} active employees\n`);

    console.log('💰 Fixing leave balances...');
    let updated = 0;
    
    for (const employee of employees) {
      // Get approved leaves for this employee
      const approvedLeaves = await Leave.find({
        employeeId: employee.employeeId,
        status: 'approved'
      });
      
      // Calculate used days per type
      const casualUsed = approvedLeaves
        .filter((l: any) => l.leaveType === 'Casual Leave')
        .reduce((sum: number, l: any) => sum + (l.days || 0), 0);
      
      const sickUsed = approvedLeaves
        .filter((l: any) => l.leaveType === 'Sick Leave')
        .reduce((sum: number, l: any) => sum + (l.days || 0), 0);
      
      const earnedUsed = approvedLeaves
        .filter((l: any) => l.leaveType === 'Earned Leave')
        .reduce((sum: number, l: any) => sum + (l.days || 0), 0);
      
      // Update or create balance using updateOne with upsert
      const leaveTypes = [
        { 
          type: 'Casual Leave', 
          allocated: 12, 
          used: casualUsed, 
          available: Math.max(0, 12 - casualUsed), 
          pending: 0 
        },
        { 
          type: 'Sick Leave', 
          allocated: 12, 
          used: sickUsed, 
          available: Math.max(0, 12 - sickUsed), 
          pending: 0 
        },
        { 
          type: 'Earned Leave', 
          allocated: 15, 
          used: earnedUsed, 
          available: Math.max(0, 15 - earnedUsed), 
          pending: 0 
        }
      ];
      
      await LeaveBalance.updateOne(
        { employeeId: employee.employeeId },
        { $set: { leaveTypes: leaveTypes } },
        { upsert: true }
      );
      
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`  Processed ${updated}/${employees.length} employees...`);
      }
    }
    
    console.log(`✅ Fixed ${updated} leave balance records\n`);
    
    // Verify a sample
    const sample = await LeaveBalance.findOne({ employeeId: employees[0].employeeId });
    console.log('Sample balance for', employees[0].employeeId, ':');
    if (sample && sample.leaveTypes) {
      sample.leaveTypes.forEach((lt: any) => {
        console.log(`  ${lt.type}: Allocated=${lt.allocated}, Used=${lt.used}, Available=${lt.available}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixLeaveBalances();
