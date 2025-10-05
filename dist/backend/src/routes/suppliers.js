"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const supplierAnalyticsController_1 = require("../controllers/supplierAnalyticsController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/suppliers - получить всех поставщиков
router.get('/', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.getAllSuppliers));
// GET /api/suppliers/active - получить активных поставщиков
router.get('/active', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.getActiveSuppliers));
// GET /api/suppliers/stats - получить статистику по поставщикам
router.get('/stats', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.getSupplierStats));
// GET /api/suppliers/:id - получить поставщика по ID
router.get('/:id', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.getSupplierById));
// GET /api/suppliers/:id/materials - получить материалы поставщика
router.get('/:id/materials', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.getSupplierMaterials));
// GET /api/suppliers/:id/analytics - получить аналитику поставщика
router.get('/:id/analytics', (0, middleware_1.asyncHandler)(supplierAnalyticsController_1.SupplierAnalyticsController.getSupplierAnalytics));
// GET /api/suppliers/:id/delivery-history - получить историю поставок
router.get('/:id/delivery-history', (0, middleware_1.asyncHandler)(supplierAnalyticsController_1.SupplierAnalyticsController.getSupplierDeliveryHistory));
// GET /api/suppliers/analytics/comparison - получить сравнительную аналитику
router.get('/analytics/comparison', (0, middleware_1.asyncHandler)(supplierAnalyticsController_1.SupplierAnalyticsController.getSuppliersComparison));
// POST /api/suppliers - создать нового поставщика
router.post('/', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.createSupplier));
// PUT /api/suppliers/:id - обновить поставщика
router.put('/:id', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.updateSupplier));
// DELETE /api/suppliers/:id - удалить поставщика
router.delete('/:id', (0, middleware_1.asyncHandler)(controllers_1.SupplierController.deleteSupplier));
exports.default = router;
