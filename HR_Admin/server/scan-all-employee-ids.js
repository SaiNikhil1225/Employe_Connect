const mongoose = require('mongoose');

async function findAllEmployeeIds() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rmg-portal');
    console.log('✅ Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    console.log('🔍 Scanning ALL collections for employee IDs...\n');
    
    const allEmployees = new Map();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collName = collection.name;
      try {
        const coll = db.collection(collName);
        const docs = await coll.find().toArray();
        
        docs.forEach(doc => {
          // Check for employeeId field
          if (doc.employeeId) {
            if (!allEmployees.has(doc.employeeId)) {
              allEmployees.set(doc.employeeId, {
                name: doc.employeeName || doc.name || 'Unknown',
                department: doc.department || 'Unknown',
                email: doc.email || 'Unknown',
                sources: [collName]
              });
            } else {
              const existing = allEmployees.get(doc.employeeId);
              if (!existing.sources.includes(collName)) {
                existing.sources.push(collName);
              }
              // Update name if we find a better one
              if (doc.employeeName && existing.name === 'Unknown') {
                existing.name = doc.employeeName;
              }
              if (doc.name && existing.name === 'Unknown') {
                existing.name = doc.name;
              }
              if (doc.department && existing.department === 'Unknown') {
                existing.department = doc.department;
              }
              if (doc.email && existing.email === 'Unknown') {
                existing.email = doc.email;
              }
            }
          }
          
          // Check for createdBy/updatedBy fields (might contain employee IDs)
          ['createdBy', 'updatedBy', 'requestedBy', 'approvedBy', 'assignedTo'].forEach(field => {
            if (doc[field] && typeof doc[field] === 'string' && 
                (doc[field].startsWith('EMP') || doc[field].startsWith('ACUA') || 
                 doc[field].startsWith('RMG') || doc[field].startsWith('HR') ||
                 doc[field].startsWith('MGR') || doc[field].startsWith('IT'))) {
              if (!allEmployees.has(doc[field])) {
                allEmployees.set(doc[field], {
                  name: 'Unknown',
                  department: 'Unknown', 
                  email: 'Unknown',
                  sources: [collName + '.' + field]
                });
              } else {
                const existing = allEmployees.get(doc[field]);
                if (!existing.sources.includes(collName + '.' + field)) {
                  existing.sources.push(collName + '.' + field);
                }
              }
            }
          });
        });
        
      } catch (e) {
        // Skip
      }
    }
    
    console.log('📊 Total Unique Employee IDs Found:', allEmployees.size);
    console.log('\n=== ALL EMPLOYEE IDs (Sorted) ===\n');
    
    const sortedEmployees = Array.from(allEmployees.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });
    
    sortedEmployees.forEach(([empId, data], index) => {
      console.log(`${index + 1}. ${empId}: ${data.name}`);
      console.log(`   Department: ${data.department}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Found in: ${data.sources.slice(0, 3).join(', ')}${data.sources.length > 3 ? '...' : ''}`);
      console.log('');
    });
    
    // Check for ACUA employees specifically
    const acuaEmployees = sortedEmployees.filter(([id]) => id.startsWith('ACUA'));
    console.log(`\n📋 ACUA Employees: ${acuaEmployees.length}`);
    acuaEmployees.forEach(([id, data]) => {
      console.log(`   ${id}: ${data.name} - ${data.department}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

findAllEmployeeIds();
