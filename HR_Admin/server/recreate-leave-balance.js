const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Delete old leave balance
    const result = await mongoose.connection.db.collection('leavebalances').deleteOne({ employeeId: 'EMP010' });
    console.log('✅ Deleted old leave balance:', result.deletedCount, 'document(s)');
    
    // Create new leave balance with correct structure
    const leaveBalance = {
      employeeId: 'EMP010',
      year: 2026,
      leavePlan: 'Acuvate',
      leaveTypes: [
        {
          type: 'Earned Leave',
          allocated: 20,
          accrued: 5,        // Q1 accrual (5 days per quarter)
          used: 0,
          pending: 0,
          available: 5,
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
      ],
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const inserted = await mongoose.connection.db.collection('leavebalances').insertOne(leaveBalance);
    console.log('\n✅ Created new leave balance with correct structure');
    console.log('Leave Plan: Acuvate');
    console.log('Leave Types:');
    leaveBalance.leaveTypes.forEach(lt => {
      console.log(`  - ${lt.type}: ${lt.available} days available (Allocated: ${lt.allocated})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
