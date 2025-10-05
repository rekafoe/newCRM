"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(db) {
    // Создаем таблицу истории цен материалов
    await db.exec(`
    CREATE TABLE IF NOT EXISTS material_price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL REFERENCES materials(id),
      old_price REAL,
      new_price REAL NOT NULL,
      change_reason TEXT NOT NULL,
      changed_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Создаем индексы
    await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_material_price_history_material_id ON material_price_history(material_id)
  `);
    await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_material_price_history_created_at ON material_price_history(created_at)
  `);
}
async function down(db) {
    // Удаляем таблицу истории цен
    await db.exec(`
    DROP TABLE IF EXISTS material_price_history
  `);
}
