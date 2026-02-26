const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({}, { strict: false });
const Employee = mongoose.model('Employee', employeeSchema);

async function checkEmployeeGenderData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('Connected to MongoDB');

    // Get all active employees
    const employees = await Employee.find({ status: 'active' }, {
      employeeId: 1,
      name: 1,
      gender: 1,
      dateOfBirth: 1,
      dateOfJoining: 1,
      department: 1,
      designation: 1,
      role: 1
    });

    console.log(`\n=== Total Active Employees: ${employees.length} ===\n`);

    // Count by gender
    const genderCounts = {};
    employees.forEach(emp => {
      const gender = emp.gender || 'Not Set';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    console.log('Gender Distribution:');
    Object.entries(genderCounts).forEach(([gender, count]) => {
      console.log(`  ${gender}: ${count}`);
    });

    console.log('\n=== Sample Employees ===');
    employees.slice(0, 10).forEach((emp, i) => {
      console.log(`\n${i + 1}. ${emp.name || emp.employeeId}`);
      console.log(`   Employee ID: ${emp.employeeId}`);
      console.log(`   Gender: ${emp.gender || 'NOT SET'}`);
      console.log(`   DOB: ${emp.dateOfBirth || 'NOT SET'}`);
      console.log(`   Joining: ${emp.dateOfJoining || 'NOT SET'}`);
      console.log(`   Department: ${emp.department || 'NOT SET'}`);
      console.log(`   Role: ${emp.role || emp.designation || 'NOT SET'}`);
    });

    // Check for employees without gender
    const noGender = employees.filter(emp => !emp.gender || emp.gender === '');
    console.log(`\n=== Employees Without Gender: ${noGender.length} ===`);
    if (noGender.length > 0) {
      noGender.slice(0, 5).forEach(emp => {
        console.log(`  - ${emp.name || emp.employeeId}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEmployeeGenderData();
