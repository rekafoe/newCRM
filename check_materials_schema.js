const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking materials table schema...');

db.all("PRAGMA table_info(materials)", (err, rows) => {
  if (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  
  console.log('📋 Materials table columns:');
  rows.forEach(row => {
    console.log(`  - ${row.name} (${row.type})`);
  });
  
  db.close();
});
