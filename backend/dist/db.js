"use strict";
// backend/src/db.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.resolve(__dirname, '../data.db');
let dbInstance = null;
async function initDB() {
    if (dbInstance)
        return dbInstance;
    console.log('📂 Opening database at', DB_FILE);
    const db = await (0, sqlite_1.open)({
        filename: DB_FILE,
        driver: sqlite3_1.default.Database
    });
    await db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE,
      status INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      type TEXT NOT NULL,
      params TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS product_materials (
      presetCategory TEXT NOT NULL,
      presetDescription TEXT NOT NULL,
      materialId INTEGER NOT NULL,
      qtyPerItem REAL NOT NULL,
      FOREIGN KEY(materialId) REFERENCES materials(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_date TEXT NOT NULL UNIQUE,
      orders_count INTEGER NOT NULL DEFAULT 0,
      total_revenue REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS preset_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS preset_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      UNIQUE(category_id, description),
      FOREIGN KEY(category_id) REFERENCES preset_categories(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS preset_extras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      type TEXT NOT NULL,
      unit TEXT,
      FOREIGN KEY(category_id) REFERENCES preset_categories(id) ON DELETE CASCADE
    );
  `);
    console.log('✅ Database schema is ready');
    // Seed presets if empty
    const countRow = await db.get(`SELECT COUNT(1) as c FROM preset_categories`);
    if (!countRow || Number(countRow.c) === 0) {
        console.log('🌱 Seeding print shop presets...');
        const presets = [
            {
                category: 'Визитки',
                color: '#1976d2',
                items: [
                    { description: 'Визитки 90x50, односторонние', price: 30 },
                    { description: 'Визитки 90x50, двусторонние', price: 40 }
                ],
                extras: [
                    { name: 'Ламинация матовая', price: 10, type: 'checkbox' },
                    { name: 'Ламинация глянцевая', price: 10, type: 'checkbox' }
                ]
            },
            {
                category: 'Листовки',
                color: '#43a047',
                items: [
                    { description: 'Листовки A6, 4+0', price: 25 },
                    { description: 'Листовки A5, 4+0', price: 35 },
                    { description: 'Листовки A4, 4+0', price: 55 }
                ],
                extras: []
            },
            {
                category: 'Буклеты',
                color: '#ef6c00',
                items: [
                    { description: 'Буклет A4, 2 фальца (евро)', price: 80 },
                    { description: 'Буклет A3, 1 фальц', price: 95 }
                ],
                extras: []
            },
            {
                category: 'Плакаты',
                color: '#6d4c41',
                items: [
                    { description: 'Плакат A3', price: 15 },
                    { description: 'Плакат A2', price: 25 },
                    { description: 'Плакат A1', price: 45 }
                ],
                extras: []
            },
            {
                category: 'Наклейки',
                color: '#8e24aa',
                items: [
                    { description: 'Наклейки вырубные, малый формат', price: 20 },
                    { description: 'Наклейки листовые A4', price: 12 }
                ],
                extras: []
            },
            {
                category: 'Баннеры',
                color: '#0097a7',
                items: [
                    { description: 'Баннер 1×1 м', price: 30 },
                    { description: 'Баннер 2×1 м', price: 50 }
                ],
                extras: [
                    { name: 'Проклейка люверсов', price: 10, type: 'checkbox' }
                ]
            },
            {
                category: 'Календари',
                color: '#c2185b',
                items: [
                    { description: 'Календарь настенный (перекидной)', price: 60 },
                    { description: 'Календарь домик', price: 25 }
                ],
                extras: []
            }
        ];
        for (const p of presets) {
            const ins = await db.run('INSERT OR IGNORE INTO preset_categories (category, color) VALUES (?, ?)', p.category, p.color);
            const catRow = await db.get('SELECT id FROM preset_categories WHERE category = ?', p.category);
            const catId = catRow.id;
            for (const it of p.items) {
                await db.run('INSERT OR IGNORE INTO preset_items (category_id, description, price) VALUES (?, ?, ?)', catId, it.description, it.price);
            }
            for (const ex of p.extras || []) {
                await db.run('INSERT INTO preset_extras (category_id, name, price, type, unit) VALUES (?, ?, ?, ?, ?)', catId, ex.name, ex.price, ex.type, ex.unit || null);
            }
        }
        console.log('✅ Presets seeded');
    }
    dbInstance = db;
    return db;
}
