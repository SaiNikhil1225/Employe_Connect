const mongoose = require('mongoose');
require('dotenv').config();

async function assignHRLeavePlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    const result = await db.collection('employees').updateOne(
      { employeeId: 'HR001' },
      {
        $set: {
          leavePlan: 'Acuvate',
          employmentType: 'Full Time'
        }
      }
    );

    console.log('✅ Updated HR employee (HR001) with Acuvate leave plan');
    console.log('   Modified:', result.modifiedCount, 'record');
    
    // Check the update
    const hr = await db.collection('employees').findOne({ employeeId: 'HR001' });
    console.log('\n📋 HR Employee Details:');
    console.log('   Email:', hr.email);
    console.log('   Leave Plan:', hr.leavePlan);
    console.log('   Employment Type:', hr.employmentType);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Go to: http://localhost:5173');
    console.log('   2. Login as HR admin');
    console.log('   3. Navigate to: Leave Management');
    console.log('   4. You will see:');
    console.log('      • Leave Plan Badge: "Acuvate Plan"');
    console.log('      • 9 Leave Balance Cards showing available days');
    console.log('      • Total days available badge');

    await mongoose.disconnect();
    console.log('\n✅ Done! Refresh your browser to see the changes.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignHRLeavePlan();
