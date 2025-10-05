"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicPricingController = void 0;
const asyncHandler_1 = require("../middleware/asyncHandler");
const dynamicPricingService_1 = require("../services/dynamicPricingService");
const logger_1 = require("../utils/logger");
class DynamicPricingController {
}
exports.DynamicPricingController = DynamicPricingController;
_a = DynamicPricingController;
// Получение минимальных стоимостей заказов
DynamicPricingController.getMinimumOrderCosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const costs = await dynamicPricingService_1.DynamicPricingService.getMinimumOrderCosts();
        res.json({
            success: true,
            data: costs
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения минимальных стоимостей заказов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения минимальных стоимостей заказов',
            details: error.message
        });
    }
});
// Получение минимальной стоимости для конкретного заказа
DynamicPricingController.getMinimumCostForOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { format, productType, quantity } = req.query;
        if (!format || !productType || !quantity) {
            res.status(400).json({
                success: false,
                error: 'Необходимы параметры: format, productType, quantity'
            });
            return;
        }
        const cost = await dynamicPricingService_1.DynamicPricingService.getMinimumCostForOrder(format, productType, parseInt(quantity));
        res.json({
            success: true,
            data: cost
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения минимальной стоимости заказа', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения минимальной стоимости заказа',
            details: error.message
        });
    }
});
// Получение базовых цен продуктов
DynamicPricingController.getProductBasePrices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { productType, format, urgency } = req.query;
        const filters = {};
        if (productType)
            filters.productType = productType;
        if (format)
            filters.format = format;
        if (urgency)
            filters.urgency = urgency;
        const prices = await dynamicPricingService_1.DynamicPricingService.getProductBasePrices(filters);
        res.json({
            success: true,
            data: prices
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения базовых цен продуктов', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения базовых цен продуктов',
            details: error.message
        });
    }
});
// Получение цен на материалы
DynamicPricingController.getMaterialPrices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const prices = await dynamicPricingService_1.DynamicPricingService.getMaterialPrices();
        res.json({
            success: true,
            data: prices
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения цен на материалы', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения цен на материалы',
            details: error.message
        });
    }
});
// Получение цен на услуги
DynamicPricingController.getServicePrices = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const prices = await dynamicPricingService_1.DynamicPricingService.getServicePrices();
        res.json({
            success: true,
            data: prices
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения цен на услуги', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения цен на услуги',
            details: error.message
        });
    }
});
// Получение коэффициентов ценообразования
DynamicPricingController.getPricingMultipliers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { multiplierType } = req.query;
        const multipliers = await dynamicPricingService_1.DynamicPricingService.getPricingMultipliers(multiplierType);
        res.json({
            success: true,
            data: multipliers
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения коэффициентов ценообразования', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения коэффициентов ценообразования',
            details: error.message
        });
    }
});
// Получение правил скидок
DynamicPricingController.getDiscountRules = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { discountType } = req.query;
        const rules = await dynamicPricingService_1.DynamicPricingService.getDiscountRules(discountType);
        res.json({
            success: true,
            data: rules
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения правил скидок', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения правил скидок',
            details: error.message
        });
    }
});
// Получение конфигурации ИИ-модели
DynamicPricingController.getAIModelConfig = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { modelName } = req.query;
        const config = await dynamicPricingService_1.DynamicPricingService.getAIModelConfig(modelName);
        res.json({
            success: true,
            data: config
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка получения конфигурации ИИ-модели', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка получения конфигурации ИИ-модели',
            details: error.message
        });
    }
});
// Обновление минимальной стоимости заказа
DynamicPricingController.updateMinimumOrderCost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateMinimumOrderCost(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Минимальная стоимость заказа обновлена'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Минимальная стоимость заказа не найдена'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления минимальной стоимости заказа', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления минимальной стоимости заказа',
            details: error.message
        });
    }
});
// Обновление базовой цены продукта
DynamicPricingController.updateProductBasePrice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateProductBasePrice(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Базовая цена продукта обновлена'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Базовая цена продукта не найдена'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления базовой цены продукта', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления базовой цены продукта',
            details: error.message
        });
    }
});
// Обновление цены материала
DynamicPricingController.updateMaterialPrice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateMaterialPrice(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Цена материала обновлена'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Цена материала не найдена'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления цены материала', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления цены материала',
            details: error.message
        });
    }
});
// Обновление цены услуги
DynamicPricingController.updateServicePrice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateServicePrice(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Цена услуги обновлена'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Цена услуги не найдена'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления цены услуги', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления цены услуги',
            details: error.message
        });
    }
});
// Обновление коэффициента ценообразования
DynamicPricingController.updatePricingMultiplier = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updatePricingMultiplier(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Коэффициент ценообразования обновлен'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Коэффициент ценообразования не найден'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления коэффициента ценообразования', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления коэффициента ценообразования',
            details: error.message
        });
    }
});
// Обновление правила скидки
DynamicPricingController.updateDiscountRule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateDiscountRule(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Правило скидки обновлено'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Правило скидки не найдено'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления правила скидки', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления правила скидки',
            details: error.message
        });
    }
});
// Обновление конфигурации ИИ-модели
DynamicPricingController.updateAIModelConfig = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const success = await dynamicPricingService_1.DynamicPricingService.updateAIModelConfig(parseInt(id), updates);
        if (success) {
            res.json({
                success: true,
                message: 'Конфигурация ИИ-модели обновлена'
            });
        }
        else {
            res.status(404).json({
                success: false,
                error: 'Конфигурация ИИ-модели не найдена'
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Ошибка обновления конфигурации ИИ-модели', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка обновления конфигурации ИИ-модели',
            details: error.message
        });
    }
});
// Экспорт всех данных ценообразования
DynamicPricingController.exportPricingData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const data = await dynamicPricingService_1.DynamicPricingService.exportPricingData();
        res.json({
            success: true,
            data
        });
    }
    catch (error) {
        logger_1.logger.error('Ошибка экспорта данных ценообразования', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка экспорта данных ценообразования',
            details: error.message
        });
    }
});
