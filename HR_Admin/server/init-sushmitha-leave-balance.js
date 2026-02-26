const mongoose = require('mongoose');
const LeaveBalance = require('./dist/models/LeaveBalance.js').default;

mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const employeeId = 'EMP010';
    const planName = 'Acuvate';
    
    // Check if balance already exists
    const existing = await LeaveBalance.findOne({ employeeId });
    if (existing) {
      console.log('✅ Leave balance already exists for EMP010');
      process.exit(0);
    }
    
    // Calculate quarterly accrual for Earned Leave
    const currentMonth = new Date().getMonth();
    const completedQuarters = Math.floor(currentMonth / 3);
    const earnedLeaveAccrued = completedQuarters * 5; // 5 days per quarter (Q1 = 5 days since Feb is in Q1)
    
    // Acuvate plan leave types (hardcoded from seed data)
    const leaveTypes = [
      {
        type: 'Earned Leave',
        allocated: 20,
        accrued: earnedLeaveAccrued,
        used: 0,
        pending: 0,
        available: earnedLeaveAccrued,
        carriedForward: 0
      },
      {
        type: 'Casual Leave',
        allocated: 12,
        accrued: 12,
        used: 0,
        pending: 0,
        available: 12,
        carriedForward: 0
      },
      {
        type: 'Sick Leave',
        allocated: 10,
        accrued: 10,
        used: 0,
        pending: 0,
        available: 10,
        carriedForward: 0
      },
      {
        type: 'Compensatory Off',
        allocated: 0,
        accrued: 0,
        used: 0,
        pending: 0,
        available: 0,
        carriedForward: 0
      },
      {
        type: 'Maternity Leave',
        allocated: 180,
        accrued: 180,
        used: 0,
        pending: 0,
        available: 180,
        carriedForward: 0
      },
      {
        type: 'Paternity Leave',
        allocated: 3,
        accrued: 3,
        used: 0,
        pending: 0,
        available: 3,
        carriedForward: 0
      }
    ];
    
    // Create leave balance
    const leaveBalance = new LeaveBalance({
      employeeId,
      leavePlan: planName,
      year: new Date().getFullYear(),
      leaveTypes
    });
    
    await leaveBalance.save();
    
    console.log('\n✅ Leave balance initialized for EMP010');
    console.log('Leave Plan:', planName);
    console.log('Leave Types:');
    leaveTypes.forEach(lt => {
      console.log(`  - ${lt.type}: ${lt.available} days available (Allocated: ${lt.allocated}, Accrued: ${lt.accrued})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
