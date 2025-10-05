"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const telegramService_1 = require("../services/telegramService");
const stockMonitoringService_1 = require("../services/stockMonitoringService");
const autoOrderService_1 = require("../services/autoOrderService");
class NotificationController {
    /**
     * Тестовая отправка уведомления в Telegram
     */
    static async sendTestNotification(req, res) {
        try {
            const success = await telegramService_1.TelegramService.sendTestMessage();
            if (success) {
                res.json({
                    success: true,
                    message: 'Тестовое уведомление отправлено успешно'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Не удалось отправить тестовое уведомление'
                });
            }
        }
        catch (error) {
            console.error('❌ Error sending test notification:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка отправки уведомления',
                error: error.message
            });
        }
    }
    /**
     * Настройка Telegram бота
     */
    static async configureTelegram(req, res) {
        try {
            const { botToken, chatId, enabled } = req.body;
            if (!botToken || !chatId) {
                return res.status(400).json({
                    success: false,
                    message: 'Требуются botToken и chatId'
                });
            }
            telegramService_1.TelegramService.initialize({
                botToken,
                chatId,
                enabled: enabled !== false
            });
            res.json({
                success: true,
                message: 'Конфигурация Telegram обновлена'
            });
        }
        catch (error) {
            console.error('❌ Error configuring Telegram:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка настройки Telegram',
                error: error.message
            });
        }
    }
    /**
     * Получение активных предупреждений о запасах
     */
    static async getStockAlerts(req, res) {
        try {
            const alerts = await stockMonitoringService_1.StockMonitoringService.getActiveAlerts();
            res.json({
                success: true,
                data: alerts
            });
        }
        catch (error) {
            console.error('❌ Error getting stock alerts:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения предупреждений',
                error: error.message
            });
        }
    }
    /**
     * Отметка предупреждения как решенного
     */
    static async resolveStockAlert(req, res) {
        try {
            const { alertId } = req.params;
            await stockMonitoringService_1.StockMonitoringService.resolveAlert(parseInt(alertId));
            res.json({
                success: true,
                message: 'Предупреждение отмечено как решенное'
            });
        }
        catch (error) {
            console.error('❌ Error resolving stock alert:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления предупреждения',
                error: error.message
            });
        }
    }
    /**
     * Ручная проверка запасов
     */
    static async checkStockLevels(req, res) {
        try {
            const alerts = await stockMonitoringService_1.StockMonitoringService.checkStockLevels();
            res.json({
                success: true,
                message: `Проверка завершена. Найдено ${alerts.length} предупреждений`,
                data: alerts
            });
        }
        catch (error) {
            console.error('❌ Error checking stock levels:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка проверки запасов',
                error: error.message
            });
        }
    }
    /**
     * Получение конфигурации мониторинга запасов
     */
    static async getStockMonitoringConfig(req, res) {
        try {
            const config = stockMonitoringService_1.StockMonitoringService.getConfig();
            res.json({
                success: true,
                data: config
            });
        }
        catch (error) {
            console.error('❌ Error getting stock monitoring config:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения конфигурации',
                error: error.message
            });
        }
    }
    /**
     * Обновление конфигурации мониторинга запасов
     */
    static async updateStockMonitoringConfig(req, res) {
        try {
            const config = req.body;
            stockMonitoringService_1.StockMonitoringService.updateConfig(config);
            res.json({
                success: true,
                message: 'Конфигурация мониторинга обновлена'
            });
        }
        catch (error) {
            console.error('❌ Error updating stock monitoring config:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления конфигурации',
                error: error.message
            });
        }
    }
    /**
     * Создание автоматического заказа
     */
    static async createAutoOrder(req, res) {
        try {
            const { materialIds } = req.body;
            const order = await autoOrderService_1.AutoOrderService.createAutoOrder(materialIds);
            if (order) {
                res.json({
                    success: true,
                    message: 'Автоматический заказ создан',
                    data: order
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Нет материалов для автоматического заказа'
                });
            }
        }
        catch (error) {
            console.error('❌ Error creating auto order:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка создания автоматического заказа',
                error: error.message
            });
        }
    }
    /**
     * Получение автоматических заказов
     */
    static async getAutoOrders(req, res) {
        try {
            const { status } = req.query;
            const orders = await autoOrderService_1.AutoOrderService.getAutoOrders(status);
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            console.error('❌ Error getting auto orders:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения автоматических заказов',
                error: error.message
            });
        }
    }
    /**
     * Одобрение автоматического заказа
     */
    static async approveAutoOrder(req, res) {
        try {
            const { orderId } = req.params;
            await autoOrderService_1.AutoOrderService.approveOrder(parseInt(orderId));
            res.json({
                success: true,
                message: 'Заказ одобрен'
            });
        }
        catch (error) {
            console.error('❌ Error approving auto order:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка одобрения заказа',
                error: error.message
            });
        }
    }
    /**
     * Отправка заказа поставщику
     */
    static async sendAutoOrder(req, res) {
        try {
            const { orderId } = req.params;
            await autoOrderService_1.AutoOrderService.sendOrder(parseInt(orderId));
            res.json({
                success: true,
                message: 'Заказ отправлен поставщику'
            });
        }
        catch (error) {
            console.error('❌ Error sending auto order:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка отправки заказа',
                error: error.message
            });
        }
    }
    /**
     * Отметка заказа как доставленного
     */
    static async markAutoOrderDelivered(req, res) {
        try {
            const { orderId } = req.params;
            await autoOrderService_1.AutoOrderService.markAsDelivered(parseInt(orderId));
            res.json({
                success: true,
                message: 'Заказ отмечен как доставленный'
            });
        }
        catch (error) {
            console.error('❌ Error marking auto order as delivered:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления статуса заказа',
                error: error.message
            });
        }
    }
    /**
     * Получение конфигурации автоматических заказов
     */
    static async getAutoOrderConfig(req, res) {
        try {
            const config = autoOrderService_1.AutoOrderService.getConfig();
            res.json({
                success: true,
                data: config
            });
        }
        catch (error) {
            console.error('❌ Error getting auto order config:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка получения конфигурации',
                error: error.message
            });
        }
    }
    /**
     * Обновление конфигурации автоматических заказов
     */
    static async updateAutoOrderConfig(req, res) {
        try {
            const config = req.body;
            autoOrderService_1.AutoOrderService.updateConfig(config);
            res.json({
                success: true,
                message: 'Конфигурация автоматических заказов обновлена'
            });
        }
        catch (error) {
            console.error('❌ Error updating auto order config:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка обновления конфигурации',
                error: error.message
            });
        }
    }
}
exports.NotificationController = NotificationController;
