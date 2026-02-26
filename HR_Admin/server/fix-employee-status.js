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
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active'
  },
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

async function fixEmployeeStatus() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Get all employees
    const employees = await Employee.find();
    console.log(`\n📊 Found ${employees.length} employees in database`);

    // Show current status distribution
    const statusCounts = {};
    employees.forEach(emp => {
      statusCounts[emp.status] = (statusCounts[emp.status] || 0) + 1;
    });
    console.log('\n📈 Current status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Find employees with invalid status values
    const invalidStatuses = ['upcoming', 'Pending', 'present', 'remote', 'leave', 'processed'];
    const employeesToFix = employees.filter(emp => invalidStatuses.includes(emp.status));

    console.log(`\n🔧 Found ${employeesToFix.length} employees with invalid status values`);

    if (employeesToFix.length > 0) {
      // Update all invalid status to 'active'
      const result = await Employee.updateMany(
        { status: { $in: invalidStatuses } },
        { $set: { status: 'active' } }
      );

      console.log(`\n✅ Updated ${result.modifiedCount} employee status values to 'active'`);

      // Verify the fix
      const afterEmployees = await Employee.find();
      const afterStatusCounts = {};
      afterEmployees.forEach(emp => {
        afterStatusCounts[emp.status] = (afterStatusCounts[emp.status] || 0) + 1;
      });

      console.log('\n📈 Status distribution after fix:');
      Object.entries(afterStatusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('\n✅ All employee status values fixed!');
      console.log(`   Total employees with active status: ${afterStatusCounts.active || 0}`);
    } else {
      console.log('\n✅ All employees already have valid status values!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error fixing employee status:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixEmployeeStatus();
