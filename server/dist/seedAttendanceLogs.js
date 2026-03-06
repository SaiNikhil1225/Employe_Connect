"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const date_fns_1 = require("date-fns");
const AttendanceLog_1 = __importDefault(require("./models/AttendanceLog"));
const AttendancePolicy_1 = __importDefault(require("./models/AttendancePolicy"));
const Employee_1 = __importDefault(require("./models/Employee"));
// Load environment variables
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
// Helper to calculate hours between two times
const calculateHours = (checkIn, checkOut, breakMinutes = 60) => {
    const totalMinutes = (0, date_fns_1.differenceInMinutes)(checkOut, checkIn);
    const grossHours = totalMinutes / 60;
    const effectiveHours = (totalMinutes - breakMinutes) / 60;
    return {
        effective: Math.max(0, Math.round(effectiveHours * 10) / 10),
        gross: Math.max(0, Math.round(grossHours * 10) / 10)
    };
};
// Helper to generate random attendance status
const getRandomStatus = () => {
    const rand = Math.random();
    if (rand < 0.70)
        return 'present'; // 70% present
    if (rand < 0.75)
        return 'late'; // 5% late
    if (rand < 0.80)
        return 'wfh'; // 5% wfh
    if (rand < 0.88)
        return 'absent'; // 8% absent
    if (rand < 0.95)
        return 'leave'; // 7% leave
    return 'half-day'; // 5% half-day
};
// Generate check-in time based on status
const generateCheckInTime = (date, status, graceMinutes) => {
    if (status === 'absent' || status === 'leave' || status === 'weekly-off')
        return undefined;
    const baseTime = new Date(date);
    baseTime.setHours(10, 0, 0, 0); // Standard check-in: 10:00 AM
    if (status === 'late') {
        // Late by 20-60 minutes
        const lateMinutes = graceMinutes + Math.floor(Math.random() * 40) + 20;
        baseTime.setMinutes(baseTime.getMinutes() + lateMinutes);
    }
    else {
        // On time: 9:30-10:00 AM (within grace period)
        const variance = Math.floor(Math.random() * 30) - 30; // -30 to 0 minutes
        baseTime.setMinutes(baseTime.getMinutes() + variance);
    }
    return baseTime;
};
// Generate check-out time
const generateCheckOutTime = (checkIn, status) => {
    if (!checkIn || status === 'absent' || status === 'leave' || status === 'weekly-off')
        return undefined;
    const checkOut = new Date(checkIn);
    if (status === 'half-day') {
        // 4-5 hours for half-day
        checkOut.setHours(checkOut.getHours() + 4 + Math.floor(Math.random() * 2));
    }
    else {
        // Full day: 8-10 hours
        checkOut.setHours(checkOut.getHours() + 8 + Math.floor(Math.random() * 3));
    }
    // Add some random minutes
    checkOut.setMinutes(checkOut.getMinutes() + Math.floor(Math.random() * 60));
    return checkOut;
};
async function seedAttendanceLogs() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        // Get or create default attendance policy
        let policy = await AttendancePolicy_1.default.findOne({ isActive: true });
        if (!policy) {
            console.log('📋 Creating default attendance policy...');
            policy = new AttendancePolicy_1.default({
                policyName: 'Standard Office Policy',
                workingHoursPerDay: 9,
                standardCheckIn: '10:00 AM',
                standardCheckOut: '7:00 PM',
                graceMinutes: 15,
                weeklyOffDays: ['Sunday'],
                breakDuration: 60,
                isActive: true,
                applicableTo: ['all'],
                description: 'Standard 9-hour work day with 1-hour break'
            });
            await policy.save();
            console.log('✅ Created attendance policy\n');
        }
        // Get all active employees
        const employees = await Employee_1.default.find({ status: 'active' }).limit(50);
        console.log(`Found ${employees.length} active employees\n`);
        if (employees.length === 0) {
            console.log('❌ No active employees found. Please seed employees first.');
            process.exit(1);
        }
        // Clear existing attendance logs
        console.log('🗑️  Clearing existing attendance logs...');
        await AttendanceLog_1.default.deleteMany({});
        console.log('✅ Cleared existing data\n');
        // Generate attendance for the last 30 days
        console.log('📅 Generating attendance logs for last 30 days...');
        const today = new Date();
        const startDate = (0, date_fns_1.subDays)(today, 30);
        const attendanceRecords = [];
        let currentDate = startDate;
        let recordCount = 0;
        while (currentDate <= today) {
            const dateStart = (0, date_fns_1.startOfDay)(currentDate);
            const dayOfWeek = (0, date_fns_1.format)(currentDate, 'EEEE');
            // Check if it's a weekly off day
            const isWeeklyOff = policy.weeklyOffDays.includes(dayOfWeek);
            for (const employee of employees) {
                let status;
                if (isWeeklyOff) {
                    status = 'weekly-off';
                }
                else {
                    status = getRandomStatus();
                }
                const checkInTime = generateCheckInTime(dateStart, status, policy.graceMinutes);
                const checkOutTime = generateCheckOutTime(checkInTime, status);
                // Calculate hours
                let hours = { effective: 0, gross: 0 };
                if (checkInTime && checkOutTime) {
                    hours = calculateHours(checkInTime, checkOutTime, policy.breakDuration);
                }
                // Check if late
                let isLate = false;
                let lateMinutes = 0;
                if (checkInTime && status === 'present') {
                    const standardTime = (0, date_fns_1.parse)(policy.standardCheckIn, 'h:mm a', dateStart);
                    const graceTime = new Date(standardTime.getTime() + policy.graceMinutes * 60000);
                    if (checkInTime > graceTime) {
                        isLate = true;
                        lateMinutes = (0, date_fns_1.differenceInMinutes)(checkInTime, graceTime);
                        status = 'late';
                    }
                }
                const record = {
                    employeeId: employee.employeeId,
                    employeeName: employee.name,
                    department: employee.department || 'Engineering',
                    date: dateStart,
                    checkInTime,
                    checkOutTime,
                    breakDuration: policy.breakDuration,
                    effectiveHours: hours.effective,
                    grossHours: hours.gross,
                    status,
                    isLate,
                    lateMinutes,
                    hasTimeEntry: !!(checkInTime && checkOutTime),
                    workLocation: status === 'wfh' ? 'wfh' : 'office',
                    regularizationStatus: 'none',
                    createdBy: 'system'
                };
                attendanceRecords.push(record);
                recordCount++;
                // Insert in batches of 1000
                if (attendanceRecords.length >= 1000) {
                    await AttendanceLog_1.default.insertMany(attendanceRecords);
                    console.log(`  ✅ Inserted batch: ${recordCount} records processed`);
                    attendanceRecords.length = 0; // Clear array
                }
            }
            currentDate = (0, date_fns_1.addDays)(currentDate, 1);
        }
        // Insert remaining records
        if (attendanceRecords.length > 0) {
            await AttendanceLog_1.default.insertMany(attendanceRecords);
        }
        console.log(`✅ Inserted total ${recordCount} attendance log records\n`);
        // Show summary statistics
        const totalRecords = await AttendanceLog_1.default.countDocuments();
        const presentCount = await AttendanceLog_1.default.countDocuments({ status: 'present' });
        const lateCount = await AttendanceLog_1.default.countDocuments({ status: 'late' });
        const absentCount = await AttendanceLog_1.default.countDocuments({ status: 'absent' });
        const wfhCount = await AttendanceLog_1.default.countDocuments({ status: 'wfh' });
        const leaveCount = await AttendanceLog_1.default.countDocuments({ status: 'leave' });
        const weeklyOffCount = await AttendanceLog_1.default.countDocuments({ status: 'weekly-off' });
        console.log('📊 Summary Statistics:');
        console.log(`  Total Records: ${totalRecords}`);
        console.log(`  Present: ${presentCount} (${Math.round(presentCount / totalRecords * 100)}%)`);
        console.log(`  Late: ${lateCount} (${Math.round(lateCount / totalRecords * 100)}%)`);
        console.log(`  WFH: ${wfhCount} (${Math.round(wfhCount / totalRecords * 100)}%)`);
        console.log(`  Absent: ${absentCount} (${Math.round(absentCount / totalRecords * 100)}%)`);
        console.log(`  Leave: ${leaveCount} (${Math.round(leaveCount / totalRecords * 100)}%)`);
        console.log(`  Weekly Off: ${weeklyOffCount} (${Math.round(weeklyOffCount / totalRecords * 100)}%)`);
        console.log('');
        console.log('🎉 Attendance logs seeding completed successfully!\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}
seedAttendanceLogs();
//# sourceMappingURL=seedAttendanceLogs.js.map