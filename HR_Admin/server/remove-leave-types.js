const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function removeLeaveTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Step 1: Remove the three leave types from Acuvate plan
    const updateResult = await db.collection('leaveplans').updateOne(
      { planName: 'Acuvate' },
      {
        $pull: {
          leaveTypes: {
            type: { $in: ['Bereavement Leave', 'Marriage Leave', 'Loss of Pay'] }
          }
        }
      }
    );

    console.log(`\n📋 Updated Leave Plan:`);
    console.log(`   Modified: ${updateResult.modifiedCount} plan(s)`);

    // Step 2: Verify remaining leave types
    const updatedPlan = await db.collection('leaveplans').findOne({ planName: 'Acuvate' });
    
    if (updatedPlan) {
      console.log(`\n✅ Acuvate Plan - Remaining Leave Types (${updatedPlan.leaveTypes.length}):`);
      updatedPlan.leaveTypes.forEach((lt, index) => {
        console.log(`   ${index + 1}. ${lt.type} - ${lt.annualAllocation} days/year (${lt.accrualType})`);
      });
    }

    // Step 3: Clear existing leave balances to force recalculation
    const deleteResult = await db.collection('leavebalances').deleteMany({
      leavePlan: 'Acuvate',
      year: 2026
    });

    console.log(`\n🗑️  Cleared Leave Balances:`);
    console.log(`   Deleted: ${deleteResult.deletedCount} balance record(s) for Acuvate plan`);

    console.log(`\n✅ Leave types removed successfully!`);
    console.log(`\n📌 Next Steps:`);
    console.log(`   1. Refresh your browser`);
    console.log(`   2. Navigate to Leave Management page`);
    console.log(`   3. You'll see only 6 leave type cards displayed in a neat grid`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

removeLeaveTypes();
