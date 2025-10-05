"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedWarehouseController = void 0;
const unifiedWarehouseService_1 = require("../services/unifiedWarehouseService");
const logger_1 = require("../utils/logger");
class UnifiedWarehouseController {
}
exports.UnifiedWarehouseController = UnifiedWarehouseController;
_a = UnifiedWarehouseController;
// Получить все материалы с унифицированными данными
UnifiedWarehouseController.getAllMaterials = async (req, res) => {
    try {
        const materials = await unifiedWarehouseService_1.UnifiedWarehouseService.getAllMaterials();
        res.json({
            success: true,
            data: materials
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения материалов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения материалов',
            details: error.message
        });
    }
};
// Получить статистику склада
UnifiedWarehouseController.getWarehouseStats = async (req, res) => {
    try {
        const stats = await unifiedWarehouseService_1.UnifiedWarehouseService.getWarehouseStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения статистики склада', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения статистики склада',
            details: error.message
        });
    }
};
// Резервирование материалов
UnifiedWarehouseController.reserveMaterials = async (req, res) => {
    try {
        const { reservations } = req.body;
        if (!Array.isArray(reservations) || reservations.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив резерваций'
            });
            return;
        }
        const createdReservations = await unifiedWarehouseService_1.UnifiedWarehouseService.reserveMaterials(reservations);
        res.json({
            success: true,
            data: createdReservations
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка резервирования материалов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка резервирования материалов',
            details: error.message
        });
    }
};
// Подтверждение резервов
UnifiedWarehouseController.confirmReservations = async (req, res) => {
    try {
        const { reservationIds } = req.body;
        if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив ID резерваций'
            });
            return;
        }
        await unifiedWarehouseService_1.UnifiedWarehouseService.confirmReservations(reservationIds);
        res.json({
            success: true,
            message: 'Резервы подтверждены'
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка подтверждения резервов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка подтверждения резервов',
            details: error.message
        });
    }
};
// Отмена резервов
UnifiedWarehouseController.cancelReservations = async (req, res) => {
    try {
        const { reservationIds } = req.body;
        if (!Array.isArray(reservationIds) || reservationIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив ID резерваций'
            });
            return;
        }
        await unifiedWarehouseService_1.UnifiedWarehouseService.cancelReservations(reservationIds);
        res.json({
            success: true,
            message: 'Резервы отменены'
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка отмены резервов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка отмены резервов',
            details: error.message
        });
    }
};
// Получить резервы по заказу
UnifiedWarehouseController.getReservationsByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId || isNaN(Number(orderId))) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать корректный ID заказа'
            });
            return;
        }
        const reservations = await unifiedWarehouseService_1.UnifiedWarehouseService.getReservationsByOrder(Number(orderId));
        res.json({
            success: true,
            data: reservations
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения резервов по заказу', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения резервов по заказу',
            details: error.message
        });
    }
};
// Синхронизация с системой ценообразования
UnifiedWarehouseController.syncWithPricing = async (req, res) => {
    try {
        await unifiedWarehouseService_1.UnifiedWarehouseService.syncWithPricing();
        res.json({
            success: true,
            message: 'Синхронизация с системой ценообразования завершена'
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка синхронизации с ценообразованием', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка синхронизации с ценообразованием',
            details: error.message
        });
    }
};
