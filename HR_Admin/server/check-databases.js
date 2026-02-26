// Check available databases and their employee collections
const mongoose = require('mongoose');

async function checkDatabases() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/admin');
    console.log('✅ Connected to MongoDB\n');

    const admin = mongoose.connection.db.admin();
    const { databases } = await admin.listDatabases();

    console.log('📊 Available Databases:');
    console.log('=' .repeat(60));

    for (const db of databases) {
      console.log(`\n📁 Database: ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      
      if (db.name.includes('employee') || db.name === 'rmg-portal') {
        // Connect to this database and check for employees collection
        const dbConn = mongoose.connection.client.db(db.name);
        const collections = await dbConn.listCollections().toArray();
        
        const employeesCollection = collections.find(c => c.name === 'employees');
        if (employeesCollection) {
          const count = await dbConn.collection('employees').countDocuments();
          console.log(`   └─ 👥 employees collection: ${count} records`);
          
          if (count > 0) {
            // Show sample records
            const samples = await dbConn.collection('employees')
              .find({})
              .limit(3)
              .project({ employeeId: 1, email: 1, name: 1 })
              .toArray();
            
            console.log('   └─ Sample records:');
            samples.forEach(emp => {
              console.log(`      • ${emp.employeeId || 'NO_ID'} - ${emp.email} (${emp.name})`);
            });
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabases();
