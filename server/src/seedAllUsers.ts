import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Employee from './models/Employee';
import connectDB from './config/database';

dotenv.config();

const allUsersData = [
  // Core System Users
  {
    name: 'Sai Nikhil Bomma',
    email: 'sainikhil.bomma@acuvate.com',
    password: 'Nikhil@123',
    role: 'EMPLOYEE',
    designation: 'Senior Developer',
    department: 'Engineering',
    employeeId: 'EMP001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2021-01-15',
    phone: '+91 9966513421',
    location: 'Hyderabad'
  },
  {
    name: 'HR Manager',
    email: 'hr@acuvate.com',
    password: 'Hr@123',
    role: 'HR',
    designation: 'HR Manager',
    department: 'Human Resources',
    employeeId: 'HR001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2020-03-10',
    phone: '+91 9876543210',
    location: 'Hyderabad'
  },
  {
    name: 'Mohan Reddy',
    email: 'mohan.reddy@acuvate.com',
    password: 'Mohan@123',
    role: 'RMG',
    designation: 'Resource Manager',
    department: 'RMG',
    employeeId: 'RMG001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2019-06-15',
    phone: '+91 9876543211',
    location: 'Hyderabad'
  },
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@acuvate.com',
    password: 'Rajesh@123',
    role: 'MANAGER',
    designation: 'Engineering Manager',
    department: 'Engineering',
    employeeId: 'MGR001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2018-05-20',
    phone: '+91 9876543212',
    location: 'Hyderabad'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@acuvate.com',
    password: 'Priya@123',
    role: 'IT_ADMIN',
    designation: 'IT Support Manager',
    department: 'IT Support',
    employeeId: 'IT001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2020-08-12',
    phone: '+91 9876543213',
    location: 'Hyderabad'
  },
  {
    name: 'Super Admin',
    email: 'superadmin@acuvate.com',
    password: 'SuperAdmin@123',
    role: 'SUPER_ADMIN',
    designation: 'System Administrator',
    department: 'Management',
    employeeId: 'ADMIN001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2018-01-01',
    phone: '+91 9876543214',
    location: 'Hyderabad'
  },

  // Approvers
  {
    name: 'L1 Approver',
    email: 'l1.approver@company.com',
    password: 'L1Approver@123',
    role: 'L1_APPROVER',
    designation: 'Team Lead',
    department: 'Management',
    employeeId: 'L1001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2024-01-01',
    phone: '+1-555-0101',
    location: 'Headquarters'
  },
  {
    name: 'L2 Approver',
    email: 'l2.approver@company.com',
    password: 'L2Approver@123',
    role: 'L2_APPROVER',
    designation: 'Manager',
    department: 'Management',
    employeeId: 'L2001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2024-01-01',
    phone: '+1-555-0201',
    location: 'Headquarters'
  },
  {
    name: 'L3 Approver',
    email: 'l3.approver@company.com',
    password: 'L3Approver@123',
    role: 'L3_APPROVER',
    designation: 'Director',
    department: 'Management',
    employeeId: 'L3001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2024-01-01',
    phone: '+1-555-0301',
    location: 'Headquarters'
  },

  // IT Employees
  {
    name: 'Emily Chen',
    email: 'emily.chen@company.com',
    password: 'Emily@123',
    role: 'IT_EMPLOYEE',
    designation: 'Software Support Engineer',
    department: 'IT Support',
    employeeId: 'IT003',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-03-15',
    phone: '+1234567802',
    location: 'Office'
  },
  {
    name: 'Lisa Martinez',
    email: 'lisa.martinez@company.com',
    password: 'Lisa@123',
    role: 'IT_EMPLOYEE',
    designation: 'IT Support Specialist',
    department: 'IT Support',
    employeeId: 'IT007',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-06-20',
    phone: '+1234567806',
    location: 'Office'
  },
  {
    name: 'David Smith',
    email: 'david.smith@company.com',
    password: 'David@123',
    role: 'IT_EMPLOYEE',
    designation: 'Hardware Support Specialist',
    department: 'IT Support',
    employeeId: 'IT002',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-02-10',
    phone: '+1234567801',
    location: 'Office'
  },
  {
    name: 'Michael Johnson',
    email: 'michael.johnson@company.com',
    password: 'Michael@123',
    role: 'IT_EMPLOYEE',
    designation: 'Network Administrator',
    department: 'IT Support',
    employeeId: 'IT004',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-04-05',
    phone: '+1234567803',
    location: 'Office'
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@company.com',
    password: 'Sarah@123',
    role: 'IT_EMPLOYEE',
    designation: 'Security Analyst',
    department: 'IT Support',
    employeeId: 'IT005',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-05-12',
    phone: '+1234567804',
    location: 'Office'
  },
  {
    name: 'James Anderson',
    email: 'james.anderson@company.com',
    password: 'James@123',
    role: 'IT_EMPLOYEE',
    designation: 'Systems Engineer',
    department: 'IT Support',
    employeeId: 'IT006',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-07-18',
    phone: '+1234567805',
    location: 'Office'
  },
  {
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    password: 'Robert@123',
    role: 'IT_EMPLOYEE',
    designation: 'DevOps Engineer',
    department: 'IT Support',
    employeeId: 'IT008',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-08-22',
    phone: '+1234567807',
    location: 'Office'
  },
  {
    name: 'Jennifer Brown',
    email: 'jennifer.brown@company.com',
    password: 'Jennifer@123',
    role: 'IT_EMPLOYEE',
    designation: 'Database Administrator',
    department: 'IT Support',
    employeeId: 'IT009',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-09-10',
    phone: '+1234567808',
    location: 'Office'
  },
  {
    name: 'William Davis',
    email: 'william.davis@company.com',
    password: 'William@123',
    role: 'IT_EMPLOYEE',
    designation: 'Cloud Engineer',
    department: 'IT Support',
    employeeId: 'IT010',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-10-15',
    phone: '+1234567809',
    location: 'Office'
  },
  {
    name: 'Amanda Wilson',
    email: 'amanda.wilson@company.com',
    password: 'Amanda@123',
    role: 'IT_EMPLOYEE',
    designation: 'Application Support Specialist',
    department: 'IT Support',
    employeeId: 'IT011',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2022-11-20',
    phone: '+1234567810',
    location: 'Office'
  },

  // Finance Specialists
  {
    name: 'Rajesh Kumar',
    email: 'finance.specialist1@acuvate.com',
    password: 'Finance@123',
    role: 'FINANCE_SPECIALIST',
    designation: 'Finance Specialist',
    department: 'Finance',
    employeeId: 'FINS001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2021-04-01',
    phone: '+91 9876543220',
    location: 'Hyderabad'
  },
  {
    name: 'Priya Sharma',
    email: 'finance.specialist2@acuvate.com',
    password: 'Finance@123',
    role: 'FINANCE_SPECIALIST',
    designation: 'Finance Specialist',
    department: 'Finance',
    employeeId: 'FINS002',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2021-05-15',
    phone: '+91 9876543221',
    location: 'Hyderabad'
  },

  // Facilities Specialists
  {
    name: 'Arun Reddy',
    email: 'facilities.specialist1@acuvate.com',
    password: 'Facilities@123',
    role: 'FACILITIES_SPECIALIST',
    designation: 'Facilities Specialist',
    department: 'Facilities',
    employeeId: 'FACS001',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2021-06-01',
    phone: '+91 9876543222',
    location: 'Hyderabad'
  },
  {
    name: 'Meena Patel',
    email: 'facilities.specialist2@acuvate.com',
    password: 'Facilities@123',
    role: 'FACILITIES_SPECIALIST',
    designation: 'Facilities Specialist',
    department: 'Facilities',
    employeeId: 'FACS002',
    isActive: true,
    hasLoginAccess: true,
    status: 'active',
    dateOfJoining: '2021-07-15',
    phone: '+91 9876543223',
    location: 'Hyderabad'
  }
];

async function seedAllUsers() {
  try {
    await connectDB();

    console.log('🌱 Seeding All System Users...');

    // Remove existing users with these emails
    const emails = allUsersData.map(u => u.email);
    await Employee.deleteMany({ email: { $in: emails } });
    console.log('✅ Cleared existing user records');

    // Hash passwords and insert users
    const users = await Promise.all(
      allUsersData.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await Employee.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} user employees`);

    // Group by role for summary
    const byRole = allUsersData.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Users Summary by Role:');
    console.log('─'.repeat(60));
    Object.entries(byRole).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} user(s)`);
    });
    console.log('─'.repeat(60));

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📝 Sample Login Credentials:');
    console.log('  Employee: sainikhil.bomma@acuvate.com / Nikhil@123');
    console.log('  HR: hr@acuvate.com / Hr@123');
    console.log('  RMG: mohan.reddy@acuvate.com / Mohan@123');
    console.log('  Manager: rajesh.kumar@acuvate.com / Rajesh@123');
    console.log('  IT Admin: priya.sharma@acuvate.com / Priya@123');
    console.log('  Super Admin: superadmin@acuvate.com / SuperAdmin@123');
    console.log('\n  L1 Approver: l1.approver@company.com / L1Approver@123');
    console.log('  L2 Approver: l2.approver@company.com / L2Approver@123');
    console.log('  L3 Approver: l3.approver@company.com / L3Approver@123');
    console.log('\n  IT Employee: emily.chen@company.com / Emily@123');
    console.log('  Finance: finance.specialist1@acuvate.com / Finance@123');
    console.log('  Facilities: facilities.specialist1@acuvate.com / Facilities@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedAllUsers();
