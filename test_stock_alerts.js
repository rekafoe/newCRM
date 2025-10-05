const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function testStockAlerts() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing stock alerts functionality...');
    
    // 1. Проверяем материалы с низкими остатками
    console.log('\n📦 Materials with low stock:');
    db.all(`
      SELECT 
        m.id, m.name, m.quantity, m.min_quantity,
        s.name as supplier_name,
        c.name as category_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      WHERE m.quantity <= COALESCE(m.min_quantity, 10)
      ORDER BY m.quantity ASC
    `, (err, materials) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (materials.length === 0) {
        console.log('  ✅ No materials with low stock found');
      } else {
        materials.forEach(material => {
          console.log(`  ⚠️  ${material.name}: ${material.quantity} (min: ${material.min_quantity || 10}) - ${material.supplier_name || 'No supplier'}`);
        });
      }
      
      // 2. Проверяем существующие stock_alerts
      console.log('\n🚨 Current stock alerts:');
      db.all(`
        SELECT 
          id, material_id, material_name, current_quantity, min_stock_level, min_quantity,
          alert_level, created_at, is_resolved
        FROM stock_alerts
        ORDER BY created_at DESC
        LIMIT 10
      `, (err, alerts) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (alerts.length === 0) {
          console.log('  📭 No stock alerts found');
        } else {
          alerts.forEach(alert => {
            const status = alert.is_resolved ? '✅ Resolved' : '🚨 Active';
            console.log(`  ${status} ${alert.material_name}: ${alert.current_quantity} (min: ${alert.min_stock_level}) - ${alert.alert_level}`);
          });
        }
        
        // 3. Создаем тестовый alert для материала с ID 45 (который есть в базе)
        console.log('\n🧪 Creating test stock alert...');
        db.run(`
          INSERT INTO stock_alerts (
            material_id, material_name, current_quantity, min_stock_level, min_quantity,
            supplier_name, supplier_contact, category_name, alert_level,
            created_at, is_resolved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          45, // material_id
          'Test Material', // material_name
          5, // current_quantity
          10, // min_stock_level (NOT NULL)
          10, // min_quantity (NULL)
          'Test Supplier', // supplier_name
          'test@supplier.com', // supplier_contact
          'Test Category', // category_name
          'critical', // alert_level
          new Date().toISOString(), // created_at
          0 // is_resolved
        ], function(err) {
          if (err) {
            console.error('❌ Error creating test alert:', err);
            reject(err);
            return;
          }
          
          console.log(`✅ Test alert created with ID: ${this.lastID}`);
          
          // 4. Проверяем созданный alert
          db.get(`
            SELECT * FROM stock_alerts WHERE id = ?
          `, [this.lastID], (err, alert) => {
            if (err) {
              reject(err);
              return;
            }
            
            console.log('\n📋 Created alert details:');
            console.log(`  ID: ${alert.id}`);
            console.log(`  Material: ${alert.material_name}`);
            console.log(`  Current: ${alert.current_quantity}`);
            console.log(`  Min Stock Level: ${alert.min_stock_level}`);
            console.log(`  Min Quantity: ${alert.min_quantity}`);
            console.log(`  Alert Level: ${alert.alert_level}`);
            console.log(`  Created: ${alert.created_at}`);
            console.log(`  Resolved: ${alert.is_resolved ? 'Yes' : 'No'}`);
            
            resolve();
          });
        });
      });
    });
  });
}

async function main() {
  try {
    await testStockAlerts();
    console.log('\n🎉 Stock alerts test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    db.close();
  }
}

main();
