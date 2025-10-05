const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function checkAndCreateTable() {
  return new Promise((resolve, reject) => {
    // Проверяем существование таблицы telegram_users
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='telegram_users'", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!row) {
        console.log('📋 Creating telegram_users table...');
        
        // Создаем таблицу
        db.exec(`
          CREATE TABLE telegram_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT 1,
            role TEXT DEFAULT 'user',
            notifications_enabled BOOLEAN DEFAULT 1,
            notification_preferences TEXT DEFAULT '{"low_stock": true, "new_orders": true, "system_alerts": true}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error creating telegram_users table:', err);
            reject(err);
            return;
          }
          
          console.log('✅ Created telegram_users table');
          
          // Создаем индексы
          db.exec(`
            CREATE INDEX idx_telegram_users_chat_id ON telegram_users(chat_id);
            CREATE INDEX idx_telegram_users_active ON telegram_users(is_active);
            CREATE INDEX idx_telegram_users_role ON telegram_users(role);
          `, (err) => {
            if (err) {
              console.error('❌ Error creating indexes:', err);
            } else {
              console.log('✅ Created indexes');
            }
            
            // Добавляем тестового пользователя
            db.run(`
              INSERT OR IGNORE INTO telegram_users (chat_id, username, first_name, role)
              VALUES ('123456789', 'admin_test', 'Admin Test', 'admin')
            `, (err) => {
              if (err) {
                console.error('❌ Error adding test user:', err);
              } else {
                console.log('✅ Added test telegram user');
              }
              resolve();
            });
          });
        });
      } else {
        console.log('✅ telegram_users table already exists');
        resolve();
      }
    });
  });
}

async function fixStockAlerts() {
  return new Promise((resolve, reject) => {
    // Проверяем колонку min_quantity в stock_alerts
    db.all("PRAGMA table_info(stock_alerts)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      const hasMinQuantity = columns.some(col => col.name === 'min_quantity');
      
      if (!hasMinQuantity) {
        console.log('📋 Adding min_quantity column to stock_alerts...');
        
        db.exec(`ALTER TABLE stock_alerts ADD COLUMN min_quantity INTEGER DEFAULT 0`, (err) => {
          if (err) {
            console.error('❌ Error adding min_quantity column:', err);
            reject(err);
            return;
          }
          
          console.log('✅ Added min_quantity column to stock_alerts');
          resolve();
        });
      } else {
        console.log('✅ min_quantity column already exists in stock_alerts');
        resolve();
      }
    });
  });
}

async function main() {
  try {
    await checkAndCreateTable();
    await fixStockAlerts();
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

main();
