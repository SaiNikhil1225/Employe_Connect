// Script to assign leave plans to existing employees who don't have one
const mongoose = require('mongoose');
require('dotenv').config();

async function assignLeavePlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Find employees without a leave plan
    const employeesWithoutPlan = await db.collection('employees').find({
      $or: [
        { leavePlan: { $exists: false } },
        { leavePlan: null },
        { leavePlan: '' }
      ]
    }).toArray();
    
    console.log(`Found ${employeesWithoutPlan.length} employees without leave plans\n`);
    
    if (employeesWithoutPlan.length === 0) {
      console.log('✅ All employees already have leave plans assigned!');
      return;
    }
    
    let updated = 0;
    
    for (const emp of employeesWithoutPlan) {
      let leavePlan = 'Acuvate'; // Default
      
      // Assign based on employment type or status
      if (emp.employmentType === 'Consultant' || emp.workerType === 'Consultant') {
        leavePlan = 'Consultant';
      } else if (emp.status === 'Confirmed' || emp.confirmationDate) {
        leavePlan = 'Confirmation';
      } else if (emp.employmentType === 'Probation' || emp.status === 'Probation') {
        leavePlan = 'Probation';
      } else if (emp.location && emp.location.includes('UK')) {
        leavePlan = 'UK';
      }
      
      await db.collection('employees').updateOne(
        { _id: emp._id },
        { $set: { leavePlan: leavePlan } }
      );
      
      console.log(`✅ ${emp.firstName || emp.name} ${emp.lastName || ''} (${emp.employeeId}) → ${leavePlan} Plan`);
      updated++;
    }
    
    console.log(`\n✅ Successfully assigned leave plans to ${updated} employees`);
    
    // Show summary
    const summary = await db.collection('employees').aggregate([
      {
        $group: {
          _id: '$leavePlan',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('\n📊 Leave Plan Distribution:');
    summary.forEach(item => {
      console.log(`   ${item._id || 'No Plan'}: ${item.count} employees`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

assignLeavePlans();
