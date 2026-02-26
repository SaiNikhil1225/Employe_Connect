import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Employee from './models/Employee';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const hiringUsers = [
  {
    employeeId: 'HM001',
    name: 'Alex Martinez',
    email: 'hiring.manager@company.com',
    password: 'HiringManager@123',
    role: 'MANAGER',
    department: 'Engineering',
    designation: 'Engineering Manager',
    phone: '+1234567801',
    location: 'New York',
    dateOfJoining: '2020-03-15',
    businessUnit: 'Engineering',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    status: 'active',
    isActive: true,
    hasLoginAccess: true,
    dateOfBirth: '1987-06-20'
  },
  {
    employeeId: 'HM002',
    name: 'Rachel Thompson',
    email: 'hiring.manager2@company.com',
    password: 'HiringManager@123',
    role: 'MANAGER',
    department: 'Marketing',
    designation: 'Marketing Manager',
    phone: '+1234567802',
    location: 'San Francisco',
    dateOfJoining: '2019-08-10',
    businessUnit: 'Marketing',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    status: 'active',
    isActive: true,
    hasLoginAccess: true,
    dateOfBirth: '1989-11-15'
  },
  {
    employeeId: 'HM003',
    name: 'Daniel Kim',
    email: 'hiring.manager3@company.com',
    password: 'HiringManager@123',
    role: 'MANAGER',
    department: 'Sales',
    designation: 'Sales Manager',
    phone: '+1234567803',
    location: 'Chicago',
    dateOfJoining: '2021-01-20',
    businessUnit: 'Sales',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    status: 'active',
    isActive: true,
    hasLoginAccess: true,
    dateOfBirth: '1990-04-08'
  },
  {
    employeeId: 'HR002',
    name: 'Jessica Williams',
    email: 'hr.recruiter@company.com',
    password: 'HRRecruiter@123',
    role: 'HR',
    department: 'Human Resources',
    designation: 'HR Recruiter',
    phone: '+1234567804',
    location: 'New York',
    dateOfJoining: '2018-05-12',
    businessUnit: 'Human Resources',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    status: 'active',
    isActive: true,
    hasLoginAccess: true,
    dateOfBirth: '1988-09-25'
  },
  {
    employeeId: 'HR003',
    name: 'Kevin Brown',
    email: 'hr.talent@company.com',
    password: 'HRTalent@123',
    role: 'HR',
    department: 'Human Resources',
    designation: 'Talent Acquisition Manager',
    phone: '+1234567805',
    location: 'Austin',
    dateOfJoining: '2017-11-05',
    businessUnit: 'Human Resources',
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
    status: 'active',
    isActive: true,
    hasLoginAccess: true,
    dateOfBirth: '1986-03-14'
  }
];

async function seedHiringUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🌱 Seeding Hiring Module Users...\n');

    for (const userData of hiringUsers) {
      // Check if user already exists
      const existingUser = await Employee.findOne({ 
        $or: [
          { email: userData.email },
          { employeeId: userData.employeeId }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.name} (${userData.email})`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new employee
      const employee = new Employee({
        ...userData,
        password: hashedPassword
      });

      await employee.save();
      console.log(`✅ Created: ${userData.name} (${userData.role})`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Employee ID: ${userData.employeeId}\n`);
    }

    console.log('\n🎉 Hiring Module Users Seeded Successfully!\n');
    console.log('📋 Login Credentials Summary:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HIRING MANAGERS (Can create hiring requests):\n');
    console.log('1. Alex Martinez (Engineering)');
    console.log('   Email: hiring.manager@company.com');
    console.log('   Password: HiringManager@123\n');
    
    console.log('2. Rachel Thompson (Marketing)');
    console.log('   Email: hiring.manager2@company.com');
    console.log('   Password: HiringManager@123\n');
    
    console.log('3. Daniel Kim (Sales)');
    console.log('   Email: hiring.manager3@company.com');
    console.log('   Password: HiringManager@123\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HR TEAM (Can manage all hiring requests):\n');
    console.log('4. Jessica Williams (HR Recruiter)');
    console.log('   Email: hr.recruiter@company.com');
    console.log('   Password: HRRecruiter@123\n');
    
    console.log('5. Kevin Brown (Talent Acquisition Manager)');
    console.log('   Email: hr.talent@company.com');
    console.log('   Password: HRTalent@123\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedHiringUsers();
