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
    await db.collection(colName).insertMany(docs);
    console.log('Imported: ' + colName + ' (' + docs.length + ' docs)');
  }

  console.log('Done! All data migrated to Atlas.');
  await mongoose.disconnect();
}

importDB().catch(err => { console.error(err); process.exit(1); });
