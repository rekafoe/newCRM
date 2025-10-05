"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostCalculationController = void 0;
const costCalculationService_1 = require("../services/costCalculationService");
const logger_1 = require("../utils/logger");
class CostCalculationController {
}
exports.CostCalculationController = CostCalculationController;
_a = CostCalculationController;
/**
 * Рассчитать себестоимость товара
 */
CostCalculationController.calculateProductCost = async (req, res) => {
    try {
        const { productType, productVariant, quantity, specifications } = req.body;
        if (!productType || !productVariant || !quantity) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать productType, productVariant и quantity'
            });
            return;
        }
        const result = await costCalculationService_1.CostCalculationService.calculateProductCost(productType, productVariant, Number(quantity), specifications);
        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        }
        else {
            res.status(400).json({
                success: false,
                data: result,
                message: 'Ошибка расчета себестоимости'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка расчета себестоимости', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка расчета себестоимости',
            details: error.message
        });
    }
};
/**
 * Получить историю расчетов себестоимости
 */
CostCalculationController.getCostHistory = async (req, res) => {
    try {
        const { productId, limit } = req.query;
        const history = await costCalculationService_1.CostCalculationService.getCostHistory(productId, limit ? Number(limit) : 50);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения истории расчетов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения истории расчетов',
            details: error.message
        });
    }
};
/**
 * Сравнить варианты продукта
 */
CostCalculationController.compareProductVariants = async (req, res) => {
    try {
        const { productType, variants, quantity } = req.body;
        if (!productType || !variants || !Array.isArray(variants) || !quantity) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать productType, variants (массив) и quantity'
            });
            return;
        }
        const comparisons = await costCalculationService_1.CostCalculationService.compareProductVariants(productType, variants, Number(quantity));
        res.json({
            success: true,
            data: comparisons
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка сравнения вариантов продукта', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сравнения вариантов продукта',
            details: error.message
        });
    }
};
/**
 * Получить анализ прибыльности
 */
CostCalculationController.getProfitabilityAnalysis = async (req, res) => {
    try {
        const { productType, productVariant, quantity } = req.body;
        if (!productType || !productVariant || !quantity) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать productType, productVariant и quantity'
            });
            return;
        }
        const result = await costCalculationService_1.CostCalculationService.calculateProductCost(productType, productVariant, Number(quantity));
        if (!result.success) {
            res.status(400).json({
                success: false,
                error: 'Ошибка расчета себестоимости'
            });
            return;
        }
        const { breakdown } = result;
        // Анализ прибыльности
        const analysis = {
            profitability: {
                profit: breakdown.profit,
                profitMargin: breakdown.profitMargin,
                margin: breakdown.margin,
                isProfitable: breakdown.profit > 0,
                profitabilityLevel: breakdown.profitMargin > 30 ? 'high' :
                    breakdown.profitMargin > 15 ? 'medium' : 'low'
            },
            costBreakdown: {
                materialCost: breakdown.totalMaterialCost,
                serviceCost: breakdown.totalServiceCost,
                totalCost: breakdown.totalCost,
                materialPercentage: breakdown.totalCost > 0 ?
                    (breakdown.totalMaterialCost / breakdown.totalCost) * 100 : 0,
                servicePercentage: breakdown.totalCost > 0 ?
                    (breakdown.totalServiceCost / breakdown.totalCost) * 100 : 0
            },
            pricing: {
                sellingPrice: breakdown.sellingPrice,
                costPerUnit: breakdown.totalCost / Number(quantity),
                profitPerUnit: breakdown.profit / Number(quantity),
                recommendedPrice: breakdown.totalCost * 1.3, // 30% маржа
                minPrice: breakdown.totalCost * 1.1 // 10% маржа
            },
            recommendations: result.recommendations,
            warnings: result.warnings
        };
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка анализа прибыльности', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка анализа прибыльности',
            details: error.message
        });
    }
};
/**
 * Получить отчет по себестоимости
 */
CostCalculationController.getCostReport = async (req, res) => {
    try {
        const { startDate, endDate, productType } = req.query;
        // Здесь можно добавить логику для генерации отчета
        // Пока возвращаем базовую структуру
        const report = {
            period: {
                startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: endDate || new Date().toISOString()
            },
            summary: {
                totalProducts: 0,
                totalCost: 0,
                totalRevenue: 0,
                totalProfit: 0,
                averageMargin: 0
            },
            products: [],
            trends: {
                costTrend: 'stable',
                profitTrend: 'stable',
                marginTrend: 'stable'
            }
        };
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка генерации отчета', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка генерации отчета',
            details: error.message
        });
    }
};
