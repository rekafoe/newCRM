"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// POST /api/material-bulk/update - массовое обновление материалов
router.post('/update', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkUpdateMaterials));
// POST /api/material-bulk/spend - массовое списание материалов
router.post('/spend', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkSpendMaterials));
// POST /api/material-bulk/create - массовое создание материалов
router.post('/create', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkCreateMaterials));
// POST /api/material-bulk/delete - массовое удаление материалов
router.post('/delete', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkDeleteMaterials));
// POST /api/material-bulk/change-category - массовое изменение категории
router.post('/change-category', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkChangeCategory));
// POST /api/material-bulk/change-supplier - массовое изменение поставщика
router.post('/change-supplier', (0, middleware_1.asyncHandler)(controllers_1.MaterialBulkController.bulkChangeSupplier));
exports.default = router;
