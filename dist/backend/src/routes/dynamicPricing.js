"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dynamicPricingController_1 = require("../controllers/dynamicPricingController");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
// Минимальные стоимости заказов
router.get('/minimum-order-costs', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getMinimumOrderCosts));
router.get('/minimum-order-costs/check', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getMinimumCostForOrder));
router.put('/minimum-order-costs/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateMinimumOrderCost));
// Базовые цены продуктов
router.get('/product-base-prices', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getProductBasePrices));
router.put('/product-base-prices/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateProductBasePrice));
// Цены на материалы
router.get('/material-prices', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getMaterialPrices));
router.put('/material-prices/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateMaterialPrice));
// Цены на услуги
router.get('/service-prices', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getServicePrices));
router.put('/service-prices/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateServicePrice));
// Коэффициенты ценообразования
router.get('/pricing-multipliers', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getPricingMultipliers));
router.put('/pricing-multipliers/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updatePricingMultiplier));
// Правила скидок
router.get('/discount-rules', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getDiscountRules));
router.put('/discount-rules/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateDiscountRule));
// Конфигурация ИИ-модели
router.get('/ai-model-config', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.getAIModelConfig));
router.put('/ai-model-config/:id', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.updateAIModelConfig));
// Экспорт данных ценообразования
router.get('/export', (0, asyncHandler_1.asyncHandler)(dynamicPricingController_1.DynamicPricingController.exportPricingData));
exports.default = router;
