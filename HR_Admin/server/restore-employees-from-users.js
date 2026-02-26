const mongoose = require('mongoose');

async function restoreEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🔄 Restoring original employee data from users collection...\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const employeesCollection = db.collection('employees');

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${users.length} users in the database`);

    // Clear current employees (the dummy data)
    const deleted = await employeesCollection.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} dummy employee records`);

    // Create employee records from users
    const employeeRecords = users.map(user => ({
      employeeId: user.employeeId,
      name: user.name,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.phone || '+1-555-0000',
      department: user.department,
      location: user.location || 'Not Specified',
      designation: user.designation || getRoleDesignation(user.role),
      role: user.role,
      status: user.status || 'active',
      dateOfBirth: user.dateOfBirth || getDefaultBirthday(user.employeeId),
      dateOfJoining: user.dateOfJoining || getDefaultJoiningDate(user.employeeId),
      hireType: user.hireType || 'Permanent',
      employmentType: user.employmentType || 'Full-Time',
      reportingManager: user.reportingManager,
      reportingManagerId: user.reportingManagerId,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    }));

    // Insert restored employees
    if (employeeRecords.length > 0) {
      const result = await employeesCollection.insertMany(employeeRecords);
      console.log(`✅ Successfully restored ${result.insertedCount} employees\n`);

      // Display restored employees
      console.log('📋 Restored Employees:');
      employeeRecords.forEach((emp, i) => {
        console.log(`${i + 1}. ${emp.employeeId}: ${emp.name}`);
        console.log(`   Email: ${emp.email}`);
        console.log(`   Department: ${emp.department}, Role: ${emp.role}`);
        console.log('');
      });
    }

    console.log('✅ Employee restoration complete!');

  } catch (error) {
    console.error('❌ Error restoring employees:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

function getRoleDesignation(role) {
  const designations = {
    'EMPLOYEE': 'Software Engineer',
    'RMG': 'Resource Manager',  
    'HR': 'HR Manager',
    'MANAGER': 'Engineering Manager',
    'IT_ADMIN': 'IT Administrator',
    'IT_EMPLOYEE': 'IT Support Specialist',
    'SUPER_ADMIN': 'System Administrator'
  };
  return designations[role] || 'Employee';
}

function getDefaultBirthday(employeeId) {
  // Generate a random birthday (for celebration purposes)
  const year = 1985 + Math.floor(Math.random() * 15);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

function getDefaultJoiningDate(employeeId) {
  // Generate a random joining date (1-10 years ago)
  const yearsAgo = 1 + Math.floor(Math.random() * 9);
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date;
}

// Run the restoration
restoreEmployees();
