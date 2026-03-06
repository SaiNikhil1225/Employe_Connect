"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
/**
 * Script to create MongoDB indexes for Timesheet collections
 * Run this once after integrating the timesheet module
 *
 * Usage: npx ts-node src/scripts/createTimesheetIndexes.ts
 */
async function createTimesheetIndexes() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_connect');
        console.log('✅ Connected to MongoDB\n');
        const db = mongoose_1.default.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        console.log('📊 Creating indexes for TimesheetEntry collection...\n');
        // Get the timesheetentries collection
        const timesheetEntriesCollection = db.collection('timesheetentries');
        // 1. Employee + Date compound index (for fetching employee's timesheets)
        console.log('Creating index: { employeeId: 1, date: 1 }');
        await timesheetEntriesCollection.createIndex({ employeeId: 1, date: 1 }, { name: 'idx_employee_date' });
        console.log('✅ Created employee-date index\n');
        // 2. Project + Date compound index (for project-wise reporting)
        console.log('Creating index: { projectId: 1, date: 1 }');
        await timesheetEntriesCollection.createIndex({ projectId: 1, date: 1 }, { name: 'idx_project_date' });
        console.log('✅ Created project-date index\n');
        // 3. Approval Status + Submitted At (for approval workflows)
        console.log('Creating index: { approvalStatus: 1, submittedAt: 1 }');
        await timesheetEntriesCollection.createIndex({ approvalStatus: 1, submittedAt: 1 }, { name: 'idx_approval_submitted' });
        console.log('✅ Created approval-submitted index\n');
        // 4. Billable + Date (for billing reports)
        console.log('Creating index: { billable: 1, date: 1 }');
        await timesheetEntriesCollection.createIndex({ billable: 1, date: 1 }, { name: 'idx_billable_date' });
        console.log('✅ Created billable-date index\n');
        // 5. UNIQUE constraint: Prevent duplicate entries
        console.log('Creating UNIQUE index: { employeeId: 1, date: 1, projectId: 1, udaId: 1 }');
        try {
            await timesheetEntriesCollection.createIndex({ employeeId: 1, date: 1, projectId: 1, udaId: 1 }, {
                unique: true,
                name: 'idx_unique_entry'
            });
            console.log('✅ Created unique constraint index\n');
        }
        catch (error) {
            if (error.code === 11000) {
                console.log('⚠️  Unique index already exists (this is fine)\n');
            }
            else {
                throw error;
            }
        }
        // 6. Legacy Timesheet collection index (if using week-based format)
        console.log('📊 Creating indexes for Timesheet collection (legacy)...\n');
        const timesheetsCollection = db.collection('timesheets');
        console.log('Creating index: { employeeId: 1, weekStartDate: 1 }');
        await timesheetsCollection.createIndex({ employeeId: 1, weekStartDate: 1 }, { name: 'idx_employee_week' });
        console.log('✅ Created employee-week index\n');
        // List all indexes created
        console.log('📋 Summary of all indexes:\n');
        const timesheetEntryIndexes = await timesheetEntriesCollection.listIndexes().toArray();
        console.log('TimesheetEntry collection indexes:');
        timesheetEntryIndexes.forEach((index) => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        console.log('\nTimesheet collection indexes:');
        const timesheetIndexes = await timesheetsCollection.listIndexes().toArray();
        timesheetIndexes.forEach((index) => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
        console.log('\n✨ All indexes created successfully!');
        console.log('🚀 Timesheet module is ready to use.\n');
    }
    catch (error) {
        console.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}
// Run the script
createTimesheetIndexes();
//# sourceMappingURL=createTimesheetIndexes.js.map