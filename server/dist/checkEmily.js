"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Employee_1 = __importDefault(require("./models/Employee"));
const ITSpecialist_1 = __importDefault(require("./models/ITSpecialist"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function checkEmilyChen() {
    try {
        await (0, database_1.default)();
        console.log('🔍 Checking Emily Chen records...\n');
        const employee = await Employee_1.default.findOne({ email: 'emily.chen@company.com' });
        console.log('Employee record:');
        console.log(`  _id: ${employee?._id}`);
        console.log(`  employeeId: ${employee?.employeeId}`);
        console.log(`  name: ${employee?.name}`);
        console.log(`  email: ${employee?.email}`);
        console.log(`  role: ${employee?.role}`);
        const specialist = await ITSpecialist_1.default.findOne({ email: 'emily.chen@company.com' });
        console.log('\nITSpecialist record:');
        console.log(`  _id: ${specialist?._id}`);
        console.log(`  employeeId: ${specialist?.employeeId}`);
        console.log(`  name: ${specialist?.name}`);
        console.log(`  email: ${specialist?.email}`);
        console.log(`  role: ${specialist?.role}`);
        console.log('\n✅ IDs match:', employee?._id?.toString() === specialist?._id?.toString());
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
checkEmilyChen();
//# sourceMappingURL=checkEmily.js.map