const { Database } = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('./data.db');
const db = new Database(dbPath);

console.log('🔍 Debugging telegram_settings table...');

// Проверяем структуру таблицы
db.all('PRAGMA table_info(telegram_settings)', (err, rows) => {
  if (err) {
    console.error('❌ Error getting table info:', err);
  } else {
    console.log('📋 Table structure:');
    rows.forEach(row => {
      console.log(`  ${row.name}: ${row.type}`);
    });
  }
  
  // Проверяем все данные
  db.all('SELECT * FROM telegram_settings', (err, data) => {
    if (err) {
      console.error('❌ Error getting data:', err);
    } else {
      console.log('\n📊 All data:');
      data.forEach(row => {
        console.log(`  ${row.setting_key}: ${row.setting_value}`);
      });
    }
    
    // Проверяем конкретную настройку
    db.get('SELECT setting_value FROM telegram_settings WHERE setting_key = ?', ['auto_add_users'], (err, row) => {
      if (err) {
        console.error('❌ Error getting auto_add_users:', err);
      } else {
        console.log('\n🎯 auto_add_users setting:');
        console.log('  Row:', row);
        console.log('  Value:', row ? row.setting_value : 'null');
      }
      db.close();
    });
  });
});

