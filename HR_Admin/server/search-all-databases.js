// Search all databases for specific employees
const mongoose = require('mongoose');

async function searchAllDatabases() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/admin');
    console.log('✅ Connected to MongoDB\n');

    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();
    
    const searchNames = ['sushmitha', 'raghu', 'praveen', 'kolisetty'];
    
    console.log('🔍 Searching for: sushmitha, raghu, praveen across all databases...\n');
    console.log('='.repeat(80));

    for (const db of databases) {
      if (db.name === 'admin' || db.name === 'config' || db.name === 'local') continue;
      
      const dbConn = mongoose.connection.client.db(db.name);
      const collections = await dbConn.listCollections().toArray();
      
      const employeesCollection = collections.find(c => c.name === 'employees');
      if (employeesCollection) {
        console.log(`\n📁 Searching in database: ${db.name}`);
        
        for (const searchName of searchNames) {
          const regex = new RegExp(searchName, 'i');
          const results = await dbConn.collection('employees').find({
            $or: [
              { name: regex },
              { email: regex },
              { firstName: regex },
              { lastName: regex }
            ]
          }).toArray();
          
          if (results.length > 0) {
            console.log(`\n   ✅ Found ${results.length} match(es) for "${searchName}":`);
            results.forEach(emp => {
              console.log(`      • ${emp.employeeId || 'NO_ID'} - ${emp.name || emp.firstName || 'NO NAME'}`);
              console.log(`        Email: ${emp.email || 'NO EMAIL'}`);
              console.log(`        Department: ${emp.department || 'NO DEPT'}`);
            });
          }
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 If employees not found, they need to be created.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

searchAllDatabases();
