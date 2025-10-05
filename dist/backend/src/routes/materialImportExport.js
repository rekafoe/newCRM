"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/material-import-export/template - получить шаблон для импорта
router.get('/template', (0, middleware_1.asyncHandler)(controllers_1.MaterialImportExportController.getImportTemplate));
// GET /api/material-import-export/export/csv - экспорт в CSV
router.get('/export/csv', (0, middleware_1.asyncHandler)(controllers_1.MaterialImportExportController.exportToCSV));
// GET /api/material-import-export/export/json - экспорт в JSON
router.get('/export/json', (0, middleware_1.asyncHandler)(controllers_1.MaterialImportExportController.exportToJSON));
// POST /api/material-import-export/validate - валидация данных импорта
router.post('/validate', (0, middleware_1.asyncHandler)(controllers_1.MaterialImportExportController.validateImportData));
// POST /api/material-import-export/import - импорт из JSON
router.post('/import', (0, middleware_1.asyncHandler)(controllers_1.MaterialImportExportController.importFromJSON));
exports.default = router;
