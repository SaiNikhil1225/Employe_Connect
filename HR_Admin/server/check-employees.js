// Check what employees exist in the database
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function checkEmployees() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    const count = await Employee.countDocuments();
    console.log(`📊 Total employees in database: ${count}`);

    if (count > 0) {
      const employees = await Employee.find({}).select('employeeId name email role hasLoginAccess isActive').limit(10);
      console.log('\n📝 First 10 employees:');
      employees.forEach(emp => {
        console.log(`  - ${emp.email || 'NO EMAIL'} (${emp.name}) - Role: ${emp.role}, Login: ${emp.hasLoginAccess}, Active: ${emp.isActive}`);
      });

      // Check for users with role HR, RMG
      const adminUsers = await Employee.find({ role: { $in: ['HR', 'RMG', 'MANAGER'] } }).select('email name role hasLoginAccess');
      console.log(`\n👥 Admin users (HR/RMG/MANAGER): ${adminUsers.length}`);
      adminUsers.forEach(emp => {
        console.log(`  - ${emp.email} (${emp.name}) - ${emp.role}, Login Access: ${emp.hasLoginAccess}`);
      });
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEmployees();
