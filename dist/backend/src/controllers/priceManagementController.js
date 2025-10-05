"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceManagementController = void 0;
const priceHistoryService_1 = require("../services/priceHistoryService");
const logger_1 = require("../utils/logger");
const asyncHandler_1 = require("../middleware/asyncHandler");
const db_1 = require("../db");
class PriceManagementController {
}
exports.PriceManagementController = PriceManagementController;
_a = PriceManagementController;
/**
 * Получить историю изменений цен
 */
PriceManagementController.getPriceHistory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 50, materialId } = req.query;
    try {
        const db = await (0, db_1.getDb)();
        let query = `
        SELECT 
          mph.*,
          m.name as material_name,
          u.name as changed_by_name
        FROM material_price_history mph
        LEFT JOIN materials m ON m.id = mph.material_id
        LEFT JOIN users u ON u.id = mph.changed_by
        WHERE 1=1
      `;
        const params = [];
        if (materialId) {
            query += ' AND mph.material_id = ?';
            params.push(materialId);
        }
        query += ' ORDER BY mph.created_at DESC LIMIT ?';
        params.push(parseInt(limit));
        const history = await db.all(query, ...params);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error getting price history', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get price history'
        });
    }
});
/**
 * Получить уведомления об изменениях цен
 */
PriceManagementController.getPriceNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 50, unreadOnly = false } = req.query;
    try {
        const notifications = await priceHistoryService_1.PriceHistoryService.getPriceChangeNotifications(parseInt(limit));
        let filteredNotifications = notifications;
        if (unreadOnly === 'true') {
            filteredNotifications = notifications.filter(n => !n.notification_sent);
        }
        res.json({
            success: true,
            data: filteredNotifications
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error getting price notifications', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get price notifications'
        });
    }
});
/**
 * Пересчитать цену товара
 */
PriceManagementController.recalculateItemPrice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    try {
        const result = await priceHistoryService_1.PriceHistoryService.recalculateItemPrice(parseInt(itemId));
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Item not found or could not be recalculated'
            });
        }
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error recalculating item price', error);
        res.status(500).json({
            success: false,
            error: 'Failed to recalculate item price'
        });
    }
});
/**
 * Получить аналитику по ценам
 */
PriceManagementController.getPriceAnalytics = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { period = '30' } = req.query; // дней
    try {
        const db = await (0, db_1.getDb)();
        // Статистика по изменениям цен
        const priceChanges = await db.all(`
        SELECT 
          COUNT(*) as total_changes,
          AVG(change_percent) as avg_change_percent,
          MAX(change_percent) as max_increase,
          MIN(change_percent) as max_decrease,
          COUNT(CASE WHEN change_percent > 0 THEN 1 END) as price_increases,
          COUNT(CASE WHEN change_percent < 0 THEN 1 END) as price_decreases
        FROM material_price_history
        WHERE created_at >= datetime('now', '-${period} days')
      `);
        // Статистика по затронутым заказам
        const affectedOrders = await db.all(`
        SELECT 
          COUNT(*) as total_notifications,
          SUM(affected_orders_count) as total_affected_orders,
          AVG(affected_orders_count) as avg_affected_orders
        FROM price_change_notifications
        WHERE created_at >= datetime('now', '-${period} days')
      `);
        // Топ материалов с наибольшими изменениями цен
        const topChanges = await db.all(`
        SELECT 
          m.name as material_name,
          mph.old_price,
          mph.new_price,
          mph.change_percent,
          mph.created_at
        FROM material_price_history mph
        LEFT JOIN materials m ON m.id = mph.material_id
        WHERE mph.created_at >= datetime('now', '-${period} days')
        ORDER BY ABS(mph.change_percent) DESC
        LIMIT 10
      `);
        // Статистика по маржинальности заказов
        const marginStats = await db.all(`
        SELECT 
          COUNT(*) as total_orders,
          AVG(i.price * i.quantity) as avg_order_value,
          COUNT(CASE WHEN i.pricing_calculated_at IS NOT NULL THEN 1 END) as orders_with_price_snapshots
        FROM items i
        JOIN orders o ON o.id = i.orderId
        WHERE o.created_at >= datetime('now', '-${period} days')
      `);
        const analytics = {
            priceChanges: priceChanges[0] || {},
            affectedOrders: affectedOrders[0] || {},
            topChanges,
            marginStats: marginStats[0] || {},
            period: `${period} days`
        };
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error getting price analytics', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get price analytics'
        });
    }
});
/**
 * Создать снимок текущих цен
 */
PriceManagementController.createPriceSnapshot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const snapshot = await priceHistoryService_1.PriceHistoryService.createPriceSnapshot();
        res.json({
            success: true,
            data: snapshot
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error creating price snapshot', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create price snapshot'
        });
    }
});
/**
 * Получить снимок цен для товара
 */
PriceManagementController.getItemPriceSnapshot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    try {
        const snapshot = await priceHistoryService_1.PriceHistoryService.getItemPriceSnapshot(parseInt(itemId));
        if (!snapshot) {
            return res.status(404).json({
                success: false,
                error: 'Price snapshot not found for this item'
            });
        }
        res.json({
            success: true,
            data: snapshot
        });
    }
    catch (error) {
        logger_1.logger.error('PriceManagementController', 'Error getting item price snapshot', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get item price snapshot'
        });
    }
});
