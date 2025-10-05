const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

async function checkTable() {
  const run = promisify(db.run).bind(db);
  const all = promisify(db.all).bind(db);
  
  try {
    console.log('🔍 Checking telegram_settings table...');
    
    // Проверяем, существует ли таблица
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name='telegram_settings'");
    
    if (tables.length === 0) {
      console.log('❌ Table telegram_settings does not exist');
      return;
    }
    
    console.log('✅ Table telegram_settings exists');
    
    // Проверяем структуру таблицы
    const columns = await all("PRAGMA table_info(telegram_settings)");
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Проверяем данные
    const data = await all("SELECT * FROM telegram_settings");
    console.log(`📊 Found ${data.length} settings:`);
    data.forEach(row => {
      console.log(`  - ${row.key}: ${row.value}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

checkTable();
