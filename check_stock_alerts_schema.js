const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function checkStockAlertsSchema() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Checking stock_alerts table schema...');
    
    db.all("PRAGMA table_info(stock_alerts)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('📋 Current stock_alerts columns:');
      columns.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      // Проверяем, есть ли колонка min_stock_level
      const hasMinStockLevel = columns.some(col => col.name === 'min_stock_level');
      const hasMinQuantity = columns.some(col => col.name === 'min_quantity');
      
      console.log(`\n🔍 min_stock_level exists: ${hasMinStockLevel}`);
      console.log(`🔍 min_quantity exists: ${hasMinQuantity}`);
      
      if (!hasMinStockLevel && !hasMinQuantity) {
        console.log('❌ Neither min_stock_level nor min_quantity found!');
      }
      
      resolve(columns);
    });
  });
}

async function checkMaterialsSchema() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Checking materials table schema...');
    
    db.all("PRAGMA table_info(materials)", (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('📋 Current materials columns:');
      columns.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
      resolve(columns);
    });
  });
}

async function checkStockAlertsData() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Checking stock_alerts data...');
    
    db.all("SELECT * FROM stock_alerts LIMIT 5", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`📊 Found ${rows.length} stock alerts:`);
      rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ID: ${row.id}, Material: ${row.material_id}, Current: ${row.current_quantity}, Min: ${row.min_quantity || row.min_stock_level || 'N/A'}`);
      });
      
      resolve(rows);
    });
  });
}

async function main() {
  try {
    await checkStockAlertsSchema();
    await checkMaterialsSchema();
    await checkStockAlertsData();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

main();
