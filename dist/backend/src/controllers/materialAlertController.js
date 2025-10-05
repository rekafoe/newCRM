"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialAlertController = void 0;
const services_1 = require("../services");
class MaterialAlertController {
    // Получить все уведомления
    static async getAllAlerts(req, res) {
        try {
            const { is_read, alert_type, material_id, limit, offset } = req.query;
            const alerts = await services_1.MaterialAlertService.getAllAlerts({
                is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
                alert_type: alert_type,
                material_id: material_id ? Number(material_id) : undefined,
                limit: limit ? Number(limit) : undefined,
                offset: offset ? Number(offset) : undefined
            });
            res.json(alerts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить непрочитанные уведомления
    static async getUnreadAlerts(req, res) {
        try {
            const alerts = await services_1.MaterialAlertService.getUnreadAlerts();
            res.json(alerts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Отметить уведомление как прочитанное
    static async markAsRead(req, res) {
        try {
            const user = req.user;
            const alertId = Number(req.params.id);
            await services_1.MaterialAlertService.markAsRead(alertId, user?.id);
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Отметить все уведомления как прочитанные
    static async markAllAsRead(req, res) {
        try {
            const user = req.user;
            await services_1.MaterialAlertService.markAllAsRead(user?.id);
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Удалить уведомление
    static async deleteAlert(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const alertId = Number(req.params.id);
            await services_1.MaterialAlertService.deleteAlert(alertId);
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Проверить и создать уведомления
    static async checkAlerts(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const newAlerts = await services_1.MaterialAlertService.checkLowStockAlerts();
            res.json({ created: newAlerts.length, alerts: newAlerts });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить статистику уведомлений
    static async getAlertStats(req, res) {
        try {
            const stats = await services_1.MaterialAlertService.getAlertStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.MaterialAlertController = MaterialAlertController;
