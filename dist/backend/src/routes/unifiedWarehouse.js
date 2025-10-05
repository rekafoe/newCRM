"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const unifiedWarehouseController_1 = require("../controllers/unifiedWarehouseController");
const router = (0, express_1.Router)();
// Получение материалов и статистики
router.get('/materials', unifiedWarehouseController_1.UnifiedWarehouseController.getAllMaterials);
router.get('/stats', unifiedWarehouseController_1.UnifiedWarehouseController.getWarehouseStats);
// Резервирование материалов
router.post('/reservations', unifiedWarehouseController_1.UnifiedWarehouseController.reserveMaterials);
router.post('/reservations/confirm', unifiedWarehouseController_1.UnifiedWarehouseController.confirmReservations);
router.post('/reservations/cancel', unifiedWarehouseController_1.UnifiedWarehouseController.cancelReservations);
router.get('/reservations/order/:orderId', unifiedWarehouseController_1.UnifiedWarehouseController.getReservationsByOrder);
// Синхронизация
router.post('/sync-pricing', unifiedWarehouseController_1.UnifiedWarehouseController.syncWithPricing);
exports.default = router;
