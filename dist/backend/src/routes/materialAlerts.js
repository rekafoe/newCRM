"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/material-alerts - получить все уведомления
router.get('/', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.getAllAlerts));
// GET /api/material-alerts/unread - получить непрочитанные уведомления
router.get('/unread', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.getUnreadAlerts));
// GET /api/material-alerts/stats - получить статистику уведомлений
router.get('/stats', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.getAlertStats));
// POST /api/material-alerts/check - проверить и создать уведомления
router.post('/check', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.checkAlerts));
// PUT /api/material-alerts/:id/read - отметить как прочитанное
router.put('/:id/read', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.markAsRead));
// PUT /api/material-alerts/read-all - отметить все как прочитанные
router.put('/read-all', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.markAllAsRead));
// DELETE /api/material-alerts/:id - удалить уведомление
router.delete('/:id', (0, middleware_1.asyncHandler)(controllers_1.MaterialAlertController.deleteAlert));
exports.default = router;
