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
const upload_1 = require("../config/upload");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// Order routes
router.get('/', (0, middleware_1.asyncHandler)(controllers_1.OrderController.getAllOrders));
router.get('/search', (0, middleware_1.asyncHandler)(controllers_1.OrderController.searchOrders));
router.get('/stats', (0, middleware_1.asyncHandler)(controllers_1.OrderController.getOrdersStats));
router.post('/', (0, middleware_1.asyncHandler)(controllers_1.OrderController.createOrder));
router.post('/with-auto-deduction', (0, middleware_1.asyncHandler)(controllers_1.OrderController.createOrderWithAutoDeduction));
router.put('/:id/status', (0, middleware_1.asyncHandler)(controllers_1.OrderController.updateOrderStatus));
router.delete('/:id', (0, middleware_1.asyncHandler)(controllers_1.OrderController.deleteOrder));
router.post('/:id/duplicate', (0, middleware_1.asyncHandler)(controllers_1.OrderController.duplicateOrder));
// Bulk operations
router.post('/bulk/update-status', (0, middleware_1.asyncHandler)(controllers_1.OrderController.bulkUpdateStatus));
router.post('/bulk/delete', (0, middleware_1.asyncHandler)(controllers_1.OrderController.bulkDeleteOrders));
// Export
router.get('/export', (0, middleware_1.asyncHandler)(controllers_1.OrderController.exportOrders));
// Order items routes
router.post('/:id/items', (0, middleware_1.asyncHandler)(controllers_1.OrderItemController.addItem));
router.delete('/:orderId/items/:itemId', (0, middleware_1.asyncHandler)(controllers_1.OrderItemController.deleteItem));
router.patch('/:orderId/items/:itemId', (0, middleware_1.asyncHandler)(controllers_1.OrderItemController.updateItem));
// Order files routes
router.get('/:id/files', (0, middleware_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const db = await (0, database_1.getDb)();
    const rows = await db.all('SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE orderId = ? ORDER BY id DESC', id);
    res.json(rows);
}));
router.post('/:id/files', upload_1.upload.single('file'), (0, middleware_1.asyncHandler)(async (req, res) => {
    const orderId = Number(req.params.id);
    const f = req.file;
    if (!f) {
        res.status(400).json({ message: 'Файл не получен' });
        return;
    }
    const db = await (0, database_1.getDb)();
    await db.run('INSERT INTO order_files (orderId, filename, originalName, mime, size) VALUES (?, ?, ?, ?, ?)', orderId, f.filename, f.originalname || null, f.mimetype || null, f.size || null);
    const row = await db.get('SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE orderId = ? ORDER BY id DESC LIMIT 1', orderId);
    res.status(201).json(row);
}));
router.delete('/:orderId/files/:fileId', (0, middleware_1.asyncHandler)(async (req, res) => {
    const orderId = Number(req.params.orderId);
    const fileId = Number(req.params.fileId);
    const { uploadsDir } = await Promise.resolve().then(() => __importStar(require('../config/upload')));
    const path = await Promise.resolve().then(() => __importStar(require('path')));
    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
    const db = await (0, database_1.getDb)();
    const row = await db.get('SELECT filename FROM order_files WHERE id = ? AND orderId = ?', fileId, orderId);
    if (row && row.filename) {
        const p = path.join(uploadsDir, String(row.filename));
        try {
            fs.unlinkSync(p);
        }
        catch { }
    }
    await db.run('DELETE FROM order_files WHERE id = ? AND orderId = ?', fileId, orderId);
    res.status(204).end();
}));
router.post('/:orderId/files/:fileId/approve', (0, middleware_1.asyncHandler)(async (req, res) => {
    const orderId = Number(req.params.orderId);
    const fileId = Number(req.params.fileId);
    const user = req.user;
    const db = await (0, database_1.getDb)();
    await db.run("UPDATE order_files SET approved = 1, approvedAt = datetime('now'), approvedBy = ? WHERE id = ? AND orderId = ?", user?.id ?? null, fileId, orderId);
    const row = await db.get('SELECT id, orderId, filename, originalName, mime, size, uploadedAt, approved, approvedAt, approvedBy FROM order_files WHERE id = ? AND orderId = ?', fileId, orderId);
    res.json(row);
}));
// Prepayment routes
router.post('/:id/prepay', (0, middleware_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const db = await (0, database_1.getDb)();
    const order = await db.get('SELECT * FROM orders WHERE id = ?', id);
    if (!order) {
        res.status(404).json({ message: 'Заказ не найден' });
        return;
    }
    const amount = Number(req.body?.amount ?? order.prepaymentAmount ?? 0);
    const paymentMethod = req.body?.paymentMethod ?? 'online';
    if (!amount || amount <= 0) {
        res.status(400).json({ message: 'Сумма предоплаты не задана' });
        return;
    }
    // BePaid integration stub: normally create payment via API and get redirect url
    const paymentId = `BEP-${Date.now()}-${id}`;
    const paymentUrl = paymentMethod === 'online' ? `https://checkout.bepaid.by/redirect/${paymentId}` : null;
    const prepaymentStatus = paymentMethod === 'offline' ? 'paid' : 'pending';
    await db.run('UPDATE orders SET prepaymentAmount = ?, prepaymentStatus = ?, paymentUrl = ?, paymentId = ?, paymentMethod = ? WHERE id = ?', amount, prepaymentStatus, paymentUrl, paymentId, paymentMethod, id);
    const updated = await db.get('SELECT * FROM orders WHERE id = ?', id);
    res.json(updated);
}));
// Admin utility: normalize item prices
router.post('/:id/normalize-prices', (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const orderId = Number(req.params.id);
    const db = await (0, database_1.getDb)();
    const items = await db.all('SELECT id, price, quantity FROM items WHERE orderId = ?', orderId);
    let updated = 0;
    for (const it of items) {
        const qty = Math.max(1, Number(it.quantity) || 1);
        const price = Number(it.price) || 0;
        // Heuristic: if qty>1 and price likely contains total (per-item > 10 BYN or qty>=50 and per-item > 3 BYN)
        const perItem = price / qty;
        const shouldFix = qty > 1 && (perItem === 0 ? false : (perItem > 10 || (qty >= 50 && perItem > 3)));
        if (shouldFix) {
            await db.run('UPDATE items SET price = ? WHERE id = ? AND orderId = ?', perItem, it.id, orderId);
            updated++;
        }
    }
    res.json({ orderId, updated });
}));
exports.default = router;
