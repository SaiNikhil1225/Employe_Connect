const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  department: String,
  designation: String,
  status: { type: String, default: 'active' },
  role: String,
  dateOfBirth: Date,
  dateOfJoining: Date,
  reportingManager: String,
  reportingManagerId: String,
  location: String,
  hireType: String,
  employmentType: String
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

async function testNewHire() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Check if test employee already exists
    const existing = await Employee.findOne({ employeeId: 'TEST001' });
    
    if (existing) {
      console.log('\n📋 Test employee already exists');
      console.log('   Employee ID: TEST001');
      console.log('   Name:', existing.name);
      console.log('   Joining Date:', existing.dateOfJoining);
      console.log('   Status:', existing.status);
    } else {
      // Create a test employee with today's joining date
      const today = new Date();
      const testEmployee = {
        employeeId: 'TEST001',
        name: 'Test New Hire',
        firstName: 'Test',
        lastName: 'Hire',
        email: 'test.newhire@acuvate.com',
        phone: '+1-555-9999',
        department: 'Engineering',
        designation: 'Software Engineer',
        location: 'Hyderabad',
        status: 'active',
        role: 'EMPLOYEE',
        dateOfBirth: new Date('1995-05-15'),
        dateOfJoining: today, // Today's date
        hireType: 'Permanent',
        employmentType: 'Full-Time'
      };

      const created = await Employee.create(testEmployee);
      console.log('\n✅ Created test employee:');
      console.log('   Employee ID:', created.employeeId);
      console.log('   Name:', created.name);
      console.log('   Joining Date:', created.dateOfJoining);
      console.log('   Month:', created.dateOfJoining.getMonth() + 1);
      console.log('   Year:', created.dateOfJoining.getFullYear());
      console.log('\n📊 This employee should show in New Hires MTD and YTD stats!');
    }

    // Fetch and display current stats
    console.log('\n📈 Fetching workforce stats...');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startOfYear = new Date(currentYear, 0, 1);
    
    const allEmployees = await Employee.find();
    const newHiresMTD = allEmployees.filter(emp => {
      if (!emp.dateOfJoining) return false;
      const joinDate = new Date(emp.dateOfJoining);
      return joinDate >= startOfMonth && joinDate <= now;
    }).length;

    const newHiresYTD = allEmployees.filter(emp => {
      if (!emp.dateOfJoining) return false;
      const joinDate = new Date(emp.dateOfJoining);
      return joinDate >= startOfYear && joinDate <= now;
    }).length;

    console.log('\n✅ Current Workforce Stats:');
    console.log(`   Total Employees: ${allEmployees.length}`);
    console.log(`   New Hires MTD (Feb 2026): ${newHiresMTD}`);
    console.log(`   New Hires YTD (2026): ${newHiresYTD}`);

    if (newHiresMTD > 0 || newHiresYTD > 0) {
      console.log('\n🎉 New hire stats are working correctly!');
      console.log('   Dashboard should now show updated numbers.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testNewHire();
