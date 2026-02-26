const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

async function addGenderData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    // Get all active employees
    const employees = await Employee.find({ status: 'active' });
    console.log(`Found ${employees.length} active employees`);

    // Add gender based on name patterns (simple heuristic)
    const maleNames = ['alex', 'daniel', 'kevin', 'mohan', 'nikhil', 'john', 'david', 'michael', 'robert'];
    const femaleNames = ['rachel', 'jessica', 'sarah', 'emily', 'lisa', 'jennifer', 'michelle'];

    let updated = 0;
    for (const emp of employees) {
      const firstName = (emp.firstName || emp.name || '').toLowerCase().split(' ')[0];
      
      let gender = 'Male'; // Default

      // Determine gender based on name
      if (femaleNames.some(name => firstName.includes(name))) {
        gender = 'Female';
      } else if (!maleNames.some(name => firstName.includes(name))) {
        // For names we don't recognize, assign based on position (alternate)
        gender = updated % 3 === 0 ? 'Female' : 'Male';
      }

      // Update employee
      await Employee.updateOne(
        { _id: emp._id },
        { $set: { gender: gender } }
      );

      updated++;
      console.log(`${updated}. Updated ${emp.name || emp.employeeId} → ${gender}`);
    }

    console.log(`\n✅ Updated ${updated} employees with gender data`);

    // Verify the update
    const verification = await Employee.find({ status: 'active' }, { name: 1, employeeId: 1, gender: 1 });
    
    console.log('\n=== Verification - Gender Distribution ===');
    const counts = {
      Male: verification.filter(e => e.gender === 'Male').length,
      Female: verification.filter(e => e.gender === 'Female').length,
      Other: verification.filter(e => !e.gender || (e.gender !== 'Male' && e.gender !== 'Female')).length
    };
    
    console.log(`Male: ${counts.Male}`);
    console.log(`Female: ${counts.Female}`);
    console.log(`Not Set: ${counts.Other}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addGenderData();
