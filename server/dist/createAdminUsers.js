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
async function createAdminUsers() {
    try {
        await (0, database_1.default)();
        console.log('🔄 Creating Finance and Facilities Admin users...\n');
        // Finance Admin credentials
        const financeEmail = 'finance@acuvate.com';
        const financePassword = 'Finance@123';
        const financeHashedPassword = await bcryptjs_1.default.hash(financePassword, 10);
        // Facilities Admin credentials
        const facilitiesEmail = 'facilities@acuvate.com';
        const facilitiesPassword = 'Facilities@123';
        const facilitiesHashedPassword = await bcryptjs_1.default.hash(facilitiesPassword, 10);
        // Create or update Finance Admin
        const financeAdmin = await Employee_1.default.findOneAndUpdate({ employeeId: 'FIN001' }, {
            $set: {
                employeeId: 'FIN001',
                name: 'Finance Admin',
                email: financeEmail,
                password: financeHashedPassword,
                phone: '+91-9876543213',
                designation: 'Finance Manager',
                department: 'Finance',
                location: 'Hyderabad',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Finance',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Finance',
                dateOfBirth: '1985-05-15',
                dateOfJoining: '2016-03-10',
                businessUnit: 'Finance',
                status: 'active',
                role: 'FINANCE_ADMIN',
                hasLoginAccess: true,
                isActive: true,
            }
        }, { new: true, upsert: true });
        console.log('✅ Finance Admin created/updated successfully!');
        console.log('  Employee ID:', financeAdmin.employeeId);
        console.log('  Email:      ', financeEmail);
        console.log('  Password:   ', financePassword);
        console.log('  Role:       ', financeAdmin.role);
        console.log('  Department: ', financeAdmin.department);
        console.log();
        // Create or update Facilities Admin
        const facilitiesAdmin = await Employee_1.default.findOneAndUpdate({ employeeId: 'FAC001' }, {
            $set: {
                employeeId: 'FAC001',
                name: 'Facilities Admin',
                email: facilitiesEmail,
                password: facilitiesHashedPassword,
                phone: '+91-9876543214',
                designation: 'Facilities Manager',
                department: 'Facilities',
                location: 'Hyderabad',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Facilities',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Facilities',
                dateOfBirth: '1988-09-20',
                dateOfJoining: '2017-08-05',
                businessUnit: 'Facilities',
                status: 'active',
                role: 'FACILITIES_ADMIN',
                hasLoginAccess: true,
                isActive: true,
            }
        }, { new: true, upsert: true });
        console.log('✅ Facilities Admin created/updated successfully!');
        console.log('  Employee ID:', facilitiesAdmin.employeeId);
        console.log('  Email:      ', facilitiesEmail);
        console.log('  Password:   ', facilitiesPassword);
        console.log('  Role:       ', facilitiesAdmin.role);
        console.log('  Department: ', facilitiesAdmin.department);
        console.log();
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📝 SUMMARY - New Admin Login Credentials:');
        console.log('═══════════════════════════════════════════════════════════');
        console.log();
        console.log('🏦 FINANCE ADMIN:');
        console.log('   Email:    finance@acuvate.com');
        console.log('   Password: Finance@123');
        console.log('   Role:     FINANCE_ADMIN');
        console.log();
        console.log('🏢 FACILITIES ADMIN:');
        console.log('   Email:    facilities@acuvate.com');
        console.log('   Password: Facilities@123');
        console.log('   Role:     FACILITIES_ADMIN');
        console.log();
        console.log('═══════════════════════════════════════════════════════════');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error creating admin users:', error);
        process.exit(1);
    }
}
createAdminUsers();
//# sourceMappingURL=createAdminUsers.js.map