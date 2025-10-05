"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Все роуты материалов требуют аутентификации (кроме публичных)
// router.use(authenticate) // Убрано для публичного доступа к /api/materials
// Публичный доступ для калькулятора
router.get('/', (0, middleware_1.asyncHandler)(controllers_1.MaterialController.getAllMaterials));
// Защищенные маршруты
router.post('/', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.createOrUpdateMaterial));
router.put('/:id', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.updateMaterial));
router.delete('/:id', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.deleteMaterial));
router.get('/low-stock', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.getLowStockMaterials));
router.get('/moves', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.getMaterialMoves));
router.get('/moves/stats', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.getMaterialMovesStats));
router.post('/spend', middleware_1.authenticate, (0, middleware_1.asyncHandler)(controllers_1.MaterialController.spendMaterial));
// Временный endpoint для тестирования калькулятора
router.get('/test-calculator', (0, middleware_1.asyncHandler)(async (req, res) => {
    try {
        const { getDb } = await Promise.resolve().then(() => __importStar(require('../config/database')));
        const db = await getDb();
        // Проверяем, есть ли таблица product_material_rules
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='product_material_rules'");
        if (tables.length === 0) {
            // Создаем таблицу
            await db.exec(`
        CREATE TABLE IF NOT EXISTS product_material_rules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_type TEXT NOT NULL,
          product_name TEXT NOT NULL,
          material_id INTEGER NOT NULL,
          qty_per_item REAL NOT NULL,
          calculation_type TEXT NOT NULL,
          is_required BOOLEAN DEFAULT 1,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
            // Добавляем тестовые данные
            const materials = await db.all("SELECT id, name FROM materials LIMIT 2");
            if (materials.length > 0) {
                await db.run(`
          INSERT INTO product_material_rules 
          (product_type, product_name, material_id, qty_per_item, calculation_type, is_required, notes)
          VALUES 
          ('flyers', 'Листовки A6', ${materials[0].id}, 1, 'per_sheet', 1, 'Бумага для печати'),
          ('flyers', 'Листовки A6', ${materials[1]?.id || materials[0].id}, 0.1, 'per_sheet', 1, 'Краска для печати'),
          ('business_cards', 'Визитки', ${materials[0].id}, 1, 'per_sheet', 1, 'Бумага для визиток')
        `);
            }
        }
        // Получаем типы продуктов
        const types = await db.all("SELECT product_type, COUNT(*) as count FROM product_material_rules GROUP BY product_type");
        res.json({
            success: true,
            message: 'Калькулятор инициализирован',
            types: types,
            tables: tables.length > 0 ? 'exists' : 'created'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
