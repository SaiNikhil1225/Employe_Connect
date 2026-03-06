"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
// Define schemas
const userSchema = new mongoose_1.default.Schema({
    email: String,
    password: String,
    name: String,
    role: String,
    department: String,
    designation: String,
    employeeId: String,
    avatar: String,
}, { timestamps: true, strict: false });
const employeeSchema = new mongoose_1.default.Schema({
    employeeId: String,
    id: String,
    name: String,
    email: String,
    phone: String,
    department: String,
    designation: String,
    dateOfJoining: String,
    reportingManager: mongoose_1.default.Schema.Types.Mixed,
    location: String,
    status: String,
    avatar: String,
    skills: [String],
    experience: Number,
    education: String,
    address: mongoose_1.default.Schema.Types.Mixed,
    emergencyContact: mongoose_1.default.Schema.Types.Mixed,
}, { timestamps: true, strict: false });
const attendanceSchema = new mongoose_1.default.Schema({
    employeeId: String,
    date: String,
    status: String,
    checkIn: String,
    checkOut: String,
    workHours: Number,
    notes: String,
}, { timestamps: true, strict: false });
const leaveSchema = new mongoose_1.default.Schema({
    employeeId: String,
    employeeName: String,
    leaveType: String,
    startDate: String,
    endDate: String,
    days: Number,
    reason: String,
    status: String,
    appliedOn: String,
    approvedBy: String,
    approvedOn: String,
    remarks: String,
}, { timestamps: true, strict: false });
const holidaySchema = new mongoose_1.default.Schema({
    name: String,
    date: String,
    type: String,
    description: String,
}, { timestamps: true, strict: false });
const announcementSchema = new mongoose_1.default.Schema({
    title: String,
    content: String,
    priority: String,
    category: String,
    publishedBy: String,
    publishedOn: String,
    expiresOn: String,
    targetAudience: [String],
    attachments: [String],
}, { timestamps: true, strict: false });
const celebrationSchema = new mongoose_1.default.Schema({
    type: String,
    employeeId: String,
    name: String,
    date: String,
    message: String,
    avatar: String,
}, { timestamps: true });
const newJoinerSchema = new mongoose_1.default.Schema({
    employeeId: String,
    name: String,
    designation: String,
    department: String,
    joiningDate: String,
    avatar: String,
}, { timestamps: true });
const projectSchema = new mongoose_1.default.Schema({
    projectId: String,
    id: String,
    name: String,
    client: String,
    status: String,
    startDate: String,
    endDate: String,
    budget: Number,
    spent: Number,
    resources: [mongoose_1.default.Schema.Types.Mixed],
    description: String,
}, { timestamps: true, strict: false });
const allocationSchema = new mongoose_1.default.Schema({
    employeeId: String,
    employeeName: String,
    projectId: String,
    projectName: String,
    allocation: Number,
    startDate: String,
    endDate: String,
    role: String,
    billable: Boolean,
}, { timestamps: true, strict: false });
const payrollSchema = new mongoose_1.default.Schema({
    employeeId: String,
    employeeName: String,
    month: String,
    year: Number,
    basicSalary: Number,
    hra: Number,
    allowances: Number,
    deductions: Number,
    netSalary: Number,
    status: String,
    paymentDate: String,
}, { timestamps: true, strict: false });
const helpdeskTicketSchema = new mongoose_1.default.Schema({
    ticketNumber: String,
    id: String,
    userId: String,
    userName: String,
    userEmail: String,
    userDepartment: String,
    highLevelCategory: String,
    subCategory: String,
    subject: String,
    description: String,
    urgency: String,
    status: String,
    approval: mongoose_1.default.Schema.Types.Mixed,
    processing: mongoose_1.default.Schema.Types.Mixed,
    assignment: mongoose_1.default.Schema.Types.Mixed,
    conversation: [mongoose_1.default.Schema.Types.Mixed],
    attachments: [String],
    history: [mongoose_1.default.Schema.Types.Mixed],
    sla: mongoose_1.default.Schema.Types.Mixed,
    createdAt: String,
    updatedAt: String,
}, { timestamps: true, strict: false });
const subCategoryMappingSchema = new mongoose_1.default.Schema({
    category: String,
    subcategories: mongoose_1.default.Schema.Types.Mixed,
}, { timestamps: true });
// Create models
const User = mongoose_1.default.model('User', userSchema);
const Employee = mongoose_1.default.model('Employee', employeeSchema);
const Attendance = mongoose_1.default.model('Attendance', attendanceSchema);
const Leave = mongoose_1.default.model('Leave', leaveSchema);
const Holiday = mongoose_1.default.model('Holiday', holidaySchema);
const Announcement = mongoose_1.default.model('Announcement', announcementSchema);
const Celebration = mongoose_1.default.model('Celebration', celebrationSchema);
const NewJoiner = mongoose_1.default.model('NewJoiner', newJoinerSchema);
const Project = mongoose_1.default.model('Project', projectSchema);
const Allocation = mongoose_1.default.model('Allocation', allocationSchema);
const Payroll = mongoose_1.default.model('Payroll', payrollSchema);
const HelpdeskTicket = mongoose_1.default.model('HelpdeskTicket', helpdeskTicketSchema);
const SubCategoryMapping = mongoose_1.default.model('SubCategoryMapping', subCategoryMappingSchema);
// Read JSON file helper
function readJsonFile(filename) {
    try {
        const dataPath = path.join(__dirname, 'data', filename);
        const data = fs.readFileSync(dataPath, 'utf-8');
        const jsonData = JSON.parse(data);
        // Remove _id field to let MongoDB generate its own
        return jsonData.map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...rest } = item;
            return rest;
        });
    }
    catch (error) {
        console.error(`⚠️  Warning: Could not read ${filename}:`, error instanceof Error ? error.message : 'Unknown error');
        return [];
    }
}
// Seed function
async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.collection.drop().catch(() => { });
        await Employee.collection.drop().catch(() => { });
        await Attendance.collection.drop().catch(() => { });
        await Leave.collection.drop().catch(() => { });
        await Holiday.collection.drop().catch(() => { });
        await Announcement.collection.drop().catch(() => { });
        await Celebration.collection.drop().catch(() => { });
        await NewJoiner.collection.drop().catch(() => { });
        await Project.collection.drop().catch(() => { });
        await Allocation.collection.drop().catch(() => { });
        await Payroll.collection.drop().catch(() => { });
        await HelpdeskTicket.collection.drop().catch(() => { });
        await SubCategoryMapping.collection.drop().catch(() => { });
        console.log('✅ Cleared existing data');
        // Seed Users
        console.log('📥 Importing users...');
        const users = readJsonFile('users.json');
        if (users.length > 0) {
            await User.insertMany(users);
            console.log(`✅ Imported ${users.length} users`);
        }
        else {
            console.log('⚠️  Skipped users (no data file found)');
        }
        // Seed Employees
        console.log('📥 Importing employees...');
        const employees = readJsonFile('employees.json');
        if (employees.length > 0) {
            await Employee.insertMany(employees);
            console.log(`✅ Imported ${employees.length} employees`);
        }
        else {
            console.log('⚠️  Skipped employees (no data file found)');
        }
        // Seed Attendance
        console.log('📥 Importing attendance records...');
        const attendance = readJsonFile('attendance.json');
        if (attendance.length > 0) {
            await Attendance.insertMany(attendance);
            console.log(`✅ Imported ${attendance.length} attendance records`);
        }
        else {
            console.log('⚠️  Skipped attendance (no data file found)');
        }
        // Seed Leaves
        console.log('📥 Importing leave records...');
        const leaves = readJsonFile('leaves.json');
        if (leaves.length > 0) {
            await Leave.insertMany(leaves);
            console.log(`✅ Imported ${leaves.length} leave records`);
        }
        else {
            console.log('⚠️  Skipped leaves (no data file found)');
        }
        // Seed Holidays
        console.log('📥 Importing holidays...');
        const holidays = readJsonFile('holidays.json');
        if (holidays.length > 0) {
            await Holiday.insertMany(holidays);
            console.log(`✅ Imported ${holidays.length} holidays`);
        }
        else {
            console.log('⚠️  Skipped holidays (no data file found)');
        }
        // Seed Announcements
        console.log('📥 Importing announcements...');
        const announcements = readJsonFile('announcements.json');
        if (announcements.length > 0) {
            await Announcement.insertMany(announcements);
            console.log(`✅ Imported ${announcements.length} announcements`);
        }
        else {
            console.log('⚠️  Skipped announcements (no data file found)');
        }
        // Seed Celebrations
        console.log('📥 Importing celebrations...');
        const celebrations = readJsonFile('celebrations.json');
        if (celebrations.length > 0) {
            await Celebration.insertMany(celebrations);
            console.log(`✅ Imported ${celebrations.length} celebrations`);
        }
        else {
            console.log('⚠️  Skipped celebrations (no data file found)');
        }
        // Seed New Joiners
        console.log('📥 Importing new joiners...');
        const newJoiners = readJsonFile('newJoiners.json');
        if (newJoiners.length > 0) {
            await NewJoiner.insertMany(newJoiners);
            console.log(`✅ Imported ${newJoiners.length} new joiners`);
        }
        else {
            console.log('⚠️  Skipped new joiners (no data file found)');
        }
        // Seed Projects
        console.log('📥 Importing projects...');
        const projects = readJsonFile('projects.json');
        if (projects.length > 0) {
            await Project.insertMany(projects);
            console.log(`✅ Imported ${projects.length} projects`);
        }
        else {
            console.log('⚠️  Skipped projects (no data file found)');
        }
        // Seed Allocations
        console.log('📥 Importing allocations...');
        const allocations = readJsonFile('allocations.json');
        if (allocations.length > 0) {
            await Allocation.insertMany(allocations);
            console.log(`✅ Imported ${allocations.length} allocations`);
        }
        else {
            console.log('⚠️  Skipped allocations (no data file found)');
        }
        // Seed Payroll
        console.log('📥 Importing payroll records...');
        const payroll = readJsonFile('payroll.json');
        if (payroll.length > 0) {
            await Payroll.insertMany(payroll);
            console.log(`✅ Imported ${payroll.length} payroll records`);
        }
        else {
            console.log('⚠️  Skipped payroll (no data file found)');
        }
        // Seed SubCategory Mapping
        console.log('📥 Importing subcategory mappings...');
        try {
            const subCategoryMappingRaw = fs.readFileSync(path.join(__dirname, 'data/subCategoryMapping.json'), 'utf-8');
            const subCategoryMapping = JSON.parse(subCategoryMappingRaw);
            await SubCategoryMapping.insertMany([{
                    category: 'all',
                    subcategories: subCategoryMapping
                }]);
            console.log(`✅ Imported subcategory mappings`);
        }
        catch (error) {
            console.log('⚠️  Skipped subcategory mappings (no data file found)');
        }
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Employees: ${employees.length}`);
        console.log(`   Attendance: ${attendance.length}`);
        console.log(`   Leaves: ${leaves.length}`);
        console.log(`   Holidays: ${holidays.length}`);
        console.log(`   Announcements: ${announcements.length}`);
        console.log(`   Celebrations: ${celebrations.length}`);
        console.log(`   New Joiners: ${newJoiners.length}`);
        console.log(`   Projects: ${projects.length}`);
        console.log(`   Allocations: ${allocations.length}`);
        console.log(`   Payroll: ${payroll.length}`);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}
// Run seeding
seedDatabase();
//# sourceMappingURL=seed.js.map