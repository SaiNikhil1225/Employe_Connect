import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import AttendanceLog from './models/AttendanceLog';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function clearAttendanceLogs() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Deleting all attendance logs...');
    const result = await AttendanceLog.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} attendance log records\n`);

    console.log('🎉 Cleanup completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing attendance logs:', error);
    process.exit(1);
  }
}

clearAttendanceLogs();
