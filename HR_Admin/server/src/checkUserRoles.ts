import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const Employee = mongoose.model('Employee', EmployeeSchema);

async function checkUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== CHECKING USER ROLES ===\n');
    
    // Check all unique roles
    const roles = await Employee.distinct('role');
    console.log('Available roles:', roles);
    console.log('');
    
    // Check HR users
    const hrUsers = await Employee.find({ role: { $in: ['HR', 'hr'] } }).limit(5);
    console.log(`HR Role Users (${hrUsers.length}):`);
    hrUsers.forEach(emp => {
      console.log(`  - ${emp.employeeId}: ${emp.name} (${emp.email})`);
      console.log(`    Role: ${emp.role}, HasLogin: ${emp.hasLoginAccess}, Active: ${emp.isActive}`);
    });
    console.log('');
    
    // Check SUPER_ADMIN users
    const adminUsers = await Employee.find({ role: 'SUPER_ADMIN' }).limit(5);
    console.log(`Super Admin Users (${adminUsers.length}):`);
    adminUsers.forEach(emp => {
      console.log(`  - ${emp.employeeId}: ${emp.name} (${emp.email})`);
      console.log(`    Role: ${emp.role}, HasLogin: ${emp.hasLoginAccess}, Active: ${emp.isActive}`);
    });
    console.log('');
    
    // Check users with login access by role
    const loginUsers = await Employee.aggregate([
      { $match: { hasLoginAccess: true, isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('Users with Login Access by Role:');
    loginUsers.forEach(r => {
      console.log(`  ${r._id}: ${r.count}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserRoles();
