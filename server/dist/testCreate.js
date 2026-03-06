"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const Employee_1 = __importDefault(require("./models/Employee"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function testCreateWithId() {
    try {
        await (0, database_1.default)();
        console.log('🧪 Testing Employee.create() with custom _id...\n');
        const testData = {
            _id: 'CUSTOM123',
            employeeId: 'CUSTOM123',
            name: 'Custom ID Test',
            email: 'customid@test.com',
            role: 'EMPLOYEE',
            department: 'Test',
            designation: 'Tester',
            password: 'Test@123',
            hasLoginAccess: true,
            isActive: true,
            status: 'active',
            dateOfJoining: '2024-01-01'
        };
        console.log('Input data _id:', testData._id);
        const created = await Employee_1.default.create(testData);
        console.log('\nCreated employee _id:', created._id);
        console.log('Type:', typeof created._id);
        console.log('toString():', created._id.toString());
        // Retrieve it back
        const found = await Employee_1.default.findOne({ email: 'customid@test.com' });
        console.log('\nFound employee _id:', found?._id);
        // Clean up
        await Employee_1.default.deleteOne({ email: 'customid@test.com' });
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
testCreateWithId();
//# sourceMappingURL=testCreate.js.map