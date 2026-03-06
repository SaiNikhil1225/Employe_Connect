"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const Employee_1 = __importDefault(require("./models/Employee"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
async function updateHRUser() {
    try {
        await (0, database_1.default)();
        console.log('🔄 Updating HR User credentials...');
        // New HR credentials
        const newEmail = 'hr@acuvate.com';
        const newPassword = 'Hr@123';
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update by employeeId HR001
        const result = await Employee_1.default.findOneAndUpdate({ employeeId: 'HR001' }, {
            $set: {
                email: newEmail,
                password: hashedPassword,
                name: 'HR Admin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
            }
        }, { new: true });
        if (result) {
            console.log('✅ HR User updated successfully!');
            console.log('\n📝 New Login Credentials:');
            console.log('  Email:    hr@acuvate.com');
            console.log('  Password: Hr@123');
            console.log('  Role:     HR');
            console.log(`  Employee ID: ${result.employeeId}`);
        }
        else {
            // Try to find by old email
            const resultByEmail = await Employee_1.default.findOneAndUpdate({ email: 'manoj.tupakula@acuvate.com' }, {
                $set: {
                    email: newEmail,
                    password: hashedPassword,
                    name: 'HR Admin',
                    employeeId: 'HR001',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
                    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
                }
            }, { new: true });
            if (resultByEmail) {
                console.log('✅ HR User updated successfully (found by old email)!');
                console.log('\n📝 New Login Credentials:');
                console.log('  Email:    hr@acuvate.com');
                console.log('  Password: Hr@123');
                console.log('  Role:     HR');
            }
            else {
                console.log('❌ HR User not found. Creating new HR user...');
                // Create new HR user
                const newHRUser = new Employee_1.default({
                    employeeId: 'HR001',
                    name: 'HR Admin',
                    email: newEmail,
                    password: hashedPassword,
                    phone: '+91-9876543212',
                    designation: 'HR Manager',
                    department: 'Human Resources',
                    location: 'Hyderabad',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
                    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
                    dateOfBirth: '1987-08-25',
                    dateOfJoining: '2017-06-15',
                    businessUnit: 'Human Resources',
                    status: 'active',
                    role: 'HR',
                    hasLoginAccess: true,
                    isActive: true,
                });
                await newHRUser.save();
                console.log('✅ New HR User created successfully!');
                console.log('\n📝 Login Credentials:');
                console.log('  Email:    hr@acuvate.com');
                console.log('  Password: Hr@123');
                console.log('  Role:     HR');
            }
        }
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error updating HR user:', error);
        process.exit(1);
    }
}
updateHRUser();
//# sourceMappingURL=updateHRUser.js.map