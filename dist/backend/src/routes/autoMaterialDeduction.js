"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autoMaterialDeductionController_1 = require("../controllers/autoMaterialDeductionController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(middleware_1.authenticate);
// Автоматическое списание материалов для заказа
router.post('/orders/:orderId/deduct', (0, middleware_1.asyncHandler)(autoMaterialDeductionController_1.AutoMaterialDeductionController.deductForOrder));
// Получить историю списаний для заказа
router.get('/orders/:orderId/history', (0, middleware_1.asyncHandler)(autoMaterialDeductionController_1.AutoMaterialDeductionController.getDeductionHistory));
// Отменить списание материалов
router.post('/orders/:orderId/cancel', (0, middleware_1.asyncHandler)(autoMaterialDeductionController_1.AutoMaterialDeductionController.cancelDeduction));
// Проверить доступность материалов
router.post('/check-availability', (0, middleware_1.asyncHandler)(autoMaterialDeductionController_1.AutoMaterialDeductionController.checkAvailability));
exports.default = router;
