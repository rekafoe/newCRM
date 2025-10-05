const { Database } = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('./data.db');
const db = new Database(dbPath);

console.log('🔍 Checking Telegram settings...');

db.all('SELECT setting_key, setting_value FROM telegram_settings', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('📋 Telegram settings:');
    rows.forEach(row => {
      console.log(`  ${row.setting_key}: ${row.setting_value}`);
    });
  }
  
  // Also check current users
  db.all('SELECT chat_id, username, first_name, role FROM telegram_users', (err, users) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('\n👥 Current Telegram users:');
      users.forEach(user => {
        console.log(`  ${user.chat_id}: ${user.first_name} (${user.username}) - ${user.role}`);
      });
    }
    db.close();
  });
});

