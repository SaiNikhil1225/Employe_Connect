const mongoose = require('mongoose');
const Employee = require('./dist/models/Employee.js').default;

mongoose.connect('mongodb://localhost:27017/rmg-portal')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check for sushmitha@acuvate.com
    const user = await Employee.findOne({ email: 'sushmitha@acuvate.com' });
    
    if (user) {
      console.log('\n✅ User found:');
      console.log('Employee ID:', user.employeeId);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Department:', user.department);
      console.log('Has password:', !!user.password);
      console.log('Leave Plan:', user.leavePlan);
    } else {
      console.log('\n❌ User not found with email: sushmitha@acuvate.com');
      
      // Check all users to see what exists
      const allUsers = await Employee.find({}, 'employeeId email firstName lastName role').limit(10);
      console.log('\n📋 Available users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.employeeId}: ${u.email} (${u.firstName} ${u.lastName}) - ${u.role}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
