"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialCategoryController = void 0;
const services_1 = require("../services");
class MaterialCategoryController {
    static async getAllCategories(req, res) {
        try {
            const categories = await services_1.MaterialCategoryService.getAllCategories();
            res.json(categories);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getCategoryById(req, res) {
        try {
            const id = Number(req.params.id);
            const category = await services_1.MaterialCategoryService.getCategoryById(id);
            if (!category) {
                res.status(404).json({ error: 'Категория не найдена' });
                return;
            }
            res.json(category);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async createCategory(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const category = req.body;
            const result = await services_1.MaterialCategoryService.createCategory(category);
            res.status(201).json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async updateCategory(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            const category = req.body;
            const result = await services_1.MaterialCategoryService.updateCategory(id, category);
            if (!result) {
                res.status(404).json({ error: 'Категория не найдена' });
                return;
            }
            res.json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async deleteCategory(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const id = Number(req.params.id);
            await services_1.MaterialCategoryService.deleteCategory(id);
            res.status(204).end();
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    static async getCategoryStats(req, res) {
        try {
            const stats = await services_1.MaterialCategoryService.getCategoryStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialCategoryController = MaterialCategoryController;
