"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const utils_1 = require("../utils");
class AuthService {
    static async login(email, password) {
        if (!email || !password) {
            throw new Error('Email и пароль обязательны');
        }
        const hashedPassword = (0, utils_1.hashPassword)(password);
        const db = await (0, database_1.getDb)();
        const user = await db.get('SELECT id, api_token, name, role FROM users WHERE email = ? AND password_hash = ?', email, hashedPassword);
        if (!user) {
            throw new Error('Неверные данные');
        }
        // Ensure daily report exists for today for this user
        const today = (0, utils_1.getTodayString)();
        const exists = await db.get('SELECT id FROM daily_reports WHERE report_date = ? AND user_id = ?', today, user.id);
        if (!exists) {
            try {
                await db.run('INSERT INTO daily_reports (report_date, user_id) VALUES (?, ?)', today, user.id);
            }
            catch { }
        }
        return {
            token: user.api_token,
            name: user.name,
            role: user.role,
            user_id: user.id,
            session_date: today
        };
    }
    static async getCurrentUser(token) {
        const db = await (0, database_1.getDb)();
        const user = await db.get('SELECT id, name, role FROM users WHERE api_token = ?', token);
        if (!user) {
            throw new Error('Неверный токен');
        }
        return user;
    }
}
exports.AuthService = AuthService;
