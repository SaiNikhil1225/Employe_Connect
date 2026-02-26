const mongoose = require('mongoose');
const LeaveBalance = require('./dist/models/LeaveBalance.js').default;

mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const employeeId = 'EMP010';
    
    // Get the leave balance
    const balance = await LeaveBalance.findOne({ employeeId });
    if (!balance) {
      console.log('❌ Leave balance not found for EMP010');
      process.exit(1);
    }
    
    console.log('Found balance:', JSON.stringify(balance, null, 2));
    
    // Update Earned Leave to 5 days (Q1 accrual)
    if (balance.leaveTypes && Array.isArray(balance.leaveTypes)) {
      const earnedLeaveIndex = balance.leaveTypes.findIndex(lt => lt.type === 'Earned Leave');
      if (earnedLeaveIndex !== -1) {
        balance.leaveTypes[earnedLeaveIndex].accrued = 5;
        balance.leaveTypes[earnedLeaveIndex].available = 5;
        
        await balance.save();
        
        console.log('\n✅ Leave balance updated for EMP010');
        console.log('Earned Leave: 5 days (Q1 accrual)');
        console.log('\nCurrent leave balances:');
        balance.leaveTypes.forEach(lt => {
          console.log(`  - ${lt.type}: ${lt.available} days available`);
        });
      } else {
        console.log('❌ Earned Leave not found in leave types');
      }
    } else {
      console.log('❌ leaveTypes is not an array or is undefined');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
