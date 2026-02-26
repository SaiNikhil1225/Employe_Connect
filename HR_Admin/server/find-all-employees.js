const mongoose = require('mongoose');

async function findAllEmployees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Searching for employees named Sushmitha or Raghu...\n');
    
    // Search in multiple collections
    const collections = ['employees', 'users', 'helpdesktickets', 'leaves', 'pips', 
                        'newjoiners', 'allocations', 'projects', 'payrolls', 
                        'attendances', 'leavebalances', 'hiringrequests', 'notifications'];
    
    const foundEmployees = new Map();
    
    for (const collName of collections) {
      try {
        const coll = db.collection(collName);
        const results = await coll.find({
          $or: [
            { name: { $regex: /sushmitha|raghu/i } },
            { employeeName: { $regex: /sushmitha|raghu/i } },
            { email: { $regex: /sushmitha|raghu/i } }
          ]
        }).toArray();
        
        if (results.length > 0) {
          console.log(`✅ Found in ${collName}: ${results.length} records`);
          results.forEach(r => {
            const empId = r.employeeId || r._id;
            const empName = r.name || r.employeeName || r.email;
            console.log(`   - ${empId}: ${empName}`);
            if (r.employeeId) {
              foundEmployees.set(r.employeeId, {
                name: empName,
                department: r.department,
                email: r.email
              });
            }
          });
        }
      } catch (e) {
        // Skip collections that don't exist
      }
    }
    
    console.log('\n\n🔍 Extracting ALL unique employees from various collections...\n');
    
    // Get all unique employees from helpdesk tickets
    const helpdeskTickets = await db.collection('helpdesktickets').find()
      .project({employeeId: 1, employeeName: 1, department: 1, email: 1}).toArray();
    
    helpdeskTickets.forEach(t => {
      if (t.employeeId && t.employeeName) {
        if (!foundEmployees.has(t.employeeId)) {
          foundEmployees.set(t.employeeId, {
            name: t.employeeName,
            department: t.department,
            email: t.email
          });
        }
      }
    });
    
    // Get from leaves
    const leaves = await db.collection('leaves').find()
      .project({employeeId: 1, employeeName: 1, department: 1, email: 1}).toArray();
    
    leaves.forEach(l => {
      if (l.employeeId && l.employeeName) {
        if (!foundEmployees.has(l.employeeId)) {
          foundEmployees.set(l.employeeId, {
            name: l.employeeName,
            department: l.department,
            email: l.email
          });
        }
      }
    });
    
    // Get from allocations
    const allocations = await db.collection('allocations').find()
      .project({employeeId: 1, employeeName: 1, department: 1, email: 1}).toArray();
    
    allocations.forEach(a => {
      if (a.employeeId && a.employeeName) {
        if (!foundEmployees.has(a.employeeId)) {
          foundEmployees.set(a.employeeId, {
            name: a.employeeName,
            department: a.department,
            email: a.email
          });
        }
      }
    });
    
    // Get from payrolls
    const payrolls = await db.collection('payrolls').find()
      .project({employeeId: 1, employeeName: 1, name: 1, department: 1, email: 1}).toArray();
    
    payrolls.forEach(p => {
      if (p.employeeId) {
        const empName = p.employeeName || p.name;
        if (empName && !foundEmployees.has(p.employeeId)) {
          foundEmployees.set(p.employeeId, {
            name: empName,
            department: p.department,
            email: p.email
          });
        }
      }
    });
    
    // Get from PIPs
    const pips = await db.collection('pips').find()
      .project({employeeId: 1, employeeName: 1, department: 1, email: 1}).toArray();
    
    pips.forEach(p => {
      if (p.employeeId && p.employeeName) {
        if (!foundEmployees.has(p.employeeId)) {
          foundEmployees.set(p.employeeId, {
            name: p.employeeName,
            department: p.department,
            email: p.email
          });
        }
      }
    });
    
    console.log('📊 Total Unique Employees Found:', foundEmployees.size);
    console.log('\n=== ALL EMPLOYEES ===\n');
    
    const sortedEmployees = Array.from(foundEmployees.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    
    sortedEmployees.forEach(([empId, data], index) => {
      console.log(`${index + 1}. ${empId}: ${data.name}`);
      if (data.department) console.log(`   Department: ${data.department}`);
      if (data.email) console.log(`   Email: ${data.email}`);
      console.log('');
    });
    
    // Check current employees table
    console.log('\n=== CURRENT EMPLOYEES TABLE ===\n');
    const currentEmployees = await db.collection('employees').find().toArray();
    console.log('Count:', currentEmployees.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

findAllEmployees();
