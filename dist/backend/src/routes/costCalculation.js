"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const costCalculationController_1 = require("../controllers/costCalculationController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(middleware_1.authenticate);
// Рассчитать себестоимость товара
router.post('/calculate', (0, middleware_1.asyncHandler)(costCalculationController_1.CostCalculationController.calculateProductCost));
// Получить историю расчетов
router.get('/history', (0, middleware_1.asyncHandler)(costCalculationController_1.CostCalculationController.getCostHistory));
// Сравнить варианты продукта
router.post('/compare', (0, middleware_1.asyncHandler)(costCalculationController_1.CostCalculationController.compareProductVariants));
// Анализ прибыльности
router.post('/profitability', (0, middleware_1.asyncHandler)(costCalculationController_1.CostCalculationController.getProfitabilityAnalysis));
// Отчет по себестоимости
router.get('/report', (0, middleware_1.asyncHandler)(costCalculationController_1.CostCalculationController.getCostReport));
exports.default = router;
