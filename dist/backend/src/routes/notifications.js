"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const userNotificationController_1 = require("../controllers/userNotificationController");
const router = (0, express_1.Router)();
// Telegram уведомления
router.post('/telegram/test', notificationController_1.NotificationController.sendTestNotification);
router.post('/telegram/configure', notificationController_1.NotificationController.configureTelegram);
// Мониторинг запасов
router.get('/stock-alerts', notificationController_1.NotificationController.getStockAlerts);
router.post('/stock-alerts/:alertId/resolve', notificationController_1.NotificationController.resolveStockAlert);
router.post('/stock/check', notificationController_1.NotificationController.checkStockLevels);
router.get('/stock-monitoring/config', notificationController_1.NotificationController.getStockMonitoringConfig);
router.put('/stock-monitoring/config', notificationController_1.NotificationController.updateStockMonitoringConfig);
// Автоматические заказы
router.post('/auto-orders', notificationController_1.NotificationController.createAutoOrder);
router.get('/auto-orders', notificationController_1.NotificationController.getAutoOrders);
router.post('/auto-orders/:orderId/approve', notificationController_1.NotificationController.approveAutoOrder);
router.post('/auto-orders/:orderId/send', notificationController_1.NotificationController.sendAutoOrder);
router.post('/auto-orders/:orderId/delivered', notificationController_1.NotificationController.markAutoOrderDelivered);
router.get('/auto-orders/config', notificationController_1.NotificationController.getAutoOrderConfig);
router.put('/auto-orders/config', notificationController_1.NotificationController.updateAutoOrderConfig);
// Пользовательские уведомления
router.get('/users', userNotificationController_1.UserNotificationController.getAllUsers);
router.get('/users/role/:role', userNotificationController_1.UserNotificationController.getUsersByRole);
router.post('/users/:userId/send', userNotificationController_1.UserNotificationController.sendToUser);
router.post('/users/role/:role/send', userNotificationController_1.UserNotificationController.sendToRole);
router.post('/users/send-all', userNotificationController_1.UserNotificationController.sendToAllUsers);
router.post('/users/low-stock-alert', userNotificationController_1.UserNotificationController.sendLowStockAlert);
router.post('/users/new-order-alert', userNotificationController_1.UserNotificationController.sendNewOrderAlert);
router.post('/users/system-alert', userNotificationController_1.UserNotificationController.sendSystemAlert);
router.put('/users/:userId/telegram-chat-id', userNotificationController_1.UserNotificationController.updateUserTelegramChatId);
// Работа с пользователями бота
router.get('/bot/users', userNotificationController_1.UserNotificationController.getBotUsers);
router.post('/bot/test-message', userNotificationController_1.UserNotificationController.sendTestMessageToBotUsers);
router.post('/bot/low-stock', userNotificationController_1.UserNotificationController.sendLowStockToBotUsers);
exports.default = router;
