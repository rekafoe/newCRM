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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMaterialDeductionController = void 0;
const autoMaterialDeductionService_1 = require("../services/autoMaterialDeductionService");
const logger_1 = require("../utils/logger");
class AutoMaterialDeductionController {
}
exports.AutoMaterialDeductionController = AutoMaterialDeductionController;
_a = AutoMaterialDeductionController;
/**
 * Автоматическое списание материалов для заказа
 */
AutoMaterialDeductionController.deductForOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);
        const { items } = req.body;
        const authUser = req.user;
        if (!items || !Array.isArray(items)) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив товаров (items)'
            });
            return;
        }
        const result = await autoMaterialDeductionService_1.AutoMaterialDeductionService.deductMaterialsForOrder(orderId, items, authUser?.id);
        if (result.success) {
            res.json({
                success: true,
                data: result,
                message: `Списано материалов: ${result.deductedMaterials.length}`
            });
        }
        else {
            res.status(400).json({
                success: false,
                data: result,
                message: 'Ошибки при списании материалов'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка автоматического списания', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка автоматического списания материалов',
            details: error.message
        });
    }
};
/**
 * Получить историю списаний для заказа
 */
AutoMaterialDeductionController.getDeductionHistory = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);
        const history = await autoMaterialDeductionService_1.AutoMaterialDeductionService.getDeductionHistory(orderId);
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения истории списаний', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения истории списаний',
            details: error.message
        });
    }
};
/**
 * Отменить списание материалов
 */
AutoMaterialDeductionController.cancelDeduction = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);
        const authUser = req.user;
        const success = await autoMaterialDeductionService_1.AutoMaterialDeductionService.cancelDeduction(orderId, authUser?.id);
        if (success) {
            res.json({
                success: true,
                message: 'Списание материалов отменено'
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'Ошибка отмены списания'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка отмены списания', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка отмены списания',
            details: error.message
        });
    }
};
/**
 * Проверить доступность материалов для заказа
 */
AutoMaterialDeductionController.checkAvailability = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            res.status(400).json({
                success: false,
                error: 'Необходимо указать массив товаров (items)'
            });
            return;
        }
        // Собираем требования к материалам
        const materialRequirements = [];
        for (const item of items) {
            if (item.components && item.components.length > 0) {
                for (const component of item.components) {
                    materialRequirements.push({
                        materialId: component.materialId,
                        quantity: component.qtyPerItem * item.quantity,
                        reason: 'Проверка доступности'
                    });
                }
            }
        }
        // Группируем требования
        const groupedRequirements = new Map();
        for (const req of materialRequirements) {
            if (groupedRequirements.has(req.materialId)) {
                groupedRequirements.get(req.materialId).quantity += req.quantity;
            }
            else {
                groupedRequirements.set(req.materialId, { ...req });
            }
        }
        const requirements = Array.from(groupedRequirements.values());
        // Проверяем доступность
        const { getDb } = await Promise.resolve().then(() => __importStar(require('../config/database')));
        const db = await getDb();
        const warnings = [];
        const errors = [];
        for (const req of requirements) {
            const material = await db.get(`
          SELECT name, quantity, min_quantity 
          FROM materials 
          WHERE id = ?
        `, req.materialId);
            if (!material) {
                errors.push(`Материал с ID ${req.materialId} не найден`);
                continue;
            }
            const availableQuantity = material.quantity;
            const minQuantity = material.min_quantity || 0;
            const remainingAfterDeduction = availableQuantity - req.quantity;
            if (remainingAfterDeduction < 0) {
                errors.push(`Недостаточно материала "${material.name}". Доступно: ${availableQuantity}, требуется: ${req.quantity}`);
            }
            else if (remainingAfterDeduction < minQuantity) {
                warnings.push(`После списания материала "${material.name}" остаток будет ниже минимального (${minQuantity})`);
            }
        }
        res.json({
            success: errors.length === 0,
            data: {
                warnings,
                errors,
                requirements: requirements.map(req => ({
                    materialId: req.materialId,
                    requiredQuantity: req.quantity
                }))
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка проверки доступности', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка проверки доступности материалов',
            details: error.message
        });
    }
};
