"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierAnalyticsController = void 0;
const supplierAnalyticsService_1 = require("../services/supplierAnalyticsService");
class SupplierAnalyticsController {
    /**
     * Получить полную аналитику поставщика
     */
    static async getSupplierAnalytics(req, res) {
        try {
            const { id } = req.params;
            const supplierId = parseInt(id);
            if (isNaN(supplierId)) {
                res.status(400).json({ error: 'Неверный ID поставщика' });
                return;
            }
            const analytics = await supplierAnalyticsService_1.SupplierAnalyticsService.getSupplierAnalytics(supplierId);
            res.json(analytics);
        }
        catch (error) {
            console.error('Ошибка получения аналитики поставщика:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    /**
     * Получить историю поставок поставщика
     */
    static async getSupplierDeliveryHistory(req, res) {
        try {
            const { id } = req.params;
            const { limit = 50 } = req.query;
            const supplierId = parseInt(id);
            const limitNum = parseInt(limit);
            if (isNaN(supplierId)) {
                res.status(400).json({ error: 'Неверный ID поставщика' });
                return;
            }
            const history = await supplierAnalyticsService_1.SupplierAnalyticsService.getSupplierDeliveryHistory(supplierId, isNaN(limitNum) ? 50 : limitNum);
            res.json(history);
        }
        catch (error) {
            console.error('Ошибка получения истории поставок:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
    /**
     * Получить сравнительную аналитику всех поставщиков
     */
    static async getSuppliersComparison(req, res) {
        try {
            // Получаем список всех активных поставщиков
            const db = await Promise.resolve().then(() => __importStar(require('../config/database'))).then(m => m.getDb());
            const suppliers = await db.all(`
        SELECT id, name FROM suppliers WHERE is_active = 1
      `);
            // Получаем аналитику для каждого поставщика
            const comparison = await Promise.all(suppliers.map(async (supplier) => {
                try {
                    const analytics = await supplierAnalyticsService_1.SupplierAnalyticsService.getSupplierAnalytics(supplier.id);
                    return {
                        supplier_id: supplier.id,
                        supplier_name: supplier.name,
                        overall_score: analytics.overall_score,
                        total_deliveries: analytics.delivery_stats.total_deliveries,
                        total_value: analytics.delivery_stats.total_value,
                        reliability_score: analytics.delivery_stats.reliability_score,
                        price_trend: analytics.financial_stats.price_trend,
                        materials_count: analytics.usage_stats.materials_count
                    };
                }
                catch (error) {
                    console.error(`Ошибка получения аналитики для поставщика ${supplier.id}:`, error);
                    return {
                        supplier_id: supplier.id,
                        supplier_name: supplier.name,
                        overall_score: 0,
                        total_deliveries: 0,
                        total_value: 0,
                        reliability_score: 0,
                        price_trend: 'stable',
                        materials_count: 0
                    };
                }
            }));
            // Сортируем по общему рейтингу
            comparison.sort((a, b) => b.overall_score - a.overall_score);
            res.json(comparison);
        }
        catch (error) {
            console.error('Ошибка получения сравнительной аналитики:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }
}
exports.SupplierAnalyticsController = SupplierAnalyticsController;
