"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemController = void 0;
const database_1 = require("../config/database");
class OrderItemController {
    static async addItem(req, res) {
        try {
            const orderId = Number(req.params.id);
            const { type, params, price, quantity = 1, printerId, sides = 1, sheets = 0, waste = 0, components } = req.body;
            const authUser = req.user;
            const db = await (0, database_1.getDb)();
            // Узнаём материалы и остатки (либо из переданных components, либо по пресету)
            let needed = [];
            if (Array.isArray(components) && components.length > 0) {
                const ids = components.map(c => Number(c.materialId)).filter(Boolean);
                if (ids.length) {
                    const placeholders = ids.map(() => '?').join(',');
                    const rows = await db.all(`SELECT id as materialId, quantity, min_quantity FROM materials WHERE id IN (${placeholders})`, ...ids);
                    const byId = {};
                    for (const r of rows)
                        byId[Number(r.materialId)] = { quantity: Number(r.quantity), min_quantity: r.min_quantity == null ? null : Number(r.min_quantity) };
                    needed = components.map(c => ({ materialId: Number(c.materialId), qtyPerItem: Number(c.qtyPerItem), quantity: byId[Number(c.materialId)]?.quantity ?? 0, min_quantity: byId[Number(c.materialId)]?.min_quantity ?? null }));
                }
            }
            else {
                needed = (await db.all(`SELECT pm.materialId, pm.qtyPerItem, m.quantity, m.min_quantity as min_quantity
             FROM product_materials pm
             JOIN materials m ON m.id = pm.materialId
             WHERE pm.presetCategory = ? AND pm.presetDescription = ?`, type, params.description));
            }
            // Транзакция: проверка остатков, списание и вставка позиции
            await db.run('BEGIN');
            try {
                for (const n of needed) {
                    const needQty = Math.ceil(n.qtyPerItem * Math.max(1, Number(quantity) || 1)); // Округляем вверх до целого числа
                    const minQ = n.min_quantity == null ? -Infinity : Number(n.min_quantity);
                    if (n.quantity - needQty < minQ) {
                        const err = new Error(`Недостаточно материала с учётом минимального остатка ID=${n.materialId}`);
                        err.status = 400;
                        throw err;
                    }
                    await db.run('UPDATE materials SET quantity = quantity - ? WHERE id = ?', needQty, n.materialId);
                    await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', n.materialId, -needQty, 'order add item', orderId, authUser?.id ?? null);
                }
                const clicks = Math.max(0, Number(sheets) || 0) * (Math.max(1, Number(sides) || 1) * 2); // SRA3 one-side=2 clicks, two-sides=4
                const insertItem = await db.run('INSERT INTO items (orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', orderId, type, JSON.stringify({ ...params, components: Array.isArray(components) ? components : undefined }), price, Math.max(1, Number(quantity) || 1), printerId || null, Math.max(1, Number(sides) || 1), Math.max(0, Number(sheets) || 0), Math.max(0, Number(waste) || 0), clicks);
                const itemId = insertItem.lastID;
                const rawItem = await db.get('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE id = ?', itemId);
                await db.run('COMMIT');
                const item = {
                    id: rawItem.id,
                    orderId: rawItem.orderId,
                    type: rawItem.type,
                    params: JSON.parse(rawItem.params),
                    price: rawItem.price,
                    quantity: rawItem.quantity ?? 1,
                    printerId: rawItem.printerId ?? undefined,
                    sides: rawItem.sides,
                    sheets: rawItem.sheets,
                    waste: rawItem.waste,
                    clicks: rawItem.clicks
                };
                res.status(201).json(item);
                return;
            }
            catch (e) {
                await db.run('ROLLBACK');
                throw e;
            }
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async deleteItem(req, res) {
        try {
            const orderId = Number(req.params.orderId);
            const itemId = Number(req.params.itemId);
            const authUser = req.user;
            const db = await (0, database_1.getDb)();
            // Находим позицию и её состав материалов
            const it = await db.get('SELECT id, type, params, quantity FROM items WHERE orderId = ? AND id = ?', orderId, itemId);
            if (!it) {
                // Нечего возвращать, просто 204
                await db.run('DELETE FROM items WHERE orderId = ? AND id = ?', orderId, itemId);
                res.status(204).end();
                return;
            }
            const paramsObj = JSON.parse(it.params || '{}');
            const composition = (await db.all('SELECT materialId, qtyPerItem FROM product_materials WHERE presetCategory = ? AND presetDescription = ?', it.type, paramsObj.description || ''));
            await db.run('BEGIN');
            try {
                for (const c of composition) {
                    const returnQty = Math.ceil((c.qtyPerItem || 0) * Math.max(1, Number(it.quantity) || 1)); // Округляем вверх до целого числа
                    if (returnQty > 0) {
                        await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', returnQty, c.materialId);
                        await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', c.materialId, returnQty, 'order delete item', orderId, authUser?.id ?? null);
                    }
                }
                await db.run('DELETE FROM items WHERE orderId = ? AND id = ?', orderId, itemId);
                await db.run('COMMIT');
                res.status(204).end();
            }
            catch (e) {
                await db.run('ROLLBACK');
                throw e;
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateItem(req, res) {
        try {
            const orderId = Number(req.params.orderId);
            const itemId = Number(req.params.itemId);
            const body = req.body;
            const db = await (0, database_1.getDb)();
            const existing = await db.get('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste FROM items WHERE id = ? AND orderId = ?', itemId, orderId);
            if (!existing) {
                res.status(404).json({ message: 'Позиция не найдена' });
                return;
            }
            const newQuantity = body.quantity != null ? Math.max(1, Number(body.quantity) || 1) : existing.quantity;
            const deltaQty = newQuantity - (existing.quantity ?? 1);
            await db.run('BEGIN');
            try {
                if (deltaQty !== 0) {
                    const paramsObj = JSON.parse(existing.params || '{}');
                    const composition = (await db.all(`SELECT pm.materialId, pm.qtyPerItem, m.quantity
               FROM product_materials pm
               JOIN materials m ON m.id = pm.materialId
              WHERE pm.presetCategory = ? AND pm.presetDescription = ?`, existing.type, paramsObj.description || ''));
                    if (deltaQty > 0) {
                        // Проверяем остатки
                        for (const c of composition) {
                            const need = Math.ceil((c.qtyPerItem || 0) * deltaQty); // Округляем вверх до целого числа
                            if (c.quantity < need) {
                                const err = new Error(`Недостаточно материала ID=${c.materialId}`);
                                err.status = 400;
                                throw err;
                            }
                        }
                        for (const c of composition) {
                            const need = Math.ceil((c.qtyPerItem || 0) * deltaQty); // Округляем вверх до целого числа
                            if (need > 0)
                                await db.run('UPDATE materials SET quantity = quantity - ? WHERE id = ?', need, c.materialId);
                            if (need > 0)
                                await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', c.materialId, -need, 'order update qty +', orderId, req.user?.id ?? null);
                        }
                    }
                    else {
                        for (const c of composition) {
                            const back = Math.ceil((c.qtyPerItem || 0) * Math.abs(deltaQty)); // Округляем вверх до целого числа
                            if (back > 0)
                                await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', back, c.materialId);
                            if (back > 0)
                                await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', c.materialId, back, 'order update qty -', orderId, req.user?.id ?? null);
                        }
                    }
                }
                const nextSides = body.sides != null ? Math.max(1, Number(body.sides) || 1) : existing.sides;
                const nextSheets = body.sheets != null ? Math.max(0, Number(body.sheets) || 0) : existing.sheets;
                const clicks = nextSheets * (nextSides * 2);
                await db.run(`UPDATE items SET 
              ${body.price != null ? 'price = ?,' : ''}
              ${body.quantity != null ? 'quantity = ?,' : ''}
              ${body.printerId !== undefined ? 'printerId = ?,' : ''}
              ${body.sides != null ? 'sides = ?,' : ''}
              ${body.sheets != null ? 'sheets = ?,' : ''}
              ${body.waste != null ? 'waste = ?,' : ''}
              clicks = ?
           WHERE id = ? AND orderId = ?`, ...[body.price != null ? Number(body.price) : []], ...[body.quantity != null ? newQuantity : []], ...[body.printerId !== undefined ? body.printerId : []], ...[body.sides != null ? nextSides : []], ...[body.sheets != null ? nextSheets : []], ...[body.waste != null ? Math.max(0, Number(body.waste) || 0) : []], clicks, itemId, orderId);
                await db.run('COMMIT');
            }
            catch (e) {
                await db.run('ROLLBACK');
                throw e;
            }
            const updated = await db.get('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE id = ? AND orderId = ?', itemId, orderId);
            res.json({
                id: updated.id,
                orderId: updated.orderId,
                type: updated.type,
                params: JSON.parse(updated.params || '{}'),
                price: updated.price,
                quantity: updated.quantity,
                printerId: updated.printerId ?? undefined,
                sides: updated.sides,
                sheets: updated.sheets,
                waste: updated.waste,
                clicks: updated.clicks
            });
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
}
exports.OrderItemController = OrderItemController;
