"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// GET /api/presets — список категорий с их товарами и допами
router.get('/', (0, middleware_1.asyncHandler)(async (req, res) => {
    const db = await (0, database_1.getDb)();
    const categories = (await db.all('SELECT id, category, color FROM preset_categories ORDER BY category'));
    const items = (await db.all('SELECT id, category_id, description, price FROM preset_items'));
    const extras = (await db.all('SELECT id, category_id, name, price, type, unit FROM preset_extras'));
    const result = categories.map((c) => ({
        category: c.category,
        color: c.color,
        items: items
            .filter((i) => i.category_id === c.id)
            .map((i) => ({ description: i.description, price: i.price })),
        extras: extras
            .filter((e) => e.category_id === c.id)
            .map((e) => ({ name: e.name, price: e.price, type: e.type, unit: e.unit || undefined }))
    }));
    res.json(result);
}));
// GET /api/product-materials/:category/:description
router.get('/:category/:description', (0, middleware_1.asyncHandler)(async (req, res) => {
    const db = await (0, database_1.getDb)();
    const rows = await db.all(`SELECT pm.materialId, pm.qtyPerItem, m.name, m.unit, m.quantity, m.min_quantity as min_quantity
       FROM product_materials pm
       JOIN materials m ON m.id = pm.materialId
       WHERE pm.presetCategory = ? AND pm.presetDescription = ?`, req.params.category, req.params.description);
    res.json(rows);
}));
// POST /api/product-materials — задать состав материалов для пресета
router.post('/materials', (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const { presetCategory, presetDescription, materials } = req.body;
    const db = await (0, database_1.getDb)();
    await db.run('DELETE FROM product_materials WHERE presetCategory = ? AND presetDescription = ?', presetCategory, presetDescription);
    for (const m of materials) {
        await db.run('INSERT INTO product_materials (presetCategory, presetDescription, materialId, qtyPerItem) VALUES (?, ?, ?, ?)', presetCategory, presetDescription, m.materialId, m.qtyPerItem);
    }
    res.status(204).end();
}));
exports.default = router;
