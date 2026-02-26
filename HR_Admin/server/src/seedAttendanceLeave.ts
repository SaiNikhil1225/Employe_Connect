import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { format, subDays, addDays, startOfMonth, endOfMonth, isWeekend } from 'date-fns';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

// Define minimal schemas for inserting data
const EmployeeSchema = new mongoose.Schema({}, { strict: false, collection: 'employees' });
const AttendanceSchema = new mongoose.Schema({}, { strict: false, collection: 'attendances' });
const LeaveSchema = new mongoose.Schema({}, { strict:false, collection: 'leaves' });
const LeaveBalanceSchema = new mongoose.Schema({}, { strict: false, collection: 'leavebalances' });

const Employee = mongoose.model('Employee', EmployeeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);
const Leave = mongoose.model('Leave', LeaveSchema);
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);

// Helper to generate random status
const getRandomStatus = () => {
  const rand = Math.random();
  if (rand < 0.75) return 'Present'; // 75% present
  if (rand < 0.85) return 'Absent';  // 10% absent
  if (rand < 0.95) return 'Late';    // 10% late
  return 'Half Day';                  // 5% half day
};

// Helper to generate check-in/out times
const getCheckInTime = (status: string) => {
  if (status === 'Absent') return null;
  if (status === 'Late') {
    const hour = 9 + Math.floor(Math.random() * 2); // 9-10 AM (late)
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  // On time: 8:00-8:45
  const hour = 8;
  const minute = Math.floor(Math.random() * 45);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getCheckOutTime = (status: string, checkIn: string | null) => {
  if (!checkIn || status === 'Absent') return null;
  // Usually 5-7 PM
  const hour = 17 + Math.floor(Math.random() * 3);
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const calculateWorkHours = (checkIn: string | null, checkOut: string | null, status: string) => {
  if (!checkIn || !checkOut || status === 'Absent') return 0;
  const [inHour, inMin] = checkIn.split(':').map(Number);
  const [outHour, outMin] = checkOut.split(':').map(Number);
  const hours = (outHour * 60 + outMin - inHour * 60 - inMin) / 60;
  return Math.round(hours * 10) / 10; // Round to 1 decimal
};

async function seedAttendanceAndLeaves() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all active employees
    const employees = await Employee.find({ status: 'active' });
    console.log(`Found ${employees.length} active employees\n`);

    if (employees.length === 0) {
      console.log('❌ No active employees found. Please seed employees first.');
      process.exit(1);
    }

    // Clear existing attendance and leave data
    console.log('🗑️  Clearing existing attendance and leave data...');
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Generate attendance for the last 60 days
    console.log('📅 Generating attendance data for last 60 days...');
    const today = new Date();
    const startDate = subDays(today, 60);
    
    const attendanceRecords = [];
    let currentDate = startDate;
    
    while (currentDate <= today) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Skip weekends
      if (!isWeekend(currentDate)) {
        for (const employee of employees) {
          const status = getRandomStatus();
          const checkIn = getCheckInTime(status);
          const checkOut = getCheckOutTime(status, checkIn);
          const workHours = calculateWorkHours(checkIn, checkOut, status);
          
          attendanceRecords.push({
            employeeId: employee.employeeId,
            date: dateStr,
            status,
            checkIn,
            checkOut,
            workHours,
            notes: status === 'Late' ? 'Traffic delay' : undefined
          });
        }
      } else {
        // Mark weekends
        for (const employee of employees) {
          attendanceRecords.push({
            employeeId: employee.employeeId,
            date: dateStr,
            status: 'Weekend',
            checkIn: null,
            checkOut: null,
            workHours: 0
          });
        }
      }
      
      currentDate = addDays(currentDate, 1);
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Inserted ${attendanceRecords.length} attendance records\n`);

    // Generate some leave records (past month)
    console.log('🏖️  Generating leave data...');
    const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave'];
    const leaveRecords = [];
    
    // Generate 2-3 leaves per employee
    for (const employee of employees.slice(0, 20)) { // First 20 employees
      const numLeaves = 2 + Math.floor(Math.random() * 2); // 2-3 leaves
      
      for (let i = 0; i < numLeaves; i++) {
        const daysAgo = Math.floor(Math.random() * 30) + 5; // 5-35 days ago
        const leaveDuration = Math.floor(Math.random() * 3) + 1; // 1-3 days
        const leaveStart = format(subDays(today, daysAgo), 'yyyy-MM-dd');
        const leaveEnd = format(addDays(subDays(today, daysAgo), leaveDuration - 1), 'yyyy-MM-dd');
        const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
        
        // Random status based on date
        let status: string;
        if (daysAgo > 15) {
          status = Math.random() < 0.8 ? 'approved' : 'rejected';
        } else if (daysAgo > 5) {
          status = 'approved';
        } else {
          status = Math.random() < 0.3 ? 'pending' : 'approved';
        }
        
        leaveRecords.push({
          employeeId: employee.employeeId,
          employeeName: employee.name,
          leaveType,
          startDate: leaveStart,
          endDate: leaveEnd,
          days: leaveDuration,
          reason: leaveType === 'Sick Leave' ? 'Not feeling well' : 'Personal work',
          status,
          appliedOn: format(subDays(new Date(leaveStart), 2), 'yyyy-MM-dd'),
          approvedBy: status !== 'pending' ? 'HR001' : undefined,
          approvedOn: status === 'approved' ? format(subDays(new Date(leaveStart), 1), 'yyyy-MM-dd') : undefined,
          rejectedBy: status === 'rejected' ? 'HR001' : undefined,
          rejectedOn: status === 'rejected' ? format(subDays(new Date(leaveStart), 1), 'yyyy-MM-dd') : undefined,
          rejectionReason: status === 'rejected' ? 'Resource constraints' : undefined
        });
      }
    }

    await Leave.insertMany(leaveRecords);
    console.log(`✅ Inserted ${leaveRecords.length} leave records\n`);

    // Update leave balances
    console.log('💰 Updating leave balances...');
    const leaveBalances = await LeaveBalance.find({});
    
    for (const balance of leaveBalances) {
      const employeeLeaves = leaveRecords.filter(l => 
        l.employeeId === balance.employeeId && l.status === 'approved'
      );
      
      // Initialize leaveTypes array if it doesn't exist
      if (!balance.leaveTypes || balance.leaveTypes.length === 0) {
        balance.leaveTypes = [
          { type: 'Casual Leave', allocated: 12, available: 12, used: 0, pending: 0 },
          { type: 'Sick Leave', allocated: 12, available: 12, used: 0, pending: 0 },
          { type: 'Earned Leave', allocated: 15, available: 15, used: 0, pending: 0 }
        ];
      }
      
      // Calculate used leaves by type
      balance.leaveTypes.forEach((lt: any) => {
        const usedDays = employeeLeaves
          .filter(l => l.leaveType === lt.type)
          .reduce((sum, l) => sum + l.days, 0);
        
        lt.used = usedDays;
        lt.available = lt.allocated - usedDays;
      });
      
      await balance.save();
    }
    
    console.log(`✅ Updated ${leaveBalances.length} leave balance records\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Attendance records: ${attendanceRecords.length}`);
    console.log(`  - Leave records: ${leaveRecords.length}`);
    console.log(`  - Leave balances updated: ${leaveBalances.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedAttendanceAndLeaves();
