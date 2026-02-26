const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

async function fixGenderData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    // Fix specific employees with incorrect gender
    const corrections = [
      { name: /amanda/i, gender: 'Female' },
      { name: /sushmitha/i, gender: 'Female' },
      { name: /patricia/i, gender: 'Female' },
      { name: /raghu/i, gender: 'Male' },
    ];

    console.log('Fixing incorrect gender assignments...\n');

    for (const correction of corrections) {
      const result = await Employee.updateMany(
        { name: correction.name, status: 'active' },
        { $set: { gender: correction.gender } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✓ Fixed ${result.modifiedCount} employee(s) matching "${correction.name.source}" → ${correction.gender}`);
      }
    }

    // Verify the final distribution
    const employees = await Employee.find({ status: 'active' }, { name: 1, gender: 1 });
    
    console.log('\n=== Final Gender Distribution ===');
    const counts = {
      Male: employees.filter(e => e.gender === 'Male').length,
      Female: employees.filter(e => e.gender === 'Female').length
    };
    
    console.log(`Male: ${counts.Male} (${((counts.Male / employees.length) * 100).toFixed(1)}%)`);
    console.log(`Female: ${counts.Female} (${((counts.Female / employees.length) * 100).toFixed(1)}%)`);
    console.log(`Total: ${employees.length}`);

    console.log('\n=== Sample of employees ===');
    employees.slice(0, 10).forEach(emp => {
      console.log(`  ${emp.gender === 'Male' ? '👨' : '👩'} ${emp.name || 'Unknown'} - ${emp.gender}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Gender data fixed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixGenderData();
