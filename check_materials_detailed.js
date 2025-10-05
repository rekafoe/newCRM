const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function checkMaterialsDetailed() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Detailed analysis of materials...');
    
    // 1. Проверяем все материалы с их полной информацией
    console.log('\n📦 All materials in database:');
    db.all(`
      SELECT 
        m.id, m.name, m.unit, m.quantity, m.min_quantity,
        m.sheet_price_single, m.density, m.description,
        s.name as supplier_name, s.contact_person as supplier_contact,
        c.name as category_name,
        pt.name as paper_type_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      LEFT JOIN paper_types pt ON pt.id = m.paper_type_id
      ORDER BY m.id
    `, (err, materials) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (materials.length === 0) {
        console.log('  📭 No materials found');
      } else {
        console.log(`  📊 Found ${materials.length} materials:`);
        materials.forEach(material => {
          console.log(`\n  📋 ID: ${material.id}`);
          console.log(`     Name: "${material.name}"`);
          console.log(`     Unit: ${material.unit}`);
          console.log(`     Quantity: ${material.quantity}`);
          console.log(`     Min Quantity: ${material.min_quantity || 'Not set'}`);
          console.log(`     Price: ${material.sheet_price_single || 'Not set'}`);
          console.log(`     Density: ${material.density || 'Not set'}`);
          console.log(`     Description: ${material.description || 'No description'}`);
          console.log(`     Supplier: ${material.supplier_name || 'No supplier'}`);
          console.log(`     Category: ${material.category_name || 'No category'}`);
          console.log(`     Paper Type: ${material.paper_type_name || 'No paper type'}`);
        });
      }
      
      // 2. Проверяем материалы с нулевыми остатками
      console.log('\n🚨 Materials with zero stock:');
      db.all(`
        SELECT 
          m.id, m.name, m.unit, m.quantity, m.min_quantity,
          m.description, s.name as supplier_name, c.name as category_name
        FROM materials m
        LEFT JOIN suppliers s ON s.id = m.supplier_id
        LEFT JOIN material_categories c ON c.id = m.category_id
        WHERE m.quantity <= 0
        ORDER BY m.name
      `, (err, zeroStock) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (zeroStock.length === 0) {
          console.log('  ✅ No materials with zero stock');
        } else {
          console.log(`  ⚠️  Found ${zeroStock.length} materials with zero stock:`);
          zeroStock.forEach(material => {
            console.log(`     • "${material.name}" (${material.unit}) - ${material.supplier_name || 'No supplier'} - ${material.category_name || 'No category'}`);
            if (material.description) {
              console.log(`       Description: ${material.description}`);
            }
          });
        }
        
        // 3. Проверяем материалы с низкими остатками (но не нулевыми)
        console.log('\n⚠️  Materials with low stock (but not zero):');
        db.all(`
          SELECT 
            m.id, m.name, m.unit, m.quantity, m.min_quantity,
            m.description, s.name as supplier_name, c.name as category_name
          FROM materials m
          LEFT JOIN suppliers s ON s.id = m.supplier_id
          LEFT JOIN material_categories c ON c.id = m.category_id
          WHERE m.quantity > 0 AND m.quantity <= COALESCE(m.min_quantity, 10)
          ORDER BY m.quantity ASC
        `, (err, lowStock) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (lowStock.length === 0) {
            console.log('  ✅ No materials with low stock');
          } else {
            console.log(`  ⚠️  Found ${lowStock.length} materials with low stock:`);
            lowStock.forEach(material => {
              console.log(`     • "${material.name}" (${material.unit}): ${material.quantity} (min: ${material.min_quantity || 10}) - ${material.supplier_name || 'No supplier'}`);
            });
          }
          
          // 4. Проверяем, что показывается в stock_alerts
          console.log('\n🚨 Current stock alerts:');
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
              console.log('  📭 No active stock alerts');
            } else {
              console.log(`  🚨 Found ${alerts.length} active stock alerts:`);
              alerts.forEach(alert => {
                console.log(`     • "${alert.material_name}" (ID: ${alert.material_id}): ${alert.current_quantity} (min: ${alert.min_stock_level}) - ${alert.alert_level}`);
              });
            }
            
            resolve();
          });
        });
      });
    });
  });
}

async function main() {
  try {
    await checkMaterialsDetailed();
    console.log('\n🎉 Detailed materials analysis completed!');
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    db.close();
  }
}

main();
