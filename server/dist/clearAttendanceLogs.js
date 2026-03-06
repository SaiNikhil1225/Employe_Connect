"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const AttendanceLog_1 = __importDefault(require("./models/AttendanceLog"));
(0, dotenv_1.config)({ path: path_1.default.join(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';
async function clearAttendanceLogs() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');
        console.log('🗑️  Deleting all attendance logs...');
        const result = await AttendanceLog_1.default.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} attendance log records\n`);
        console.log('🎉 Cleanup completed successfully!\n');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error clearing attendance logs:', error);
        process.exit(1);
    }
}
clearAttendanceLogs();
//# sourceMappingURL=clearAttendanceLogs.js.map