"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pricingController_1 = require("../controllers/pricingController");
const router = (0, express_1.Router)();
// Получить политику ценообразования
router.get('/policy', pricingController_1.PricingController.getPricingPolicy);
// Рассчитать цену продукта
router.post('/calculate', pricingController_1.PricingController.calculateProductPrice);
// Получить базовые цены
router.get('/base-prices', pricingController_1.PricingController.getBasePrices);
// Получить цены на материалы
router.get('/materials', pricingController_1.PricingController.getMaterialPrices);
// Получить цены на услуги
router.get('/services', pricingController_1.PricingController.getServicePrices);
// Получить коэффициенты ценообразования
router.get('/multipliers', pricingController_1.PricingController.getPricingMultipliers);
// Получить скидки по объему
router.get('/volume-discounts', pricingController_1.PricingController.getVolumeDiscounts);
// Получить скидки по типу клиента
router.get('/loyalty-discounts', pricingController_1.PricingController.getLoyaltyDiscounts);
// Сравнить с конкурентами
router.post('/compare', pricingController_1.PricingController.compareWithCompetitors);
// Обновить политику ценообразования
router.put('/policy', pricingController_1.PricingController.updatePricingPolicy);
// Получить аналитику ценообразования
router.get('/analytics', pricingController_1.PricingController.getPricingAnalytics);
exports.default = router;
