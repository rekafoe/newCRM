"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialCostTrackingController = void 0;
const services_1 = require("../services");
class MaterialCostTrackingController {
    // Получить историю цен материала
    static async getPriceHistory(req, res) {
        try {
            const materialId = Number(req.params.materialId);
            const { limit } = req.query;
            const history = await services_1.MaterialCostTrackingService.getPriceHistory(materialId, limit ? Number(limit) : undefined);
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить историю цен всех материалов
    static async getAllPriceHistory(req, res) {
        try {
            const { materialId, from, to, limit, offset } = req.query;
            const history = await services_1.MaterialCostTrackingService.getAllPriceHistory({
                materialId: materialId ? Number(materialId) : undefined,
                from: from,
                to: to,
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined
            });
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Обновить цену материала
    static async updatePrice(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const materialId = Number(req.params.materialId);
            const { new_price, reason } = req.body;
            if (!new_price || new_price < 0) {
                res.status(400).json({ error: 'Неверная цена' });
                return;
            }
            if (!reason || typeof reason !== 'string') {
                res.status(400).json({ error: 'Необходимо указать причину изменения цены' });
                return;
            }
            const result = await services_1.MaterialCostTrackingService.updatePrice(materialId, new_price, reason, user.id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить статистику по ценам
    static async getPriceStats(req, res) {
        try {
            const { materialId, from, to } = req.query;
            const stats = await services_1.MaterialCostTrackingService.getPriceStats({
                materialId: materialId ? Number(materialId) : undefined,
                from: from,
                to: to
            });
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить материалы с изменением цен
    static async getMaterialsWithPriceChanges(req, res) {
        try {
            const { from, to, categoryId, supplierId } = req.query;
            if (!from || !to) {
                res.status(400).json({ error: 'Необходимо указать даты from и to' });
                return;
            }
            const materials = await services_1.MaterialCostTrackingService.getMaterialsWithPriceChanges({
                from: from,
                to: to,
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.json(materials);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить тренды цен по категориям
    static async getPriceTrendsByCategory(req, res) {
        try {
            const { from, to } = req.query;
            if (!from || !to) {
                res.status(400).json({ error: 'Необходимо указать даты from и to' });
                return;
            }
            const trends = await services_1.MaterialCostTrackingService.getPriceTrendsByCategory({
                from: from,
                to: to
            });
            res.json(trends);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialCostTrackingController = MaterialCostTrackingController;
