const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

async function addLowStockMaterials() {
  return new Promise((resolve, reject) => {
    console.log('🔧 Adding materials with low stock for demonstration...');
    
    const lowStockMaterials = [
      {
        name: 'Бумага А4 80г/м² (офисная)',
        unit: 'пачка',
        quantity: 5,
        min_quantity: 50,
        price: 2.5,
        description: 'Офисная бумага белая, формат А4, плотность 80г/м², 500 листов в пачке',
        supplier_id: 1,
        category_id: 1
      },
      {
        name: 'Тонер HP CF410A (черный)',
        unit: 'картридж',
        quantity: 2,
        min_quantity: 10,
        price: 45.0,
        description: 'Тонер-картридж HP CF410A для лазерных принтеров, черный, ресурс 1200 страниц',
        supplier_id: 2,
        category_id: 2
      },
      {
        name: 'Краска Epson 664 (черная)',
        unit: 'картридж',
        quantity: 1,
        min_quantity: 5,
        price: 25.0,
        description: 'Картридж с чернилами Epson 664 для струйных принтеров, черный',
        supplier_id: 2,
        category_id: 2
      },
      {
        name: 'Пленка для ламинации 125мкм',
        unit: 'рулон',
        quantity: 3,
        min_quantity: 15,
        price: 12.0,
        description: 'Пленка для ламинации толщиной 125мкм, ширина 33см, длина 30м',
        supplier_id: 1,
        category_id: 3
      },
      {
        name: 'Скобы для степлера №10 (1000шт)',
        unit: 'коробка',
        quantity: 8,
        min_quantity: 20,
        price: 3.5,
        description: 'Скобы для степлера №10, 1000 штук в коробке',
        supplier_id: 3,
        category_id: 4
      }
    ];
    
    let completed = 0;
    
    lowStockMaterials.forEach(material => {
      db.run(`
        INSERT INTO materials (
          name, unit, quantity, min_quantity, sheet_price_single,
          description, supplier_id, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        material.name,
        material.unit,
        material.quantity,
        material.min_quantity,
        material.price,
        material.description,
        material.supplier_id,
        material.category_id
      ], function(err) {
        if (err) {
          console.error(`❌ Error adding material "${material.name}":`, err);
          reject(err);
          return;
        }
        
        console.log(`✅ Added material ${this.lastID}: "${material.name}" (${material.quantity} ${material.unit}, min: ${material.min_quantity})`);
        completed++;
        
        if (completed === lowStockMaterials.length) {
          resolve();
        }
      });
    });
  });
}

async function checkLowStockMaterials() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Checking materials with low stock...');
    
    db.all(`
      SELECT 
        m.id, m.name, m.unit, m.quantity, m.min_quantity,
        m.description, m.sheet_price_single,
        s.name as supplier_name, c.name as category_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      WHERE m.quantity > 0 AND m.quantity <= COALESCE(m.min_quantity, 10)
      ORDER BY m.quantity ASC
    `, (err, materials) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (materials.length === 0) {
        console.log('  ✅ No materials with low stock found');
      } else {
        console.log(`  ⚠️  Found ${materials.length} materials with low stock:`);
        materials.forEach(material => {
          const percentage = Math.round((material.quantity / material.min_quantity) * 100);
          console.log(`     • "${material.name}" (${material.quantity} ${material.unit}, min: ${material.min_quantity}) - ${percentage}% - ${material.supplier_name || 'No supplier'}`);
        });
      }
      
      resolve();
    });
  });
}

async function main() {
  try {
    await addLowStockMaterials();
    await checkLowStockMaterials();
    console.log('\n🎉 Low stock materials added successfully!');
  } catch (error) {
    console.error('❌ Failed to add materials:', error);
  } finally {
    db.close();
  }
}

main();
