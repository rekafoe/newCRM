"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierAnalyticsService = void 0;
const database_1 = require("../config/database");
class SupplierAnalyticsService {
    /**
     * Получить полную аналитику поставщика
     */
    static async getSupplierAnalytics(supplierId) {
        const db = await (0, database_1.getDb)();
        // Получаем базовую информацию о поставщике
        const supplier = await db.get(`
      SELECT id, name FROM suppliers WHERE id = ?
    `, supplierId);
        if (!supplier) {
            throw new Error('Поставщик не найден');
        }
        // Получаем статистику поставок
        const deliveryStats = await this.getDeliveryStats(supplierId);
        // Получаем финансовую статистику
        const financialStats = await this.getFinancialStats(supplierId);
        // Получаем статистику использования
        const usageStats = await this.getUsageStats(supplierId);
        // Рассчитываем общий рейтинг
        const overallScore = this.calculateOverallScore(deliveryStats, financialStats, usageStats);
        // Генерируем рекомендации
        const recommendations = this.generateRecommendations(deliveryStats, financialStats, usageStats);
        return {
            supplier_id: supplierId,
            supplier_name: supplier.name,
            delivery_stats: deliveryStats,
            financial_stats: financialStats,
            usage_stats: usageStats,
            overall_score: overallScore,
            recommendations
        };
    }
    /**
     * Получить статистику поставок
     */
    static async getDeliveryStats(supplierId) {
        const db = await (0, database_1.getDb)();
        const stats = await db.get(`
      SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(mm.id) as total_deliveries,
        COALESCE(SUM(mm.delta), 0) as total_quantity,
        COALESCE(SUM(mm.delta * m.sheet_price_single), 0) as total_value,
        COALESCE(AVG(mm.delta * m.sheet_price_single), 0) as average_delivery_value,
        MAX(mm.created_at) as last_delivery_date,
        MIN(mm.created_at) as first_delivery_date
      FROM suppliers s
      LEFT JOIN materials m ON m.supplier_id = s.id
      LEFT JOIN material_moves mm ON mm.materialId = m.id AND mm.delta > 0
      WHERE s.id = ?
      GROUP BY s.id, s.name
    `, supplierId);
        // Рассчитываем частоту поставок
        let deliveryFrequencyDays = 0;
        if (stats.first_delivery_date && stats.last_delivery_date && stats.total_deliveries > 1) {
            const firstDate = new Date(stats.first_delivery_date);
            const lastDate = new Date(stats.last_delivery_date);
            const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
            deliveryFrequencyDays = Math.round(daysDiff / (stats.total_deliveries - 1));
        }
        // Рассчитываем рейтинг надежности (упрощенный)
        const reliabilityScore = stats.total_deliveries > 0 ? Math.min(100, stats.total_deliveries * 10) : 0;
        return {
            supplier_id: supplierId,
            supplier_name: stats.supplier_name,
            total_deliveries: stats.total_deliveries || 0,
            total_quantity: stats.total_quantity || 0,
            total_value: stats.total_value || 0,
            average_delivery_value: stats.average_delivery_value || 0,
            last_delivery_date: stats.last_delivery_date,
            first_delivery_date: stats.first_delivery_date,
            delivery_frequency_days: deliveryFrequencyDays,
            reliability_score: reliabilityScore
        };
    }
    /**
     * Получить финансовую статистику
     */
    static async getFinancialStats(supplierId) {
        const db = await (0, database_1.getDb)();
        const stats = await db.get(`
      SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COALESCE(SUM(mm.delta * m.sheet_price_single), 0) as total_spent,
        COALESCE(AVG(mm.delta * m.sheet_price_single), 0) as average_order_value,
        COALESCE(MAX(mm.delta * m.sheet_price_single), 0) as largest_delivery_value,
        COALESCE(MIN(mm.delta * m.sheet_price_single), 0) as smallest_delivery_value
      FROM suppliers s
      LEFT JOIN materials m ON m.supplier_id = s.id
      LEFT JOIN material_moves mm ON mm.materialId = m.id AND mm.delta > 0
      WHERE s.id = ?
      GROUP BY s.id, s.name
    `, supplierId);
        // Анализируем тренд цен (упрощенный)
        const priceTrend = await this.analyzePriceTrend(supplierId);
        return {
            supplier_id: supplierId,
            supplier_name: stats.supplier_name,
            total_spent: stats.total_spent || 0,
            average_order_value: stats.average_order_value || 0,
            largest_delivery_value: stats.largest_delivery_value || 0,
            smallest_delivery_value: stats.smallest_delivery_value || 0,
            price_trend: priceTrend.trend,
            price_change_percent: priceTrend.changePercent
        };
    }
    /**
     * Получить статистику использования
     */
    static async getUsageStats(supplierId) {
        const db = await (0, database_1.getDb)();
        const stats = await db.get(`
      SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(DISTINCT m.id) as materials_count
      FROM suppliers s
      LEFT JOIN materials m ON m.supplier_id = s.id
      WHERE s.id = ?
      GROUP BY s.id, s.name
    `, supplierId);
        // Получаем самый и наименее используемый материал
        const materialUsage = await db.all(`
      SELECT 
        m.name,
        COALESCE(SUM(ABS(mm.delta)), 0) as total_usage
      FROM materials m
      LEFT JOIN material_moves mm ON mm.materialId = m.id AND mm.delta < 0
      WHERE m.supplier_id = ?
      GROUP BY m.id, m.name
      ORDER BY total_usage DESC
    `, supplierId);
        const mostUsedMaterial = materialUsage[0]?.name || 'Нет данных';
        const leastUsedMaterial = materialUsage[materialUsage.length - 1]?.name || 'Нет данных';
        // Анализируем тренд потребления
        const consumptionTrend = await this.analyzeConsumptionTrend(supplierId);
        return {
            supplier_id: supplierId,
            supplier_name: stats.supplier_name,
            materials_count: stats.materials_count || 0,
            most_used_material: mostUsedMaterial,
            least_used_material: leastUsedMaterial,
            consumption_trend: consumptionTrend.trend,
            consumption_change_percent: consumptionTrend.changePercent,
            seasonal_pattern: false // Упрощенная реализация
        };
    }
    /**
     * Анализ тренда цен
     */
    static async analyzePriceTrend(supplierId) {
        const db = await (0, database_1.getDb)();
        // Получаем средние цены за последние 3 месяца и предыдущие 3 месяца
        const recentPrices = await db.all(`
      SELECT AVG(m.sheet_price_single) as avg_price
      FROM materials m
      JOIN material_moves mm ON mm.materialId = m.id AND mm.delta > 0
      WHERE m.supplier_id = ? 
        AND mm.created_at >= datetime('now', '-3 months')
      GROUP BY m.id
    `, supplierId);
        const previousPrices = await db.all(`
      SELECT AVG(m.sheet_price_single) as avg_price
      FROM materials m
      JOIN material_moves mm ON mm.materialId = m.id AND mm.delta > 0
      WHERE m.supplier_id = ? 
        AND mm.created_at >= datetime('now', '-6 months')
        AND mm.created_at < datetime('now', '-3 months')
      GROUP BY m.id
    `, supplierId);
        const recentAvg = recentPrices.reduce((sum, p) => sum + (p.avg_price || 0), 0) / recentPrices.length || 0;
        const previousAvg = previousPrices.reduce((sum, p) => sum + (p.avg_price || 0), 0) / previousPrices.length || 0;
        const changePercent = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
        let trend = 'stable';
        if (changePercent > 5)
            trend = 'increasing';
        else if (changePercent < -5)
            trend = 'decreasing';
        return { trend, changePercent };
    }
    /**
     * Анализ тренда потребления
     */
    static async analyzeConsumptionTrend(supplierId) {
        const db = await (0, database_1.getDb)();
        const recentConsumption = await db.get(`
      SELECT COALESCE(SUM(ABS(mm.delta)), 0) as total_consumption
      FROM materials m
      JOIN material_moves mm ON mm.materialId = m.id AND mm.delta < 0
      WHERE m.supplier_id = ? 
        AND mm.created_at >= datetime('now', '-1 month')
    `, supplierId);
        const previousConsumption = await db.get(`
      SELECT COALESCE(SUM(ABS(mm.delta)), 0) as total_consumption
      FROM materials m
      JOIN material_moves mm ON mm.materialId = m.id AND mm.delta < 0
      WHERE m.supplier_id = ? 
        AND mm.created_at >= datetime('now', '-2 months')
        AND mm.created_at < datetime('now', '-1 month')
    `, supplierId);
        const recent = recentConsumption?.total_consumption || 0;
        const previous = previousConsumption?.total_consumption || 0;
        const changePercent = previous > 0 ? ((recent - previous) / previous) * 100 : 0;
        let trend = 'stable';
        if (changePercent > 10)
            trend = 'increasing';
        else if (changePercent < -10)
            trend = 'decreasing';
        return { trend, changePercent };
    }
    /**
     * Рассчитать общий рейтинг поставщика
     */
    static calculateOverallScore(deliveryStats, financialStats, usageStats) {
        let score = 0;
        // Рейтинг надежности (40%)
        score += (deliveryStats.reliability_score * 0.4);
        // Стабильность цен (30%)
        const priceStability = financialStats.price_trend === 'stable' ? 100 :
            financialStats.price_trend === 'increasing' ? 60 : 80;
        score += (priceStability * 0.3);
        // Активность использования (30%)
        const usageActivity = Math.min(100, usageStats.materials_count * 10);
        score += (usageActivity * 0.3);
        return Math.round(score);
    }
    /**
     * Генерировать рекомендации
     */
    static generateRecommendations(deliveryStats, financialStats, usageStats) {
        const recommendations = [];
        if (deliveryStats.total_deliveries === 0) {
            recommendations.push('Поставщик не имеет истории поставок. Рекомендуется начать сотрудничество.');
        }
        if (deliveryStats.reliability_score < 50) {
            recommendations.push('Низкий рейтинг надежности. Рекомендуется найти альтернативных поставщиков.');
        }
        if (financialStats.price_trend === 'increasing') {
            recommendations.push('Цены растут. Рекомендуется пересмотреть условия договора или найти альтернативы.');
        }
        if (usageStats.consumption_trend === 'increasing') {
            recommendations.push('Потребление растет. Рекомендуется увеличить объемы закупок для лучших условий.');
        }
        if (deliveryStats.delivery_frequency_days > 30) {
            recommendations.push('Редкие поставки. Рекомендуется оптимизировать график закупок.');
        }
        if (recommendations.length === 0) {
            recommendations.push('Поставщик показывает хорошие результаты. Рекомендуется продолжить сотрудничество.');
        }
        return recommendations;
    }
    /**
     * Получить историю поставок поставщика
     */
    static async getSupplierDeliveryHistory(supplierId, limit = 50) {
        const db = await (0, database_1.getDb)();
        const deliveries = await db.all(`
      SELECT 
        mm.id,
        mm.materialId,
        m.name as material_name,
        mm.delta,
        mm.reason,
        mm.supplier_id,
        mm.delivery_number,
        mm.invoice_number,
        mm.delivery_date,
        mm.delivery_notes,
        mm.created_at,
        s.name as supplier_name
      FROM material_moves mm
      JOIN materials m ON m.id = mm.materialId
      JOIN suppliers s ON s.id = mm.supplier_id
      WHERE mm.supplier_id = ? AND mm.delta > 0
      ORDER BY mm.created_at DESC
      LIMIT ?
    `, supplierId, limit);
        return deliveries;
    }
}
exports.SupplierAnalyticsService = SupplierAnalyticsService;
