"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialReservationController = void 0;
const materialReservationService_1 = require("../services/materialReservationService");
class MaterialReservationController {
    constructor(database) {
        this.reservationService = new materialReservationService_1.MaterialReservationService(database);
    }
    /**
     * Создать резервирование материала
     */
    async createReservation(req, res) {
        try {
            const { material_id, order_id, quantity_reserved, expires_at, notes } = req.body;
            // Валидация
            if (!material_id || !quantity_reserved) {
                res.status(400).json({
                    success: false,
                    message: 'material_id и quantity_reserved обязательны'
                });
                return;
            }
            if (quantity_reserved <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Количество должно быть больше 0'
                });
                return;
            }
            const reservation = await this.reservationService.createReservation({
                material_id,
                order_id,
                quantity_reserved,
                expires_at,
                reserved_by: req.user?.id,
                notes
            });
            console.log(`✅ [MaterialReservationController] Created reservation ${reservation.id} for material ${material_id}`);
            res.status(201).json({
                success: true,
                data: reservation,
                message: 'Резервирование создано успешно'
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] createReservation error:', error);
            if (error.message.includes('Insufficient material')) {
                res.status(409).json({
                    success: false,
                    message: 'Недостаточно материала на складе',
                    details: error.message
                });
                return;
            }
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании резервирования',
                error: error.message
            });
        }
    }
    /**
     * Получить все резервирования
     */
    async getAllReservations(req, res) {
        try {
            const reservations = await this.reservationService.getAllReservations();
            res.json({
                success: true,
                data: reservations,
                count: reservations.length
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] getAllReservations error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении резервирований',
                error: error.message
            });
        }
    }
    /**
     * Получить резервирования по материалу
     */
    async getReservationsByMaterial(req, res) {
        try {
            const { materialId } = req.params;
            const material_id = parseInt(materialId);
            if (isNaN(material_id)) {
                res.status(400).json({
                    success: false,
                    message: 'Некорректный ID материала'
                });
                return;
            }
            const reservations = await this.reservationService.getReservationsByMaterial(material_id);
            res.json({
                success: true,
                data: reservations,
                count: reservations.length
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] getReservationsByMaterial error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении резервирований материала',
                error: error.message
            });
        }
    }
    /**
     * Обновить резервирование
     */
    async updateReservation(req, res) {
        try {
            const { id } = req.params;
            const reservationId = parseInt(id);
            const updates = req.body;
            if (isNaN(reservationId)) {
                res.status(400).json({
                    success: false,
                    message: 'Некорректный ID резервирования'
                });
                return;
            }
            const reservation = await this.reservationService.updateReservation(reservationId, updates, req.user?.id);
            console.log(`✅ [MaterialReservationController] Updated reservation ${reservationId}`);
            res.json({
                success: true,
                data: reservation,
                message: 'Резервирование обновлено успешно'
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] updateReservation error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при обновлении резервирования',
                error: error.message
            });
        }
    }
    /**
     * Отменить резервирование
     */
    async cancelReservation(req, res) {
        try {
            const { id } = req.params;
            const reservationId = parseInt(id);
            const { reason } = req.body;
            if (isNaN(reservationId)) {
                res.status(400).json({
                    success: false,
                    message: 'Некорректный ID резервирования'
                });
                return;
            }
            await this.reservationService.cancelReservation(reservationId, reason, req.user?.id);
            console.log(`✅ [MaterialReservationController] Cancelled reservation ${reservationId}`);
            res.json({
                success: true,
                message: 'Резервирование отменено успешно'
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] cancelReservation error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при отмене резервирования',
                error: error.message
            });
        }
    }
    /**
     * Выполнить резервирование (списать со склада)
     */
    async fulfillReservation(req, res) {
        try {
            const { id } = req.params;
            const reservationId = parseInt(id);
            if (isNaN(reservationId)) {
                res.status(400).json({
                    success: false,
                    message: 'Некорректный ID резервирования'
                });
                return;
            }
            await this.reservationService.fulfillReservation(reservationId, req.user?.id);
            console.log(`✅ [MaterialReservationController] Fulfilled reservation ${reservationId}`);
            res.json({
                success: true,
                message: 'Резервирование выполнено успешно'
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] fulfillReservation error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при выполнении резервирования',
                error: error.message
            });
        }
    }
    /**
     * Получить доступное количество материала
     */
    async getAvailableQuantity(req, res) {
        try {
            const { materialId } = req.params;
            const material_id = parseInt(materialId);
            if (isNaN(material_id)) {
                res.status(400).json({
                    success: false,
                    message: 'Некорректный ID материала'
                });
                return;
            }
            const availableQuantity = await this.reservationService.getAvailableQuantity(material_id);
            res.json({
                success: true,
                data: {
                    material_id,
                    available_quantity: availableQuantity
                }
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] getAvailableQuantity error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении доступного количества',
                error: error.message
            });
        }
    }
    /**
     * Очистить истекшие резервирования
     */
    async cleanupExpiredReservations(req, res) {
        try {
            const expiredCount = await this.reservationService.cleanupExpiredReservations();
            console.log(`🧹 [MaterialReservationController] Cleaned up ${expiredCount} expired reservations`);
            res.json({
                success: true,
                data: {
                    expired_count: expiredCount
                },
                message: `Очищено ${expiredCount} истекших резервирований`
            });
        }
        catch (error) {
            console.error('❌ [MaterialReservationController] cleanupExpiredReservations error:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при очистке истекших резервирований',
                error: error.message
            });
        }
    }
}
exports.MaterialReservationController = MaterialReservationController;
