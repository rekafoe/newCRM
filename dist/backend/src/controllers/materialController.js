"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialController = void 0;
const services_1 = require("../services");
class MaterialController {
    static async getAllMaterials(req, res) {
        try {
            const materials = await services_1.MaterialService.getAllMaterials();
            res.json(materials);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createOrUpdateMaterial(req, res) {
        try {
            console.log('=== КОНТРОЛЛЕР СОЗДАНИЯ МАТЕРИАЛА ===');
            console.log('Headers:', req.headers);
            console.log('Body:', JSON.stringify(req.body, null, 2));
            const user = req.user;
            if (!user || user.role !== 'admin') {
                console.log('❌ Доступ запрещен - пользователь не админ');
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            console.log('✅ Пользователь авторизован:', user);
            const material = req.body;
            const result = await services_1.MaterialService.createOrUpdateMaterial(material);
            console.log('✅ Материал создан/обновлен успешно');
            res.json(result);
        }
        catch (error) {
            console.error('❌ Ошибка в контроллере создания материала:', error);
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async updateMaterial(req, res) {
        try {
            console.log('=== PUT /api/materials/:id ===');
            console.log('Params:', req.params);
            console.log('Body:', JSON.stringify(req.body, null, 2));
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            const material = req.body;
            const result = await services_1.MaterialService.updateMaterial(id, material);
            res.json(result);
        }
        catch (error) {
            console.error('Ошибка в updateMaterial контроллере:', error);
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async deleteMaterial(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            await services_1.MaterialService.deleteMaterial(id);
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getLowStockMaterials(req, res) {
        try {
            const materials = await services_1.MaterialService.getLowStockMaterials();
            res.json(materials);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getMaterialMoves(req, res) {
        try {
            const { materialId, user_id, orderId, from, to, categoryId, supplierId, reason, limit, offset } = req.query;
            const moves = await services_1.MaterialService.getMaterialMoves({
                materialId: materialId ? Number(materialId) : undefined,
                user_id: user_id ? Number(user_id) : undefined,
                orderId: orderId ? Number(orderId) : undefined,
                from: from,
                to: to,
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined,
                reason: reason,
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined
            });
            res.json(moves);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getMaterialMovesStats(req, res) {
        try {
            const { materialId, user_id, orderId, from, to, categoryId, supplierId } = req.query;
            const stats = await services_1.MaterialService.getMaterialMovesStats({
                materialId: materialId ? Number(materialId) : undefined,
                user_id: user_id ? Number(user_id) : undefined,
                orderId: orderId ? Number(orderId) : undefined,
                from: from,
                to: to,
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async spendMaterial(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { materialId, delta, reason, orderId } = req.body;
            const result = await services_1.MaterialService.spendMaterial(materialId, delta, reason, orderId, user.id);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialController = MaterialController;
