"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialReportController = void 0;
const services_1 = require("../services");
class MaterialReportController {
    // Отчет по остаткам материалов
    static async getInventoryReport(req, res) {
        try {
            const { categoryId, supplierId, lowStockOnly } = req.query;
            const report = await services_1.MaterialReportService.getInventoryReport({
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined,
                lowStockOnly: lowStockOnly === 'true'
            });
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Отчет по расходу материалов
    static async getConsumptionReport(req, res) {
        try {
            const { from, to, categoryId, supplierId, materialId } = req.query;
            if (!from || !to) {
                res.status(400).json({ error: 'Необходимо указать даты from и to' });
                return;
            }
            const report = await services_1.MaterialReportService.getConsumptionReport({
                from: from,
                to: to,
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined,
                materialId: materialId ? Number(materialId) : undefined
            });
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Отчет по стоимости материалов
    static async getCostReport(req, res) {
        try {
            const { categoryId, supplierId } = req.query;
            const report = await services_1.MaterialReportService.getCostReport({
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Сводный отчет
    static async getSummaryReport(req, res) {
        try {
            const report = await services_1.MaterialReportService.getSummaryReport();
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Отчет по движению материалов по дням
    static async getDailyMovementReport(req, res) {
        try {
            const { from, to, categoryId, supplierId } = req.query;
            if (!from || !to) {
                res.status(400).json({ error: 'Необходимо указать даты from и to' });
                return;
            }
            const report = await services_1.MaterialReportService.getDailyMovementReport({
                from: from,
                to: to,
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined
            });
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialReportController = MaterialReportController;
