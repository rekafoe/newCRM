const { Database } = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('./data.db');
const db = new Database(dbPath);

console.log('🔍 Testing Telegram settings API...');

// Тестируем запрос к настройкам
db.all('SELECT setting_key, setting_value FROM telegram_settings', (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
  } else {
    console.log('✅ Settings query successful:');
    rows.forEach(row => {
      console.log(`  ${row.setting_key}: ${row.setting_value}`);
    });
  }
  
  // Тестируем структуру ответа
  const settings = {
    auto_add_users: true,
    default_role: 'client',
    welcome_message_enabled: true,
    group_chat_role: 'manager',
    webhook_url: ''
  };

  rows.forEach(row => {
    switch (row.setting_key) {
      case 'auto_add_users':
        settings.auto_add_users = row.setting_value === 'true';
        break;
      case 'default_role':
        settings.default_role = row.setting_value;
        break;
      case 'welcome_message_enabled':
        settings.welcome_message_enabled = row.setting_value === 'true';
        break;
      case 'group_chat_role':
        settings.group_chat_role = row.setting_value;
        break;
      case 'webhook_url':
        settings.webhook_url = row.setting_value;
        break;
    }
  });

  console.log('\n📊 Final settings object:');
  console.log(JSON.stringify(settings, null, 2));
  
  db.close();
});

