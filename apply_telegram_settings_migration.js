const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

const run = promisify(db.run).bind(db);
const get = promisify(db.get).bind(db);

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

async function applyMigration() {
  try {
    console.log('📋 Creating telegram_settings table...');
    await run(`
      CREATE TABLE IF NOT EXISTS telegram_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
    console.log('✅ Created telegram_settings table');

    // Добавляем настройки по умолчанию
    const defaultSettings = [
      { key: 'auto_add_users', value: 'true' },
      { key: 'default_role', value: 'client' },
      { key: 'welcome_message_enabled', value: 'true' },
      { key: 'group_chat_role', value: 'manager' },
      { key: 'webhook_url', value: '' }
    ];

    for (const setting of defaultSettings) {
      const existing = await get(`SELECT value FROM telegram_settings WHERE key = ?`, [setting.key]);
      if (!existing) {
        await run(`INSERT INTO telegram_settings (key, value) VALUES (?, ?)`, [setting.key, setting.value]);
        console.log(`✅ Added setting: ${setting.key} = ${setting.value}`);
      } else {
        console.log(`⚠️ Setting ${setting.key} already exists`);
      }
    }

    console.log('🎉 Telegram settings migration completed successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  } finally {
    db.close();
  }
}

applyMigration();
