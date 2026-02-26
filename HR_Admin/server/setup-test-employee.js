// Quick script to set up a test employee with leave plan
const mongoose = require('mongoose');
require('dotenv').config();

async function setupTestEmployee() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Find first employee
    const employee = await db.collection('employees').findOne({});
    
    if (!employee) {
      console.log('❌ No employees found in database');
      return;
    }

    console.log(`\n📋 Found employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
    
    // Update with leave plan
    const result = await db.collection('employees').updateOne(
      { _id: employee._id },
      {
        $set: {
          leavePlan: 'Acuvate',
          employmentType: 'Full Time'
        }
      }
    );

    console.log(`✅ Updated employee with Acuvate leave plan`);
    console.log(`\n🎯 Login Credentials:`);
    console.log(`   Employee ID: ${employee.employeeId}`);
    console.log(`   Email: ${employee.email}`);
    console.log(`\n📊 Leave Plan: Acuvate`);
    console.log(`   - Earned Leave: 20 days/year`);
    console.log(`   - Casual Leave: 12 days/year`);
    console.log(`   - Sick Leave: 10 days/year`);
    console.log(`   - Plus: Maternity, Paternity, Marriage, Bereavement`);
    
    console.log(`\n🚀 Next Steps:`);
    console.log(`   1. Start backend: cd server && npm run dev`);
    console.log(`   2. Start frontend: npm run dev`);
    console.log(`   3. Login with employee email: ${employee.email}`);
    console.log(`   4. Navigate to Leave Management page`);
    console.log(`   5. You'll see all available leave types with balances!`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

setupTestEmployee();
