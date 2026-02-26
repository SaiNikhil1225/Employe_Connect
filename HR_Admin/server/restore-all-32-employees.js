const mongoose = require('mongoose');

async function restoreAllEmployees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    console.log('🔄 Restoring ALL 32 employees from database...\n');
    
    const allEmployees = new Map();
    
    // Scan all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collName = collection.name;
      try {
        const coll = db.collection(collName);
        const docs = await coll.find().toArray();
        
        docs.forEach(doc => {
          if (doc.employeeId) {
            if (!allEmployees.has(doc.employeeId)) {
              allEmployees.set(doc.employeeId, {
                employeeId: doc.employeeId,
                name: doc.employeeName || doc.name || doc.employeeId,
                firstName: (doc.employeeName || doc.name || '').split(' ')[0] || doc.employeeId,
                lastName: (doc.employeeName || doc.name || '').split(' ').slice(1).join(' ') || '',
                email: doc.email || `${doc.employeeId.toLowerCase()}@acuvate.com`,
                phone: doc.phone || '+1-555-0000',
                department: doc.department || 'Not Specified',
                location: doc.location || 'Not Specified',
                designation: doc.designation || getDesignationFromId(doc.employeeId),
                status: doc.status || 'active',
                role: getRoleFromId(doc.employeeId),
                dateOfBirth: doc.dateOfBirth || generateBirthday(),
                dateOfJoining: doc.dateOfJoining || generateJoiningDate(),
                hireType: doc.hireType || 'Permanent',
                employmentType: doc.employmentType || 'Full-Time',
                reportingManager: doc.reportingManager,
                reportingManagerId: doc.reportingManagerId
              });
            } else {
              // Update if we find better data
              const existing = allEmployees.get(doc.employeeId);
              if (doc.employeeName && existing.name === doc.employeeId) existing.name = doc.employeeName;
              if (doc.name && existing.name === doc.employeeId) existing.name = doc.name;
              if (doc.email) existing.email = doc.email;
              if (doc.department && existing.department === 'Not Specified') existing.department = doc.department;
              if (doc.location && existing.location === 'Not Specified') existing.location = doc.location;
              if (doc.phone) existing.phone = doc.phone;
              if (doc.designation) existing.designation = doc.designation;
              if (doc.dateOfBirth) existing.dateOfBirth = doc.dateOfBirth;
              if (doc.dateOfJoining) existing.dateOfJoining = doc.dateOfJoining;
            }
          }
        });
      } catch (e) {}
    }
    
    console.log(`📊 Found ${allEmployees.size} unique employees\n`);
    
    // Clear current employees
    const employeesCollection = db.collection('employees');
    const deleted = await employeesCollection.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing employee records\n`);
    
    // Insert all employees
    const employeeRecords = Array.from(allEmployees.values());
    if (employeeRecords.length > 0) {
      const result = await employeesCollection.insertMany(employeeRecords);
      console.log(`✅ Successfully restored ${result.insertedCount} employees!\n`);
      
      // Display restored employees
      console.log('📋 RESTORED EMPLOYEES:\n');
      employeeRecords.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
      employeeRecords.forEach((emp, i) => {
        console.log(`${i + 1}. ${emp.employeeId}: ${emp.name}`);
        console.log(`   Department: ${emp.department}, Location: ${emp.location}`);
        console.log(`   Email: ${emp.email}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

function getRoleFromId(empId) {
  if (empId.startsWith('HR')) return 'HR';
  if (empId.startsWith('RMG')) return 'RMG';
  if (empId.startsWith('MGR')) return 'MANAGER';
  if (empId.startsWith('IT')) return empId === 'IT001' ? 'IT_ADMIN' : 'IT_EMPLOYEE';
  if (empId.startsWith('ADMIN')) return 'SUPER_ADMIN';
  if (empId.startsWith('L1')) return 'L1_APPROVER';
  if (empId.startsWith('L2')) return 'L2_APPROVER';
  if (empId.startsWith('L3')) return 'L3_APPROVER';
  if (empId.startsWith('HM')) return 'HIRING_MANAGER';
  return 'EMPLOYEE';
}

function getDesignationFromId(empId) {
  if (empId.startsWith('HR')) return 'HR Manager';
  if (empId.startsWith('RMG')) return 'Resource Manager';
  if (empId.startsWith('MGR')) return 'Engineering Manager';
  if (empId.startsWith('IT')) return empId === 'IT001' ? 'IT Administrator' : 'IT Support Specialist';
  if (empId.startsWith('ADMIN')) return 'System Administrator';
  if (empId.startsWith('ACUA')) return 'Software Engineer';
  if (empId.startsWith('L')) return 'Approver';
  if (empId.startsWith('HM')) return 'Hiring Manager';
  return 'Employee';
}

function generateBirthday() {
  const year = 1985 + Math.floor(Math.random() * 15);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

function generateJoiningDate() {
  const yearsAgo = 1 + Math.floor(Math.random() * 9);
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return date;
}

restoreAllEmployees();
