const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function updateStockAlerts() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Updating stock alerts with new material names...');
    
    const materialUpdates = {
      45: 'Полуматовая бумага NEVIA 90г/м² SRA3',
      48: 'Самоклеящаяся пленка Oracal 651 50мкм',
      50: 'Прозрачная пленка Oracal 8500 100мкм',
      51: 'Рулонная бумага для баннеров 440г/м²'
    };
    
    let completed = 0;
    const totalUpdates = Object.keys(materialUpdates).length;
    
    Object.entries(materialUpdates).forEach(([materialId, newName]) => {
      db.run(`
        UPDATE stock_alerts 
        SET material_name = ?
        WHERE material_id = ? AND is_resolved = 0
      `, [newName, materialId], function(err) {
        if (err) {
          console.error(`❌ Error updating stock alerts for material ${materialId}:`, err);
          reject(err);
          return;
        }
        
        console.log(`✅ Updated ${this.changes} stock alerts for material ${materialId}: "${newName}"`);
        completed++;
        
        if (completed === totalUpdates) {
          resolve();
        }
      });
    });
  });
}

async function checkUpdatedStockAlerts() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Checking updated stock alerts...');
    
    db.all(`
      SELECT 
        id, material_id, material_name, current_quantity, min_stock_level,
        alert_level, created_at, is_resolved
      FROM stock_alerts
      WHERE is_resolved = 0
      ORDER BY created_at DESC
      LIMIT 10
    `, (err, alerts) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (alerts.length === 0) {
        console.log('  📭 No active stock alerts found');
      } else {
        console.log(`  🚨 Found ${alerts.length} active stock alerts:`);
        alerts.forEach(alert => {
          const status = alert.alert_level === 'out_of_stock' ? '🚫' : 
                        alert.alert_level === 'critical' ? '⚠️' : '🔶';
          console.log(`     ${status} "${alert.material_name}" (ID: ${alert.material_id}): ${alert.current_quantity} (min: ${alert.min_stock_level})`);
        });
      }
      
      resolve();
    });
  });
}

async function main() {
  try {
    await updateStockAlerts();
    await checkUpdatedStockAlerts();
    console.log('\n🎉 Stock alerts update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    db.close();
  }
}

main();
