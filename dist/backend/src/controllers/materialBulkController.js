"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialBulkController = void 0;
const services_1 = require("../services");
class MaterialBulkController {
    // Массовое обновление материалов
    static async bulkUpdateMaterials(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { updates } = req.body;
            if (!Array.isArray(updates) || updates.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив обновлений' });
                return;
            }
            const results = await services_1.MaterialBulkService.bulkUpdateMaterials(updates);
            res.json({ updated: results.length, materials: results });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Массовое списание материалов
    static async bulkSpendMaterials(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { spends } = req.body;
            if (!Array.isArray(spends) || spends.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив списаний' });
                return;
            }
            const results = await services_1.MaterialBulkService.bulkSpendMaterials(spends, user.id);
            res.json({ processed: results.length, results });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Массовое создание материалов
    static async bulkCreateMaterials(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { materials } = req.body;
            if (!Array.isArray(materials) || materials.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив материалов' });
                return;
            }
            const results = await services_1.MaterialBulkService.bulkCreateMaterials(materials);
            res.json({ created: results.length, materials: results });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Массовое удаление материалов
    static async bulkDeleteMaterials(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { materialIds } = req.body;
            if (!Array.isArray(materialIds) || materialIds.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив ID материалов' });
                return;
            }
            const results = await services_1.MaterialBulkService.bulkDeleteMaterials(materialIds);
            res.json({ processed: results.length, results });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Массовое изменение категории
    static async bulkChangeCategory(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { materialIds, categoryId } = req.body;
            if (!Array.isArray(materialIds) || materialIds.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив ID материалов' });
                return;
            }
            if (!categoryId) {
                res.status(400).json({ error: 'Необходимо указать ID категории' });
                return;
            }
            const result = await services_1.MaterialBulkService.bulkChangeCategory(materialIds, categoryId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Массовое изменение поставщика
    static async bulkChangeSupplier(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { materialIds, supplierId } = req.body;
            if (!Array.isArray(materialIds) || materialIds.length === 0) {
                res.status(400).json({ error: 'Необходимо передать массив ID материалов' });
                return;
            }
            if (!supplierId) {
                res.status(400).json({ error: 'Необходимо указать ID поставщика' });
                return;
            }
            const result = await services_1.MaterialBulkService.bulkChangeSupplier(materialIds, supplierId);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialBulkController = MaterialBulkController;
