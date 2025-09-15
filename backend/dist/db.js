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
  `);
    console.log('✅ Database schema is ready');
    dbInstance = db;
    return db;
}
