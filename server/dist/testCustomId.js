"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Employee_1 = __importDefault(require("./models/Employee"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function testCustomId() {
    try {
        await (0, database_1.default)();
        console.log('🧪 Testing custom _id for Employee model...\n');
        // Try to create a test employee with custom _id
        const testEmployee = new Employee_1.default({
            _id: 'TEST001',
            employeeId: 'TEST001',
            name: 'Test Employee',
            email: 'test@company.com',
            role: 'EMPLOYEE',
            department: 'Test',
            designation: 'Tester',
            password: 'Test@123',
            hasLoginAccess: true,
            isActive: true,
            status: 'active',
            dateOfJoining: '2024-01-01'
        });
        await testEmployee.save();
        console.log('✅ Created test employee with custom _id');
        console.log(`   _id: ${testEmployee._id}`);
        console.log(`   employeeId: ${testEmployee.employeeId}`);
        // Clean up
        await Employee_1.default.deleteOne({ _id: 'TEST001' });
        console.log('\n✅ Test passed! Employee model accepts custom string _id');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}
testCustomId();
//# sourceMappingURL=testCustomId.js.map