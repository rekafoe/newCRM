"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorController = void 0;
const services_1 = require("../services");
class CalculatorController {
    static async getFlyersSchema(req, res) {
        try {
            const schema = services_1.CalculatorService.getFlyersSchema();
            res.json(schema);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async calculateFlyersPrice(req, res) {
        try {
            const params = req.body;
            const result = await services_1.CalculatorService.calculateFlyersPrice(params);
            res.json(result);
        }
        catch (error) {
            const status = error.message === 'format, qty, sides обязательны' ? 400 : 500;
            res.status(status).json({ message: error.message });
        }
    }
}
exports.CalculatorController = CalculatorController;
