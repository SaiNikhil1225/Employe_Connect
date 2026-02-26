// Search for employees with specific names
const mongoose = require('mongoose');

async function searchEmployees() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');

    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));

    const totalCount = await Employee.countDocuments();
    console.log(`📊 Total employees in database: ${totalCount}\n`);

    // Search for specific names
    const names = ['sushmitha', 'raghu', 'praveen', 'kolisetty', 'sushmi'];
    
    console.log('🔍 Searching for employees with names: sushmitha, raghu, praveen...\n');
    
    for (const searchName of names) {
      const regex = new RegExp(searchName, 'i');
      const results = await Employee.find({
        $or: [
          { name: regex },
          { email: regex },
          { firstName: regex },
          { lastName: regex }
        ]
      }).select('employeeId name email department designation');
      
      if (results.length > 0) {
        console.log(`✅ Found ${results.length} match(es) for "${searchName}":`);
        results.forEach(emp => {
          console.log(`   • ${emp.employeeId} - ${emp.name} (${emp.email}) - ${emp.department || 'No Dept'}`);
        });
        console.log('');
      } else {
        console.log(`❌ No matches found for "${searchName}"\n`);
      }
    }

    // List all employees
    console.log('📋 All employees in database:');
    console.log('='.repeat(80));
    const allEmployees = await Employee.find({})
      .select('employeeId name email department')
      .sort({ employeeId: 1 });
    
    allEmployees.forEach(emp => {
      console.log(`${emp.employeeId?.padEnd(10)} | ${(emp.name || 'NO NAME').padEnd(30)} | ${(emp.email || 'NO EMAIL').padEnd(35)} | ${emp.department || 'No Dept'}`);
    });

    console.log('='.repeat(80));
    console.log(`\nTotal: ${allEmployees.length} employees\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

searchEmployees();
