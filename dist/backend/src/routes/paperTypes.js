"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paperTypeController_1 = require("../controllers/paperTypeController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Получить все типы бумаги
router.get('/', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.getAllPaperTypes));
// Получить тип бумаги по ID
router.get('/:id', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.getPaperTypeById));
// Создать новый тип бумаги
router.post('/', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.createPaperType));
// Обновить тип бумаги
router.put('/:id', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.updatePaperType));
// Удалить тип бумаги
router.delete('/:id', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.deletePaperType));
// Добавить цену печати
router.post('/prices', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.addPrintingPrice));
// Удалить цену печати
router.delete('/prices/:id', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.deletePrintingPrice));
// Найти тип бумаги по названию материала
router.get('/find/by-material', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.findPaperTypeByMaterial));
// Получить цену печати
router.get('/prices/lookup', (0, middleware_1.asyncHandler)(paperTypeController_1.PaperTypeController.getPrintingPrice));
exports.default = router;
