// Migrate employee data from employee-connect and employee_connect to rmg-portal
const mongoose = require('mongoose');

const DATABASES = {
  source1: 'employee-connect',
  source2: 'employee_connect', 
  target: 'rmg-portal'
};

async function migrateEmployees() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect('mongodb://localhost:27017/admin');
    console.log('✅ Connected to MongoDB\n');

    const client = mongoose.connection.client;
    
    // Get connections to all databases
    const source1Db = client.db(DATABASES.source1);
    const source2Db = client.db(DATABASES.source2);
    const targetDb = client.db(DATABASES.target);

    // Get existing employees in target database (by email to check for duplicates)
    const existingEmployees = await targetDb.collection('employees').find({}).toArray();
    const existingEmails = new Set(existingEmployees.map(e => e.email?.toLowerCase()));
    const existingEmployeeIds = new Set(existingEmployees.map(e => e.employeeId));
    
    console.log(`📊 Current state:`);
    console.log(`   • rmg-portal.employees: ${existingEmployees.length} records`);
    console.log(`   • Existing emails: ${Array.from(existingEmails).slice(0, 3).join(', ')}...`);
    console.log(`   • Existing IDs: ${Array.from(existingEmployeeIds).join(', ')}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let employeeIdConflicts = 0;
    const migratedRecords = [];
    const skippedRecords = [];

    // Function to get next available employee ID
    function getNextEmployeeId(baseId, type = 'EMP') {
      let counter = 1;
      let newId = `${type}${String(counter).padStart(3, '0')}`;
      while (existingEmployeeIds.has(newId)) {
        counter++;
        newId = `${type}${String(counter).padStart(3, '0')}`;
      }
      return newId;
    }

    // Function to generate unique PAN number
    const usedPanNumbers = new Set();
    async function generateUniquePan() {
      // Get all existing PAN numbers
      if (usedPanNumbers.size === 0) {
        const existingPans = await targetDb.collection('employees')
          .find({ panNumber: { $ne: null } })
          .project({ panNumber: 1 })
          .toArray();
        existingPans.forEach(e => usedPanNumbers.add(e.panNumber));
      }
      
      // Generate format: XXXXX9999X (5 letters, 4 numbers, 1 letter)
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      let panNumber;
      let attempts = 0;
      
      do {
        const part1 = Array(5).fill(0).map(() => letters[Math.floor(Math.random() * 26)]).join('');
        const part2 = Array(4).fill(0).map(() => numbers[Math.floor(Math.random() * 10)]).join('');
        const part3 = letters[Math.floor(Math.random() * 26)];
        panNumber = `${part1}${part2}${part3}`;
        attempts++;
      } while (usedPanNumbers.has(panNumber) && attempts < 100);
      
      usedPanNumbers.add(panNumber);
      return panNumber;
    }

    // Migrate from source1 (employee-connect - hiring managers)
    console.log(`📥 Migrating from ${DATABASES.source1}...`);
    const source1Employees = await source1Db.collection('employees').find({}).toArray();
    
    for (const employee of source1Employees) {
      const email = employee.email?.toLowerCase();
      
      if (existingEmails.has(email)) {
        console.log(`   ⏭️  Skipping duplicate: ${email} (${employee.name})`);
        skippedRecords.push({ email, name: employee.name, reason: 'Duplicate email' });
        skippedCount++;
        continue;
      }

      // Check for employeeId conflict
      if (existingEmployeeIds.has(employee.employeeId)) {
        console.log(`   ⚠️  EmployeeId conflict: ${employee.employeeId} for ${email}`);
        const newEmployeeId = getNextEmployeeId(employee.employeeId, 'HM');
        console.log(`   ✏️  Assigning new ID: ${newEmployeeId}`);
        employee.employeeId = newEmployeeId;
        employeeIdConflicts++;
      }

      // Remove _id to let MongoDB generate a new one
      delete employee._id;
      
      // Set required fields for rmg-portal schema
      employee.hasLoginAccess = employee.hasLoginAccess !== undefined ? employee.hasLoginAccess : true;
      employee.isActive = employee.isActive !== undefined ? employee.isActive : true;
      employee.status = employee.status || 'active';
      
      // Generate unique PAN number if missing
      if (!employee.panNumber) {
        employee.panNumber = await generateUniquePan();
        console.log(`   📝 Generated PAN: ${employee.panNumber}`);
      }
      
      try {
        await targetDb.collection('employees').insertOne(employee);
        existingEmails.add(email);
        existingEmployeeIds.add(employee.employeeId);
        migratedRecords.push({ email, name: employee.name, employeeId: employee.employeeId });
        migratedCount++;
        console.log(`   ✅ Migrated: ${employee.employeeId} - ${email} (${employee.name})`);
      } catch (error) {
        console.log(`   ❌ Error migrating ${email}: ${error.message}`);
        skippedRecords.push({ email, name: employee.name, reason: error.message });
        skippedCount++;
      }
    }

    console.log(`\n📥 Migrating from ${DATABASES.source2}...`);
    const source2Employees = await source2Db.collection('employees').find({}).toArray();
    
    for (const employee of source2Employees) {
      const email = employee.email?.toLowerCase();
      
      if (existingEmails.has(email)) {
        console.log(`   ⏭️  Skipping duplicate: ${email} (${employee.name})`);
        skippedRecords.push({ email, name: employee.name, reason: 'Duplicate email' });
        skippedCount++;
        continue;
      }

      // Check for employeeId conflict
      if (existingEmployeeIds.has(employee.employeeId)) {
        console.log(`   ⚠️  EmployeeId conflict: ${employee.employeeId} for ${email}`);
        const newEmployeeId = getNextEmployeeId(employee.employeeId);
        console.log(`   ✏️  Assigning new ID: ${newEmployeeId}`);
        employee.employeeId = newEmployeeId;
        employeeIdConflicts++;
      }

      // Remove _id to let MongoDB generate a new one
      delete employee._id;
      
      // Set required fields for rmg-portal schema
      employee.hasLoginAccess = employee.hasLoginAccess !== undefined ? employee.hasLoginAccess : false;
      employee.isActive = employee.isActive !== undefined ? employee.isActive : true;
      employee.status = employee.status || 'active';
      
      // Generate unique PAN number if missing
      if (!employee.panNumber) {
        employee.panNumber = await generateUniquePan();
        console.log(`   📝 Generated PAN: ${employee.panNumber}`);
      }
      
      try {
        await targetDb.collection('employees').insertOne(employee);
        existingEmails.add(email);
        existingEmployeeIds.add(employee.employeeId);
        migratedRecords.push({ email, name: employee.name, employeeId: employee.employeeId });
        migratedCount++;
        console.log(`   ✅ Migrated: ${employee.employeeId} - ${email} (${employee.name})`);
      } catch (error) {
        console.log(`   ❌ Error migrating ${email}: ${error.message}`);
        skippedRecords.push({ email, name: employee.name, reason: error.message });
        skippedCount++;
      }
    }

    // Final count verification
    const finalCount = await targetDb.collection('employees').countDocuments();

    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully migrated: ${migratedCount} employees`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount} employees`);
    console.log(`⚠️  EmployeeId conflicts resolved: ${employeeIdConflicts}`);
    console.log(`\n📈 Database state:`);
    console.log(`   • Before: ${existingEmployees.length} employees`);
    console.log(`   • After:  ${finalCount} employees`);
    console.log(`   • Added:  ${finalCount - existingEmployees.length} employees`);

    if (migratedRecords.length > 0) {
      console.log(`\n✅ Migrated Employees:`);
      migratedRecords.forEach(emp => {
        console.log(`   • ${emp.employeeId} - ${emp.email} (${emp.name})`);
      });
    }

    if (skippedRecords.length > 0) {
      console.log(`\n⏭️  Skipped Records:`);
      skippedRecords.forEach(emp => {
        console.log(`   • ${emp.email} (${emp.name}) - ${emp.reason}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(70) + '\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateEmployees();
