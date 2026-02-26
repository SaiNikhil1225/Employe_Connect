import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rmg-portal';

const LeaveBalanceSchema = new mongoose.Schema({}, { strict: false, collection: 'leavebalances' });
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);

async function quickCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Checking first 5 leave balances:\n');
    
    const balances = await LeaveBalance.find({}).limit(5);
    balances.forEach((bal: any, idx: number) => {
      console.log(`${idx + 1}. Employee ID: ${bal.employeeId}`);
      if (bal.leaveTypes && bal.leaveTypes.length > 0) {
        bal.leaveTypes.forEach((lt: any) => {
          console.log(`   - ${lt.type}: Allocated=${lt.allocated}, Used=${lt.used}, Available=${lt.available}`);
        });
      } else {
        console.log('   - No leave types configured');
      }
      console.log('');
    });
    
    const totalBalances = await LeaveBalance.countDocuments({});
    const balancesWithTypes = await LeaveBalance.countDocuments({ 
      leaveTypes: { $exists: true, $ne: [], $not: { $size: 0 } } 
    });
    
    console.log(`\nSummary:`);
    console.log(`  Total leave balances: ${totalBalances}`);
    console.log(`  With configured types: ${balancesWithTypes}`);
    console.log(`  Without types: ${totalBalances - balancesWithTypes}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickCheck();
