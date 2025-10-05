"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const warehouseTransactionController_1 = require("../controllers/warehouseTransactionController");
const router = (0, express_1.Router)();
// Основные операции
router.post('/execute', warehouseTransactionController_1.WarehouseTransactionController.executeTransaction);
router.post('/spend', warehouseTransactionController_1.WarehouseTransactionController.spendMaterial);
router.post('/add', warehouseTransactionController_1.WarehouseTransactionController.addMaterial);
router.post('/adjust', warehouseTransactionController_1.WarehouseTransactionController.adjustStock);
// Резервирование
router.post('/reserve', warehouseTransactionController_1.WarehouseTransactionController.reserveMaterials);
router.post('/unreserve', warehouseTransactionController_1.WarehouseTransactionController.unreserveMaterials);
// Утилиты
router.post('/check-availability', warehouseTransactionController_1.WarehouseTransactionController.checkAvailability);
router.get('/history', warehouseTransactionController_1.WarehouseTransactionController.getOperationHistory);
exports.default = router;
