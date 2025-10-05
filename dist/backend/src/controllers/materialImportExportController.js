"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialImportExportController = void 0;
const services_1 = require("../services");
class MaterialImportExportController {
    // Экспорт в CSV
    static async exportToCSV(req, res) {
        try {
            const { categoryId, supplierId } = req.query;
            const csv = await services_1.MaterialImportExportService.exportToCSV({
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="materials_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Экспорт в JSON
    static async exportToJSON(req, res) {
        try {
            const { categoryId, supplierId } = req.query;
            const json = await services_1.MaterialImportExportService.exportToJSON({
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="materials_${new Date().toISOString().split('T')[0]}.json"`);
            res.json(json);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Импорт из JSON
    static async importFromJSON(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const data = req.body;
            // Валидация данных
            const validation = await services_1.MaterialImportExportService.validateImportData(data);
            if (!validation.valid) {
                res.status(400).json({
                    error: 'Ошибки валидации данных',
                    details: validation.errors
                });
                return;
            }
            const result = await services_1.MaterialImportExportService.importFromJSON(data);
            res.json({
                success: true,
                imported: result.results.length,
                errors: result.errors.length,
                results: result.results,
                error_details: result.errors
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить шаблон для импорта
    static async getImportTemplate(req, res) {
        try {
            const template = await services_1.MaterialImportExportService.getImportTemplate();
            res.json(template);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Валидация данных импорта
    static async validateImportData(req, res) {
        try {
            const data = req.body;
            const validation = await services_1.MaterialImportExportService.validateImportData(data);
            res.json(validation);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialImportExportController = MaterialImportExportController;
