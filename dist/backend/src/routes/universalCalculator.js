"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/universal-calculator/config - получить конфигурацию калькулятора
router.get('/config', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.getCalculatorConfig));
// GET /api/universal-calculator/product-types - получить все типы продуктов
router.get('/product-types', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.getProductTypes));
// GET /api/universal-calculator/products/:productType - получить продукты по типу
router.get('/products/:productType', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.getProductsByType));
// GET /api/universal-calculator/rules - получить все правила
router.get('/rules', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.getAllRules));
// POST /api/universal-calculator/calculate - рассчитать стоимость продукта
router.post('/calculate', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.calculateProductCost));
// POST /api/universal-calculator/rules - создать или обновить правило
router.post('/rules', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.createOrUpdateRule));
// PUT /api/universal-calculator/rules/:id - обновить правило
router.put('/rules/:id', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.createOrUpdateRule));
// DELETE /api/universal-calculator/rules/:id - удалить правило
router.delete('/rules/:id', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.deleteRule));
// POST /api/universal-calculator/clone-rules - клонировать правила
router.post('/clone-rules', (0, middleware_1.asyncHandler)(controllers_1.UniversalCalculatorController.cloneRules));
exports.default = router;
