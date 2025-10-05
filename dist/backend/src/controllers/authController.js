"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const services_1 = require("../services");
class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await services_1.AuthService.login(email, password);
            res.json(result);
        }
        catch (error) {
            const status = error.message === 'Email и пароль обязательны' ? 400 : 401;
            res.status(status).json({ message: error.message });
        }
    }
    static async getCurrentUser(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ message: 'Токен не предоставлен' });
                return;
            }
            const user = await services_1.AuthService.getCurrentUser(token);
            res.json(user);
        }
        catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}
exports.AuthController = AuthController;
