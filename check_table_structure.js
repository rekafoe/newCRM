const { Database } = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('./data.db');
const db = new Database(dbPath);

console.log('🔍 Checking telegram_settings table structure...');

db.all('PRAGMA table_info(telegram_settings)', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📋 telegram_settings table structure:');
    rows.forEach(row => {
      console.log(`  ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
    });
  }
  
  // Also check the actual data
  db.all('SELECT * FROM telegram_settings', (err, data) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('\n📊 Current data:');
      data.forEach(row => {
        console.log(`  ${row.setting_key}: ${row.setting_value}`);
      });
    }
    db.close();
  });
});

