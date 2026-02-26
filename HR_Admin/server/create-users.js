// Create the three main users for login
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function createUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    // Create three main users
    const users = [
      {
        employeeId: 'HR001',
        name: 'HR Admin',
        email: 'hr@acuvate.com',
        password: await bcrypt.hash('Hr@123', 10),
        role: 'HR',
        department: 'Human Resources',
        designation: 'HR Manager',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2024-01-01',
        location: 'Hyderabad',
        panNumber: 'AAAAA0001A',
        phone: '9876543210'
      },
      {
        employeeId: 'EMP001',
        name: 'Sai Nikhil Bomma',
        email: 'sainikhil.bomma@acuvate.com',
        password: await bcrypt.hash('Nikhil@123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Software Engineer',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2024-02-01',
        location: 'Hyderabad',
        panNumber: 'BBBBB0002B',
        phone: '9876543211'
      },
      {
        employeeId: 'RMG001',
        name: 'Mohan Reddy',
        email: 'mohan.reddy@acuvate.com',
        password: await bcrypt.hash('Mohan@123', 10),
        role: 'RMG',
        department: 'Resource Management',
        designation: 'Resource Manager',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2024-01-15',
        location: 'Hyderabad',
        panNumber: 'CCCCC0003C',
        phone: '9876543212'
      }
    ];

    console.log('👥 Creating users...');
    
    for (const user of users) {
      // Check if user already exists
      const existing = await Employee.findOne({ email: user.email });
      if (existing) {
        console.log(`⚠️  User already exists: ${user.email}`);
        // Update the user with login access
        await Employee.updateOne(
          { email: user.email },
          { 
            $set: { 
              hasLoginAccess: true,
              isActive: true,
              password: user.password
            }
          }
        );
        console.log(`✅ Updated login access for: ${user.email}`);
      } else {
        await Employee.create(user);
        console.log(`✅ Created user: ${user.email} (${user.name})`);
      }
    }

    console.log('\n✅ All users created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('  HR Account:');
    console.log('    Email: hr@acuvate.com');
    console.log('    Password: Hr@123');
    console.log('\n  Employee Account:');
    console.log('    Email: sainikhil.bomma@acuvate.com');
    console.log('    Password: Nikhil@123');
    console.log('\n  RMG Account:');
    console.log('    Email: mohan.reddy@acuvate.com');
    console.log('    Password: Mohan@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createUsers();
