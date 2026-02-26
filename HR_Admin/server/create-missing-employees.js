// Create missing employees: Sushmitha, Raghu, Praveen
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function createMissingEmployees() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    // Find the next available employee IDs
    const existingEmployees = await Employee.find({})
      .select('employeeId')
      .sort({ employeeId: -1 });
    
    const existingIds = new Set(existingEmployees.map(e => e.employeeId));
    
    function getNextEmployeeId(prefix = 'EMP') {
      let counter = 1;
      let newId;
      do {
        newId = `${prefix}${String(counter).padStart(3, '0')}`;
        counter++;
      } while (existingIds.has(newId));
      existingIds.add(newId);
      return newId;
    }

    function generatePAN() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const part1 = Array(5).fill(0).map(() => letters[Math.floor(Math.random() * 26)]).join('');
      const part2 = Array(4).fill(0).map(() => numbers[Math.floor(Math.random() * 10)]).join('');
      const part3 = letters[Math.floor(Math.random() * 26)];
      return `${part1}${part2}${part3}`;
    }

    // Create three new employees
    const employees = [
      {
        employeeId: getNextEmployeeId(),
        name: 'Sushmitha Kolisetty',
        email: 'sushmitha.kolisetty@acuvate.com',
        password: await bcrypt.hash('Sushmitha@123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Software Engineer',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2024-03-01',
        location: 'Hyderabad',
        panNumber: generatePAN(),
        phone: '9876543220'
      },
      {
        employeeId: getNextEmployeeId(),
        name: 'Raghu Krishna',
        email: 'raghu.krishna@acuvate.com',
        password: await bcrypt.hash('Raghu@123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Senior Software Engineer',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2023-06-15',
        location: 'Hyderabad',
        panNumber: generatePAN(),
        phone: '9876543221'
      },
      {
        employeeId: getNextEmployeeId(),
        name: 'Praveen Kumar',
        email: 'praveen.kumar@acuvate.com',
        password: await bcrypt.hash('Praveen@123', 10),
        role: 'EMPLOYEE',
        department: 'Engineering',
        designation: 'Tech Lead',
        hasLoginAccess: true,
        isActive: true,
        status: 'active',
        dateOfJoining: '2022-08-20',
        location: 'Hyderabad',
        panNumber: generatePAN(),
        phone: '9876543222'
      }
    ];

    console.log('👥 Creating employees...\n');
    
    for (const employee of employees) {
      // Check if already exists
      const existing = await Employee.findOne({ email: employee.email });
      if (existing) {
        console.log(`⚠️  Employee already exists: ${employee.email}`);
        continue;
      }

      await Employee.create(employee);
      console.log(`✅ Created: ${employee.employeeId} - ${employee.name} (${employee.email})`);
    }

    const finalCount = await Employee.countDocuments();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ EMPLOYEES CREATED SUCCESSFULLY');
    console.log('='.repeat(70));
    console.log(`\n📊 Total employees now: ${finalCount}`);
    console.log('\n📝 Login Credentials:');
    console.log('\n1️⃣  Sushmitha Kolisetty');
    console.log('   Email:    sushmitha.kolisetty@acuvate.com');
    console.log('   Password: Sushmitha@123');
    console.log('\n2️⃣  Raghu Krishna');
    console.log('   Email:    raghu.krishna@acuvate.com');
    console.log('   Password: Raghu@123');
    console.log('\n3️⃣  Praveen Kumar');
    console.log('   Email:    praveen.kumar@acuvate.com');
    console.log('   Password: Praveen@123');
    console.log('\n' + '='.repeat(70) + '\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createMissingEmployees();
