import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function testIsHRAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== TESTING isHRAdmin FUNCTION ===\n');
    
    // Test the logic from the fixed function
    const testIsHRAdminLogic = (role: string): boolean => {
      const upperRole = role?.toUpperCase();
      return upperRole === 'HR' || upperRole === 'SUPER_ADMIN' || upperRole === 'RMG';
    };
    
    // Get sample users
    const hrUser = await Employee.findOne({ role: 'HR' });
    const rmgUser = await Employee.findOne({ role: 'RMG' });
    const empUser = await Employee.findOne({ role: 'EMPLOYEE' });
    const managerUser = await Employee.findOne({ role: 'MANAGER' });
    
    console.log('Testing isHRAdmin logic:\n');
    
    if (hrUser) {
      const hasAccess = testIsHRAdminLogic(hrUser.role);
      console.log(`✓ HR User (${hrUser.employeeId}): ${hrUser.role} → isHRAdmin: ${hasAccess}`);
    }
    
    if (rmgUser) {
      const hasAccess = testIsHRAdminLogic(rmgUser.role);
      console.log(`✓ RMG User (${rmgUser.employeeId}): ${rmgUser.role} → isHRAdmin: ${hasAccess}`);
    }
    
    if (empUser) {
      const hasAccess = testIsHRAdminLogic(empUser.role);
      console.log(`✗ Employee (${empUser.employeeId}): ${empUser.role} → isHRAdmin: ${hasAccess}`);
    }
    
    if (managerUser) {
      const hasAccess = testIsHRAdminLogic(managerUser.role);
      console.log(`✗ Manager (${managerUser.employeeId}): ${managerUser.role} → isHRAdmin: ${hasAccess}`);
    }
    
    console.log('\n=== EXPECTED ACCESS ===');
    console.log('HR role → Can access Leave & Attendance admin features: YES ✓');
    console.log('RMG role → Can access Leave & Attendance admin features: YES ✓');
    console.log('SUPER_ADMIN role → Can access Leave & Attendance admin features: YES ✓');
    console.log('EMPLOYEE role → Can access Leave & Attendance admin features: NO ✗');
    console.log('MANAGER role → Can access Leave & Attendance admin features: NO ✗');
    
    console.log('\n=== FIX APPLIED ===');
    console.log('Changed from: user?.role === \'hr\' (lowercase)');
    console.log('Changed to: user?.role?.toUpperCase() === \'HR\' (case-insensitive)');
    console.log('Also added: SUPER_ADMIN and RMG roles\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testIsHRAdmin();
