"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMaterialDeductionService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const warehouseTransactionService_1 = require("./warehouseTransactionService");
class AutoMaterialDeductionService {
    /**
     * Автоматическое списание материалов при создании заказа
     */
    static async deductMaterialsForOrder(orderId, items, userId) {
        const result = {
            success: true,
            deductedMaterials: [],
            warnings: [],
            errors: []
        };
        try {
            const db = await (0, database_1.getDb)();
            // Собираем все требования к материалам
            const materialRequirements = [];
            for (const item of items) {
                if (item.components && item.components.length > 0) {
                    // Если есть явно указанные компоненты
                    for (const component of item.components) {
                        const totalQuantity = component.qtyPerItem * item.quantity;
                        materialRequirements.push({
                            materialId: component.materialId,
                            quantity: totalQuantity,
                            reason: `Автоматическое списание для заказа ${orderId}`,
                            orderId,
                            userId
                        });
                    }
                }
                else {
                    // Пытаемся найти материалы по типу товара
                    const presetMaterials = await this.getMaterialsForProductType(item.type, item.params);
                    for (const material of presetMaterials) {
                        const totalQuantity = material.qtyPerItem * item.quantity;
                        materialRequirements.push({
                            materialId: material.materialId,
                            quantity: totalQuantity,
                            reason: `Автоматическое списание для заказа ${orderId}`,
                            orderId,
                            userId
                        });
                    }
                }
            }
            // Группируем требования по материалам
            const groupedRequirements = this.groupMaterialRequirements(materialRequirements);
            // Проверяем доступность материалов
            const availabilityCheck = await this.checkMaterialAvailability(groupedRequirements);
            if (!availabilityCheck.success) {
                result.success = false;
                result.errors = availabilityCheck.errors;
                return result;
            }
            // Добавляем предупреждения
            result.warnings = availabilityCheck.warnings;
            // Выполняем списание материалов
            for (const requirement of groupedRequirements) {
                try {
                    const material = await db.get('SELECT name FROM materials WHERE id = ?', requirement.materialId);
                    await warehouseTransactionService_1.WarehouseTransactionService.spendMaterial(requirement.materialId, requirement.quantity, requirement.reason, requirement.orderId, requirement.userId);
                    result.deductedMaterials.push({
                        materialId: requirement.materialId,
                        quantity: requirement.quantity,
                        materialName: material?.name || `Материал ID ${requirement.materialId}`
                    });
                    logger_1.logger.info('Материал списан автоматически', {
                        materialId: requirement.materialId,
                        quantity: requirement.quantity,
                        orderId
                    });
                }
                catch (error) {
                    logger_1.logger.error('Ошибка списания материала', error);
                    result.errors.push(`Ошибка списания материала ID ${requirement.materialId}: ${error.message}`);
                }
            }
            logger_1.logger.info('Автоматическое списание материалов завершено', {
                orderId,
                deductedCount: result.deductedMaterials.length,
                warningsCount: result.warnings.length,
                errorsCount: result.errors.length
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка автоматического списания материалов', error);
            result.success = false;
            result.errors.push(`Общая ошибка: ${error.message}`);
        }
        return result;
    }
    /**
     * Получить материалы для типа продукта
     */
    static async getMaterialsForProductType(productType, params) {
        const db = await (0, database_1.getDb)();
        try {
            // Пытаемся найти материалы по типу продукта
            const materials = await db.all(`
        SELECT materialId, qtyPerItem 
        FROM product_materials 
        WHERE presetCategory = ? AND presetDescription = ?
      `, productType, params.description || '');
            return materials.map((m) => ({
                materialId: m.materialId,
                qtyPerItem: m.qtyPerItem
            }));
        }
        catch (error) {
            logger_1.logger.warn('Не удалось найти материалы для типа продукта', {
                productType,
                error: error.message
            });
            return [];
        }
    }
    /**
     * Группировать требования по материалам
     */
    static groupMaterialRequirements(requirements) {
        const grouped = new Map();
        for (const req of requirements) {
            if (grouped.has(req.materialId)) {
                grouped.get(req.materialId).quantity += req.quantity;
            }
            else {
                grouped.set(req.materialId, { ...req });
            }
        }
        return Array.from(grouped.values());
    }
    /**
     * Проверить доступность материалов
     */
    static async checkMaterialAvailability(requirements) {
        const db = await (0, database_1.getDb)();
        const warnings = [];
        const errors = [];
        for (const req of requirements) {
            try {
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
            catch (error) {
                errors.push(`Ошибка проверки материала ID ${req.materialId}: ${error.message}`);
            }
        }
        return {
            success: errors.length === 0,
            warnings,
            errors
        };
    }
    /**
     * Получить историю автоматических списаний
     */
    static async getDeductionHistory(orderId) {
        const db = await (0, database_1.getDb)();
        try {
            const history = await db.all(`
        SELECT 
          mm.id,
          mm.materialId,
          m.name as materialName,
          mm.delta,
          mm.reason,
          mm.created_at,
          u.name as userName
        FROM material_moves mm
        LEFT JOIN materials m ON m.id = mm.materialId
        LEFT JOIN users u ON u.id = mm.user_id
        WHERE mm.orderId = ? AND mm.delta < 0
        ORDER BY mm.created_at DESC
      `, orderId);
            return history;
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения истории списаний', error);
            return [];
        }
    }
    /**
     * Отменить автоматическое списание (возврат материалов)
     */
    static async cancelDeduction(orderId, userId) {
        try {
            const db = await (0, database_1.getDb)();
            // Получаем все списания по заказу
            const deductions = await db.all(`
        SELECT materialId, ABS(delta) as quantity
        FROM material_moves
        WHERE orderId = ? AND delta < 0
      `, orderId);
            if (deductions.length === 0) {
                logger_1.logger.warn('Нет списаний для отмены', { orderId });
                return true;
            }
            // Возвращаем материалы
            for (const deduction of deductions) {
                await warehouseTransactionService_1.WarehouseTransactionService.addMaterial(deduction.materialId, deduction.quantity, `Отмена списания для заказа ${orderId}`, orderId, userId);
            }
            logger_1.logger.info('Автоматическое списание отменено', {
                orderId,
                returnedMaterials: deductions.length
            });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Ошибка отмены списания', error);
            return false;
        }
    }
}
exports.AutoMaterialDeductionService = AutoMaterialDeductionService;
