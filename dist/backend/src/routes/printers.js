"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// GET /api/printers — список принтеров
router.get('/', (0, middleware_1.asyncHandler)(async (req, res) => {
    const db = await (0, database_1.getDb)();
    const rows = await db.all('SELECT id, code, name FROM printers ORDER BY name');
    res.json(rows);
}));
// GET /api/printers/counters — счётчики принтеров по дате
router.get('/counters', (0, middleware_1.asyncHandler)(async (req, res) => {
    const date = String(req.query?.date || '').slice(0, 10);
    if (!date) {
        res.status(400).json({ message: 'date=YYYY-MM-DD required' });
        return;
    }
    const db = await (0, database_1.getDb)();
    const rows = await db.all(`SELECT p.id, p.code, p.name,
            pc.value as value,
            (
              SELECT pc2.value FROM printer_counters pc2
               WHERE pc2.printer_id = p.id AND pc2.counter_date < ?
               ORDER BY pc2.counter_date DESC LIMIT 1
            ) as prev_value
       FROM printers p
  LEFT JOIN printer_counters pc ON pc.printer_id = p.id AND pc.counter_date = ?
      ORDER BY p.name`, date, date);
    res.json(rows);
}));
// POST /api/printers/:id/counters — добавить счётчик принтера
router.post('/:id/counters', (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const id = Number(req.params.id);
    const { counter_date, value } = req.body;
    const db = await (0, database_1.getDb)();
    try {
        await db.run('INSERT OR REPLACE INTO printer_counters (printer_id, counter_date, value) VALUES (?, ?, ?)', id, counter_date, Number(value));
    }
    catch (e) {
        throw e;
    }
    const row = await db.get('SELECT id, printer_id, counter_date, value, created_at FROM printer_counters WHERE printer_id = ? AND counter_date = ?', id, counter_date);
    res.status(201).json(row);
}));
exports.default = router;
