"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowStockNotificationController = void 0;
const lowStockNotificationService_1 = require("../services/lowStockNotificationService");
const logger_1 = require("../utils/logger");
class LowStockNotificationController {
}
exports.LowStockNotificationController = LowStockNotificationController;
_a = LowStockNotificationController;
/**
 * Проверить остатки и создать уведомления
 */
LowStockNotificationController.checkStockLevels = async (req, res) => {
    try {
        const result = await lowStockNotificationService_1.LowStockNotificationService.checkStockLevels();
        res.json({
            success: true,
            data: result,
            message: `Проверка завершена. Найдено уведомлений: ${result.totalAlerts}`
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка проверки остатков', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка проверки остатков материалов',
            details: error.message
        });
    }
};
/**
 * Получить все активные уведомления
 */
LowStockNotificationController.getActiveAlerts = async (req, res) => {
    try {
        const alerts = await lowStockNotificationService_1.LowStockNotificationService.getActiveAlerts();
        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения активных уведомлений', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения активных уведомлений',
            details: error.message
        });
    }
};
/**
 * Отметить уведомление как решенное
 */
LowStockNotificationController.resolveAlert = async (req, res) => {
    try {
        const alertId = Number(req.params.alertId);
        const authUser = req.user;
        if (!alertId || isNaN(alertId)) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать корректный ID уведомления'
            });
            return;
        }
        const success = await lowStockNotificationService_1.LowStockNotificationService.resolveAlert(alertId, authUser?.id);
        if (success) {
            res.json({
                success: true,
                message: 'Уведомление отмечено как решенное'
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: 'Не удалось отметить уведомление как решенное'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка отметки уведомления как решенного', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка отметки уведомления как решенного',
            details: error.message
        });
    }
};
/**
 * Автоматически решить уведомления
 */
LowStockNotificationController.autoResolveAlerts = async (req, res) => {
    try {
        const resolvedCount = await lowStockNotificationService_1.LowStockNotificationService.autoResolveAlerts();
        res.json({
            success: true,
            data: { resolvedCount },
            message: `Автоматически решено уведомлений: ${resolvedCount}`
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка автоматического решения уведомлений', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка автоматического решения уведомлений',
            details: error.message
        });
    }
};
/**
 * Получить статистику уведомлений
 */
LowStockNotificationController.getAlertStats = async (req, res) => {
    try {
        const stats = await lowStockNotificationService_1.LowStockNotificationService.getAlertStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения статистики уведомлений', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения статистики уведомлений',
            details: error.message
        });
    }
};
/**
 * Запланировать проверку остатков
 */
LowStockNotificationController.scheduleStockCheck = async (req, res) => {
    try {
        await lowStockNotificationService_1.LowStockNotificationService.scheduleStockCheck();
        res.json({
            success: true,
            message: 'Проверка остатков запланирована'
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка планирования проверки остатков', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка планирования проверки остатков',
            details: error.message
        });
    }
};
