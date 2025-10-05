"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lowStockNotificationController_1 = require("../controllers/lowStockNotificationController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(middleware_1.authenticate);
// Проверить остатки и создать уведомления
router.post('/check', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.checkStockLevels));
// Получить все активные уведомления
router.get('/alerts', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.getActiveAlerts));
// Отметить уведомление как решенное
router.post('/alerts/:alertId/resolve', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.resolveAlert));
// Автоматически решить уведомления
router.post('/auto-resolve', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.autoResolveAlerts));
// Получить статистику уведомлений
router.get('/stats', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.getAlertStats));
// Запланировать проверку остатков
router.post('/schedule', (0, middleware_1.asyncHandler)(lowStockNotificationController_1.LowStockNotificationController.scheduleStockCheck));
exports.default = router;
