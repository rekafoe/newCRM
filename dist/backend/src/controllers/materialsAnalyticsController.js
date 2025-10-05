"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsAnalyticsController = void 0;
const materialsAnalyticsService_1 = require("../services/materialsAnalyticsService");
const logger_1 = require("../utils/logger");
class MaterialsAnalyticsController {
}
exports.MaterialsAnalyticsController = MaterialsAnalyticsController;
_a = MaterialsAnalyticsController;
/**
 * Получить полную аналитику по материалам
 */
MaterialsAnalyticsController.getFullAnalytics = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения аналитики материалов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения аналитики материалов',
            details: error.message
        });
    }
};
/**
 * Получить аналитику по конкретному материалу
 */
MaterialsAnalyticsController.getMaterialAnalytics = async (req, res) => {
    try {
        const materialId = Number(req.params.materialId);
        if (!materialId || isNaN(materialId)) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать корректный ID материала'
            });
            return;
        }
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getMaterialAnalytics(materialId);
        if (!analytics) {
            res.status(404).json({
                success: false,
                error: 'Материал не найден'
            });
            return;
        }
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения аналитики материала', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения аналитики материала',
            details: error.message
        });
    }
};
/**
 * Получить сводную аналитику
 */
MaterialsAnalyticsController.getSummaryAnalytics = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        // Возвращаем только сводку
        res.json({
            success: true,
            data: {
                summary: analytics.summary,
                trends: analytics.trends,
                recommendations: analytics.recommendations
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения сводной аналитики', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения сводной аналитики',
            details: error.message
        });
    }
};
/**
 * Получить аналитику потребления
 */
MaterialsAnalyticsController.getConsumptionAnalytics = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics.consumption
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения аналитики потребления', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения аналитики потребления',
            details: error.message
        });
    }
};
/**
 * Получить аналитику поставщиков
 */
MaterialsAnalyticsController.getSupplierAnalytics = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics.suppliers
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения аналитики поставщиков', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения аналитики поставщиков',
            details: error.message
        });
    }
};
/**
 * Получить аналитику категорий
 */
MaterialsAnalyticsController.getCategoryAnalytics = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics.categories
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения аналитики категорий', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения аналитики категорий',
            details: error.message
        });
    }
};
/**
 * Получить тренды
 */
MaterialsAnalyticsController.getTrends = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics.trends
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения трендов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения трендов',
            details: error.message
        });
    }
};
/**
 * Получить рекомендации
 */
MaterialsAnalyticsController.getRecommendations = async (req, res) => {
    try {
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        res.json({
            success: true,
            data: analytics.recommendations
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения рекомендаций', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения рекомендаций',
            details: error.message
        });
    }
};
/**
 * Экспортировать аналитику
 */
MaterialsAnalyticsController.exportAnalytics = async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        const analytics = await materialsAnalyticsService_1.MaterialsAnalyticsService.getFullAnalytics();
        if (format === 'csv') {
            // Здесь можно добавить экспорт в CSV
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="materials-analytics.csv"');
            res.send('Material ID,Material Name,Category,Supplier,Current Stock,Min Stock,Stock Value,Turnover Rate\n');
            // Добавить данные в CSV формате
        }
        else {
            res.json({
                success: true,
                data: analytics
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка экспорта аналитики', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка экспорта аналитики',
            details: error.message
        });
    }
};
