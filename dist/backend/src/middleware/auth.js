"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.authenticate = void 0;
const database_1 = require("../config/database");
const authenticate = async (req, res, next) => {
    const openPaths = [
        // public widget needs these
        /^\/api\/presets/,
        /^\/api\/orders\/[0-9]+\/items$/,
        /^\/api\/orders\/[0-9]+\/prepay$/,
        /^\/api\/webhooks\/bepaid$/,
        // auth endpoints
        /^\/api\/auth\/login$/,
        /^\/api\/auth\/me$/,
        // temporary for testing calculator
        /^\/api\/universal-calculator/,
        /^\/api\/materials\/test-calculator$/,
        /^\/api\/debug-routes$/,
        // pricing policy endpoints
        /^\/api\/pricing/,
        // enhanced calculator endpoints
        /^\/api\/enhanced-calculator/,
        // 🆕 Calculator material endpoints (for public access)
        /^\/api\/paper-types$/,
        /^\/api\/materials$/,
        /^\/api\/product-configs$/
    ];
    if (openPaths.some(r => r.test(req.path)))
        return next();
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const db = await (0, database_1.getDb)();
    const user = await db.get('SELECT id, role FROM users WHERE api_token = ?', token);
    if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    ;
    req.user = user;
    next();
};
exports.authenticate = authenticate;
// Экспорт для обратной совместимости
exports.authMiddleware = exports.authenticate;
