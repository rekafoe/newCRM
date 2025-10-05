"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materialsAnalyticsController_1 = require("../controllers/materialsAnalyticsController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(middleware_1.authenticate);
// Получить полную аналитику
router.get('/full', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getFullAnalytics));
// Получить сводную аналитику
router.get('/summary', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getSummaryAnalytics));
// Получить аналитику по конкретному материалу
router.get('/material/:materialId', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getMaterialAnalytics));
// Получить аналитику потребления
router.get('/consumption', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getConsumptionAnalytics));
// Получить аналитику поставщиков
router.get('/suppliers', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getSupplierAnalytics));
// Получить аналитику категорий
router.get('/categories', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getCategoryAnalytics));
// Получить тренды
router.get('/trends', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getTrends));
// Получить рекомендации
router.get('/recommendations', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.getRecommendations));
// Экспортировать аналитику
router.get('/export', (0, middleware_1.asyncHandler)(materialsAnalyticsController_1.MaterialsAnalyticsController.exportAnalytics));
exports.default = router;
