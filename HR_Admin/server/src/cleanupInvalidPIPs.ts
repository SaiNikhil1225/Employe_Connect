import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PIP from './models/PIP';
import Employee from './models/Employee';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

async function cleanupInvalidPIPs() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all PIPs
    const allPIPs = await PIP.find();
    console.log(`📊 Found ${allPIPs.length} total PIP records`);

    let deletedCount = 0;
    let validCount = 0;

    for (const pip of allPIPs) {
      // Check if employee exists
      const employee = await Employee.findOne({ employeeId: pip.employeeId });
      
      if (!employee) {
        console.log(`❌ Deleting PIP ${pip.pipNumber} - Employee ${pip.employeeId} not found`);
        await PIP.deleteOne({ _id: pip._id });
        deletedCount++;
      } else if (!pip.pipNumber) {
        console.log(`❌ Deleting invalid PIP record for ${pip.employeeId} - Missing PIP number`);
        await PIP.deleteOne({ _id: pip._id });
        deletedCount++;
      } else {
        validCount++;
        console.log(`✅ Valid PIP: ${pip.pipNumber} for ${pip.employeeName} (${pip.employeeId}) - Status: ${pip.status}`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Valid PIPs: ${validCount}`);
    console.log(`   ❌ Deleted invalid PIPs: ${deletedCount}`);
    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run cleanup
cleanupInvalidPIPs();
