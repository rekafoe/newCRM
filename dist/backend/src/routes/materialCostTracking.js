"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/material-cost-tracking/history - получить историю цен всех материалов
router.get('/history', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.getAllPriceHistory));
// GET /api/material-cost-tracking/history/:materialId - получить историю цен материала
router.get('/history/:materialId', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.getPriceHistory));
// GET /api/material-cost-tracking/stats - получить статистику по ценам
router.get('/stats', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.getPriceStats));
// GET /api/material-cost-tracking/price-changes - получить материалы с изменением цен
router.get('/price-changes', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.getMaterialsWithPriceChanges));
// GET /api/material-cost-tracking/trends - получить тренды цен по категориям
router.get('/trends', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.getPriceTrendsByCategory));
// PUT /api/material-cost-tracking/price/:materialId - обновить цену материала
router.put('/price/:materialId', (0, middleware_1.asyncHandler)(controllers_1.MaterialCostTrackingController.updatePrice));
exports.default = router;
