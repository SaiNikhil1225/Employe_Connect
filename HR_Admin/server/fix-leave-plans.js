// Script to fix leave plans that might have undefined or missing leaveTypes
const mongoose = require('mongoose');
require('dotenv').config();

async function fixLeavePlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Find all leave plans
    const plans = await db.collection('leaveplans').find({}).toArray();
    console.log(`Found ${plans.length} leave plans`);
    
    let fixed = 0;
    
    for (const plan of plans) {
      // Check if leaveTypes is missing or undefined
      if (!plan.leaveTypes || !Array.isArray(plan.leaveTypes)) {
        console.log(`Fixing plan: ${plan.planName} - leaveTypes was ${plan.leaveTypes === undefined ? 'undefined' : typeof plan.leaveTypes}`);
        
        await db.collection('leaveplans').updateOne(
          { _id: plan._id },
          { $set: { leaveTypes: [] } }
        );
        
        fixed++;
      } else {
        console.log(`✅ Plan ${plan.planName} has ${plan.leaveTypes.length} leave types`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixed} leave plans`);
    console.log('All leave plans now have leaveTypes as an array');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixLeavePlans();
