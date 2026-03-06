const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function importDB() {
  await mongoose.connect('mongodb+srv://sainikhilbomma_db_user:cRyUZ6kNo3QaaHh0@clusterrmg.oacj8xd.mongodb.net/rmg-portal?retryWrites=true&w=majority&appName=ClusterRMG');
  console.log('Connected to Atlas!');

  const db = mongoose.connection.db;
  const dir = 'C:\\mongo-backup\\rmg-portal';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const colName = file.replace('.json', '');
    const docs = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (docs.length === 0) {
      console.log('Skip empty: ' + colName);
      continue;
    }
    try {
      await db.collection(colName).insertMany(docs, { ordered: false });
      console.log('Imported: ' + colName + ' (' + docs.length + ' docs)');
    } catch (err) {
      if (err.code === 11000) {
        const inserted = err.result?.insertedCount ?? 0;
        const skipped = docs.length - inserted;
        console.log('Imported: ' + colName + ' (' + inserted + ' new, ' + skipped + ' duplicates skipped)');
      } else {
        throw err;
      }
    }
  }

  console.log('Done! All data migrated to Atlas.');
  await mongoose.disconnect();
}

importDB().catch(err => { console.error(err); process.exit(1); });
