"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseTransactionController = void 0;
const warehouseTransactionService_1 = require("../services/warehouseTransactionService");
const logger_1 = require("../utils/logger");
class WarehouseTransactionController {
}
exports.WarehouseTransactionController = WarehouseTransactionController;
_a = WarehouseTransactionController;
// Выполнить транзакцию
WarehouseTransactionController.executeTransaction = async (req, res) => {
    try {
        const { operations } = req.body;
        if (!Array.isArray(operations) || operations.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив операций'
            });
            return;
        }
        const results = await warehouseTransactionService_1.WarehouseTransactionService.executeTransaction(operations);
        res.json({
            success: true,
            data: results
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка выполнения транзакции', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка выполнения транзакции',
            details: error.message
        });
    }
};
// Безопасное списание материалов
WarehouseTransactionController.spendMaterial = async (req, res) => {
    try {
        const { materialId, quantity, reason, orderId, userId } = req.body;
        if (!materialId || !quantity || !reason) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать materialId, quantity и reason'
            });
            return;
        }
        const result = await warehouseTransactionService_1.WarehouseTransactionService.spendMaterial(materialId, quantity, reason, orderId, userId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка списания материала', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка списания материала',
            details: error.message
        });
    }
};
// Безопасное добавление материалов
WarehouseTransactionController.addMaterial = async (req, res) => {
    try {
        const { materialId, quantity, reason, orderId, userId } = req.body;
        if (!materialId || !quantity || !reason) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать materialId, quantity и reason'
            });
            return;
        }
        const result = await warehouseTransactionService_1.WarehouseTransactionService.addMaterial(materialId, quantity, reason, orderId, userId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка добавления материала', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка добавления материала',
            details: error.message
        });
    }
};
// Безопасная корректировка остатков
WarehouseTransactionController.adjustStock = async (req, res) => {
    try {
        const { materialId, newQuantity, reason, userId } = req.body;
        if (!materialId || newQuantity === undefined || !reason) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать materialId, newQuantity и reason'
            });
            return;
        }
        const result = await warehouseTransactionService_1.WarehouseTransactionService.adjustStock(materialId, newQuantity, reason, userId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка корректировки остатков', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка корректировки остатков',
            details: error.message
        });
    }
};
// Резервирование материалов
WarehouseTransactionController.reserveMaterials = async (req, res) => {
    try {
        const { reservations } = req.body;
        if (!Array.isArray(reservations) || reservations.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив резерваций'
            });
            return;
        }
        const results = await warehouseTransactionService_1.WarehouseTransactionService.reserveMaterials(reservations);
        res.json({
            success: true,
            data: results
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
// Отмена резерва
WarehouseTransactionController.unreserveMaterials = async (req, res) => {
    try {
        const { materialIds, orderId } = req.body;
        if (!Array.isArray(materialIds) || !orderId) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать materialIds и orderId'
            });
            return;
        }
        const results = await warehouseTransactionService_1.WarehouseTransactionService.unreserveMaterials(materialIds, orderId);
        res.json({
            success: true,
            data: results
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка отмены резерва', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка отмены резерва',
            details: error.message
        });
    }
};
// Проверка доступности материалов
WarehouseTransactionController.checkAvailability = async (req, res) => {
    try {
        const { materialRequirements } = req.body;
        if (!Array.isArray(materialRequirements) || materialRequirements.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив требований к материалам'
            });
            return;
        }
        const result = await warehouseTransactionService_1.WarehouseTransactionService.checkAvailability(materialRequirements);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка проверки доступности', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка проверки доступности',
            details: error.message
        });
    }
};
// Получение истории операций
WarehouseTransactionController.getOperationHistory = async (req, res) => {
    try {
        const { materialId, orderId, limit } = req.query;
        const results = await warehouseTransactionService_1.WarehouseTransactionService.getOperationHistory(materialId ? Number(materialId) : undefined, orderId ? Number(orderId) : undefined, limit ? Number(limit) : 100);
        res.json({
            success: true,
            data: results
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения истории операций', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения истории операций',
            details: error.message
        });
    }
};
