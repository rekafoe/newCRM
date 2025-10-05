const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function updateMaterialsDetailed() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Updating materials with detailed information...');
    
    const updates = [
      {
        id: 45,
        name: 'Полуматовая бумага NEVIA 90г/м² SRA3',
        description: 'Полуматовая офсетная бумага NEVIA плотностью 90г/м², формат SRA3 (320×450мм), белая',
        min_quantity: 1000,
        price: 0.35
      },
      {
        id: 48,
        name: 'Самоклеящаяся пленка Oracal 651 50мкм',
        description: 'Самоклеящаяся виниловая пленка Oracal 651 толщиной 50мкм, ширина 50см, длина 10м, белая',
        min_quantity: 50,
        price: 2.5
      },
      {
        id: 50,
        name: 'Прозрачная пленка Oracal 8500 100мкм',
        description: 'Прозрачная самоклеящаяся пленка Oracal 8500 толщиной 100мкм, ширина 50см, длина 10м',
        min_quantity: 30,
        price: 3.2
      },
      {
        id: 51,
        name: 'Рулонная бумага для баннеров 440г/м²',
        description: 'Рулонная бумага для широкоформатной печати плотностью 440г/м², ширина 1.37м, длина 50м, белая',
        min_quantity: 20,
        price: 8.5
      }
    ];
    
    let completed = 0;
    
    updates.forEach(update => {
      db.run(`
        UPDATE materials 
        SET 
          name = ?,
          description = ?,
          min_quantity = ?,
          sheet_price_single = ?
        WHERE id = ?
      `, [
        update.name,
        update.description,
        update.min_quantity,
        update.price,
        update.id
      ], function(err) {
        if (err) {
          console.error(`❌ Error updating material ${update.id}:`, err);
          reject(err);
          return;
        }
        
        console.log(`✅ Updated material ${update.id}: "${update.name}"`);
        completed++;
        
        if (completed === updates.length) {
          resolve();
        }
      });
    });
  });
}

async function checkUpdatedMaterials() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Checking updated materials...');
    
    db.all(`
      SELECT 
        m.id, m.name, m.unit, m.quantity, m.min_quantity,
        m.description, m.sheet_price_single,
        s.name as supplier_name, c.name as category_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      WHERE m.id IN (45, 48, 50, 51)
      ORDER BY m.id
    `, (err, materials) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📋 Updated materials:');
      materials.forEach(material => {
        console.log(`\n  📦 ID: ${material.id}`);
        console.log(`     Name: "${material.name}"`);
        console.log(`     Quantity: ${material.quantity} ${material.unit}`);
        console.log(`     Min Quantity: ${material.min_quantity} ${material.unit}`);
        console.log(`     Price: ${material.sheet_price_single} BYN`);
        console.log(`     Description: ${material.description}`);
        console.log(`     Supplier: ${material.supplier_name}`);
        console.log(`     Category: ${material.category_name}`);
        
        // Проверяем статус остатков
        if (material.quantity <= 0) {
          console.log(`     Status: 🚫 OUT OF STOCK`);
        } else if (material.quantity <= material.min_quantity) {
          console.log(`     Status: ⚠️  LOW STOCK`);
        } else {
          console.log(`     Status: ✅ OK`);
        }
      });
      
      resolve();
    });
  });
}

async function main() {
  try {
    await updateMaterialsDetailed();
    await checkUpdatedMaterials();
    console.log('\n🎉 Materials update completed successfully!');
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    db.close();
  }
}

main();
