"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const priceManagementController_1 = require("../controllers/priceManagementController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(auth_1.authenticate);
/**
 * @route GET /api/price-management/history
 * @desc Получить историю изменений цен
 * @access Private
 */
router.get('/history', priceManagementController_1.PriceManagementController.getPriceHistory);
/**
 * @route GET /api/price-management/notifications
 * @desc Получить уведомления об изменениях цен
 * @access Private
 */
router.get('/notifications', priceManagementController_1.PriceManagementController.getPriceNotifications);
/**
 * @route GET /api/price-management/analytics
 * @desc Получить аналитику по ценам
 * @access Private
 */
router.get('/analytics', priceManagementController_1.PriceManagementController.getPriceAnalytics);
/**
 * @route POST /api/price-management/snapshot
 * @desc Создать снимок текущих цен
 * @access Private
 */
router.post('/snapshot', priceManagementController_1.PriceManagementController.createPriceSnapshot);
/**
 * @route GET /api/price-management/item/:itemId/snapshot
 * @desc Получить снимок цен для товара
 * @access Private
 */
router.get('/item/:itemId/snapshot', priceManagementController_1.PriceManagementController.getItemPriceSnapshot);
/**
 * @route POST /api/price-management/item/:itemId/recalculate
 * @desc Пересчитать цену товара
 * @access Private
 */
router.post('/item/:itemId/recalculate', priceManagementController_1.PriceManagementController.recalculateItemPrice);
exports.default = router;
