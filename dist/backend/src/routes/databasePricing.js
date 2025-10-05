"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const databasePricingController_1 = require("../controllers/databasePricingController");
const router = (0, express_1.Router)();
// Базовые цены
router.get('/base-prices', databasePricingController_1.DatabasePricingController.getBasePrices);
router.get('/base-prices/:productType/:productVariant', databasePricingController_1.DatabasePricingController.getBasePrice);
router.put('/base-prices/:productType/:productVariant', databasePricingController_1.DatabasePricingController.updateBasePrice);
router.post('/base-prices', databasePricingController_1.DatabasePricingController.addBasePrice);
// Множители срочности
router.get('/urgency-multipliers', databasePricingController_1.DatabasePricingController.getUrgencyMultipliers);
router.put('/urgency-multipliers/:priceType', databasePricingController_1.DatabasePricingController.updateUrgencyMultiplier);
// Скидки по объему
router.get('/volume-discounts', databasePricingController_1.DatabasePricingController.getVolumeDiscounts);
router.post('/volume-discounts', databasePricingController_1.DatabasePricingController.addVolumeDiscount);
router.put('/volume-discounts/:id', databasePricingController_1.DatabasePricingController.updateVolumeDiscount);
router.delete('/volume-discounts/:id', databasePricingController_1.DatabasePricingController.deleteVolumeDiscount);
// Скидки по типу клиента
router.get('/loyalty-discounts', databasePricingController_1.DatabasePricingController.getLoyaltyDiscounts);
router.put('/loyalty-discounts/:customerType', databasePricingController_1.DatabasePricingController.updateLoyaltyDiscount);
// Расчет цены
router.post('/calculate', databasePricingController_1.DatabasePricingController.calculatePrice);
exports.default = router;
