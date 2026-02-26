const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function updateQuarterlyAccrual() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Step 1: Update the Acuvate leave plan to use quarterly accrual for Earned Leave
    const updateResult = await db.collection('leaveplans').updateOne(
      { 
        planName: 'Acuvate',
        'leaveTypes.type': 'Earned Leave'
      },
      {
        $set: {
          'leaveTypes.$.accrualType': 'quarterly',
          'leaveTypes.$.accrualRate': 5
        }
      }
    );

    console.log(`\n📋 Updated Leave Plan:`);
    console.log(`   Modified: ${updateResult.modifiedCount} plan(s)`);

    // Step 2: Verify the update
    const updatedPlan = await db.collection('leaveplans').findOne({ planName: 'Acuvate' });
    const earnedLeave = updatedPlan?.leaveTypes?.find(lt => lt.type === 'Earned Leave');
    
    if (earnedLeave) {
      console.log(`\n✅ Earned Leave Configuration:`);
      console.log(`   Annual Allocation: ${earnedLeave.annualAllocation} days`);
      console.log(`   Accrual Type: ${earnedLeave.accrualType}`);
      console.log(`   Accrual Rate: ${earnedLeave.accrualRate} days per quarter`);
    }

    // Step 3: Clear existing leave balances to force recalculation
    const deleteResult = await db.collection('leavebalances').deleteMany({
      leavePlan: 'Acuvate',
      year: 2026
    });

    console.log(`\n🗑️  Cleared Leave Balances:`);
    console.log(`   Deleted: ${deleteResult.deletedCount} balance record(s)`);

    // Step 4: Calculate current quarter accrual
    const now = new Date();
    const month = now.getMonth(); // 0-11
    let currentQuarter = 1;
    let accruedDays = 5;
    
    if (month >= 0 && month <= 2) {
      currentQuarter = 1;
      accruedDays = 5;
    } else if (month >= 3 && month <= 5) {
      currentQuarter = 2;
      accruedDays = 10;
    } else if (month >= 6 && month <= 8) {
      currentQuarter = 3;
      accruedDays = 15;
    } else {
      currentQuarter = 4;
      accruedDays = 20;
    }

    console.log(`\n📅 Current Accrual Status (as of ${now.toLocaleDateString()}):`);
    console.log(`   Current Quarter: Q${currentQuarter}`);
    console.log(`   Earned Leave Accrued: ${accruedDays} days`);
    console.log(`   Remaining Quarters: ${4 - currentQuarter}`);
    console.log(`   Days to Accrue: ${20 - accruedDays} days`);

    console.log(`\n✅ Quarterly accrual setup complete!`);
    console.log(`\n📌 Next Steps:`);
    console.log(`   1. Refresh your browser`);
    console.log(`   2. Navigate to Leave Management page`);
    console.log(`   3. You'll see Earned Leave showing ${accruedDays} days accrued (Q${currentQuarter})`);
    console.log(`   4. Each quarter, 5 more days will accrue automatically`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

updateQuarterlyAccrual();
