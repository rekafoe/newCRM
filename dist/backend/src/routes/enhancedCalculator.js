"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enhancedCalculatorController_1 = require("../controllers/enhancedCalculatorController");
const router = (0, express_1.Router)();
// Расчет цен для листовок
router.post('/flyers', enhancedCalculatorController_1.EnhancedCalculatorController.calculateFlyersPrice);
// Расчет цен для визиток
router.post('/business-cards', enhancedCalculatorController_1.EnhancedCalculatorController.calculateBusinessCardsPrice);
// Расчет цен для буклетов
router.post('/booklets', enhancedCalculatorController_1.EnhancedCalculatorController.calculateBookletsPrice);
// Универсальный расчет цен
router.post('/calculate', enhancedCalculatorController_1.EnhancedCalculatorController.calculateUniversalPrice);
// Получить доступные типы продуктов
router.get('/product-types', enhancedCalculatorController_1.EnhancedCalculatorController.getAvailableProductTypes);
// Получить политику ценообразования
router.get('/pricing-policy', enhancedCalculatorController_1.EnhancedCalculatorController.getPricingPolicy);
exports.default = router;
