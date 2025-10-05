"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// POST /api/webhooks/bepaid — обработчик вебхуков статуса оплаты
router.post('/bepaid', (0, middleware_1.asyncHandler)(async (req, res) => {
    const { payment_id, status, order_id } = req.body;
    if (!payment_id) {
        res.status(400).json({});
        return;
    }
    const db = await (0, database_1.getDb)();
    await db.run('UPDATE orders SET prepaymentStatus = ? WHERE paymentId = ?', status, payment_id);
    res.status(204).end();
}));
exports.default = router;
