"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
// GET /api/users — список пользователей
router.get('/', (0, middleware_1.asyncHandler)(async (req, res) => {
    const db = await (0, database_1.getDb)();
    const users = await db.all('SELECT id, name FROM users ORDER BY name');
    res.json(users);
}));
exports.default = router;
