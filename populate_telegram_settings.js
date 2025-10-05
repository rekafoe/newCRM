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

async function populateSettings() {
  const run = promisify(db.run).bind(db);
  const get = promisify(db.get).bind(db);
  
  try {
    console.log('🔧 Populating telegram_settings table...');
    
    const defaultSettings = [
      { key: 'auto_add_users', value: 'true' },
      { key: 'default_role', value: 'client' },
      { key: 'welcome_message_enabled', value: 'true' },
      { key: 'group_chat_role', value: 'manager' },
      { key: 'webhook_url', value: '' }
    ];

    for (const setting of defaultSettings) {
      const existing = await get(`SELECT setting_value FROM telegram_settings WHERE setting_key = ?`, [setting.key]);
      if (!existing) {
        await run(`INSERT INTO telegram_settings (setting_key, setting_value) VALUES (?, ?)`, [setting.key, setting.value]);
        console.log(`✅ Added setting: ${setting.key} = ${setting.value}`);
      } else {
        console.log(`⚠️ Setting ${setting.key} already exists: ${existing.setting_value}`);
      }
    }

    // Проверяем результат
    const allSettings = await promisify(db.all).bind(db)('SELECT setting_key, setting_value FROM telegram_settings');
    console.log('\n📋 Current settings:');
    allSettings.forEach(row => {
      console.log(`  - ${row.setting_key}: ${row.setting_value}`);
    });

    console.log('\n🎉 Telegram settings populated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

populateSettings();
