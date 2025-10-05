"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/material-reports/inventory - отчет по остаткам материалов
router.get('/inventory', (0, middleware_1.asyncHandler)(controllers_1.MaterialReportController.getInventoryReport));
// GET /api/material-reports/consumption - отчет по расходу материалов
router.get('/consumption', (0, middleware_1.asyncHandler)(controllers_1.MaterialReportController.getConsumptionReport));
// GET /api/material-reports/cost - отчет по стоимости материалов
router.get('/cost', (0, middleware_1.asyncHandler)(controllers_1.MaterialReportController.getCostReport));
// GET /api/material-reports/summary - сводный отчет
router.get('/summary', (0, middleware_1.asyncHandler)(controllers_1.MaterialReportController.getSummaryReport));
// GET /api/material-reports/daily-movement - отчет по движению по дням
router.get('/daily-movement', (0, middleware_1.asyncHandler)(controllers_1.MaterialReportController.getDailyMovementReport));
exports.default = router;
