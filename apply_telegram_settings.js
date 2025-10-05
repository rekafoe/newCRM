const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function createTelegramSettings() {
  return new Promise((resolve, reject) => {
    // Создаем таблицу настроек
    db.exec(`
      CREATE TABLE IF NOT EXISTS telegram_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('✅ Created telegram_settings table');
      
      // Добавляем настройки по умолчанию
      const defaultSettings = [
        {
          key: 'auto_add_users',
          value: 'true',
          description: 'Автоматически добавлять пользователей, которые пишут боту'
        },
        {
          key: 'default_role',
          value: 'user',
          description: 'Роль по умолчанию для новых пользователей'
        },
        {
          key: 'welcome_message_enabled',
          value: 'true',
          description: 'Отправлять приветственное сообщение новым пользователям'
        },
        {
          key: 'group_chat_role',
          value: 'manager',
          description: 'Роль для пользователей из групповых чатов'
        },
        {
          key: 'webhook_url',
          value: '',
          description: 'URL для Telegram webhook'
        }
      ];

      let completed = 0;
      for (const setting of defaultSettings) {
        db.run(`
          INSERT OR IGNORE INTO telegram_settings (setting_key, setting_value, description)
          VALUES (?, ?, ?)
        `, [setting.key, setting.value, setting.description], (err) => {
          if (err) {
            console.error('❌ Error inserting setting:', err);
          } else {
            console.log(`✅ Added setting: ${setting.key}`);
          }
          
          completed++;
          if (completed === defaultSettings.length) {
            resolve();
          }
        });
      }
    });
  });
}

async function main() {
  try {
    await createTelegramSettings();
    console.log('🎉 Telegram settings migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

main();
