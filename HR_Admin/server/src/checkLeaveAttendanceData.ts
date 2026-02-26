import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

// Define minimal schemas for querying
const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const AttendanceSchema = new mongoose.Schema({}, { strict: false, collection: 'attendances' });
const LeaveSchema = new mongoose.Schema({}, { strict: false, collection: 'leaves' });
const LeaveBalanceSchema = new mongoose.Schema({}, { strict: false, collection: 'leavebalances' });

const Employee = mongoose.model('Employee', EmployeeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Leave = mongoose.model('Leave', LeaveSchema);
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);

async function checkData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check active employees
    const activeEmployees = await Employee.find({ status: 'active' }).limit(5);
    console.log('\n=== ACTIVE EMPLOYEES ===');
    console.log(`Total active employees: ${await Employee.countDocuments({ status: 'active' })}`);
    console.log('Sample employees:');
    activeEmployees.forEach(emp => {
      console.log(`- ${emp.name} (${emp.employeeId}): ${emp.department || 'No Dept'}, ${emp.designation || 'No Designation'}`);
    });

    // Check all employee statuses
    const employeeStatusCounts = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n=== EMPLOYEE STATUS BREAKDOWN ===');
    employeeStatusCounts.forEach(s => {
      console.log(`${s._id || 'null/undefined'}: ${s.count}`);
    });

    // Check attendance data
    const attendanceCount = await Attendance.countDocuments();
    console.log('\n=== ATTENDANCE DATA ===');
    console.log(`Total attendance records: ${attendanceCount}`);
    
    if (attendanceCount > 0) {
      const sampleAttendance = await Attendance.find().limit(5).sort({ date: -1 });
      console.log('Sample recent attendance:');
      sampleAttendance.forEach(att => {
        console.log(`- ${att.employeeId}: ${att.date}, Status: ${att.status}`);
      });

      // Check attendance by status
      const attendanceByStatus = await Attendance.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('\nAttendance by status:');
      attendanceByStatus.forEach(s => {
        console.log(`${s._id}: ${s.count}`);
      });

      // Check recent attendance (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAttendanceCount = await Attendance.countDocuments({
        date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
      });
      console.log(`\nAttendance records in last 30 days: ${recentAttendanceCount}`);
    }

    // Check leave data
    const leaveCount = await Leave.countDocuments();
    console.log('\n=== LEAVE DATA ===');
    console.log(`Total leave records: ${leaveCount}`);
    
    if (leaveCount > 0) {
      const sampleLeaves = await Leave.find().limit(5).sort({ createdAt: -1 });
      console.log('Sample recent leaves:');
      sampleLeaves.forEach(leave => {
        console.log(`- ${leave.employeeId}: ${leave.leaveType}, ${leave.startDate} to ${leave.endDate}, Status: ${leave.status}`);
      });

      // Check leaves by status
      const leavesByStatus = await Leave.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      console.log('\nLeaves by status:');
      leavesByStatus.forEach(s => {
        console.log(`${s._id}: ${s.count}`);
      });
    }

    // Check leave balance data
    const leaveBalanceCount = await LeaveBalance.countDocuments();
    console.log('\n=== LEAVE BALANCE DATA ===');
    console.log(`Total leave balance records: ${leaveBalanceCount}`);
    
    if (leaveBalanceCount > 0) {
      const sampleBalances = await LeaveBalance.find().limit(3);
      console.log('Sample leave balances:');
      sampleBalances.forEach(balance => {
        console.log(`- ${balance.employeeId}:`);
        if (balance.leaveTypes && balance.leaveTypes.length > 0) {
          balance.leaveTypes.forEach((lt: any) => {
            console.log(`  ${lt.type}: Allocated=${lt.allocated}, Available=${lt.available}, Used=${lt.used}`);
          });
        } else {
          console.log('  No leave types configured');
        }
      });
    }

    // Check if employeeId fields match between collections
    console.log('\n=== CHECKING DATA CONSISTENCY ===');
    const employeeIds = await Employee.distinct('employeeId', { status: 'active' });
    console.log(`Active employee IDs count: ${employeeIds.length}`);
    
    if (employeeIds.length > 0) {
      const sampleEmpId = employeeIds[0];
      console.log(`\nChecking data for sample employee: ${sampleEmpId}`);
      
      const empAttendance = await Attendance.countDocuments({ employeeId: sampleEmpId });
      const empLeaves = await Leave.countDocuments({ employeeId: sampleEmpId });
      const empBalance = await LeaveBalance.findOne({ employeeId: sampleEmpId });
      
      console.log(`- Attendance records: ${empAttendance}`);
      console.log(`- Leave records: ${empLeaves}`);
      console.log(`- Leave balance: ${empBalance ? 'Yes' : 'No'}`);
    }

    console.log('\n=== CHECK COMPLETE ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error checking data:', error);
    process.exit(1);
  }
}

checkData();
