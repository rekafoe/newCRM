"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productConfigController_1 = require("../controllers/productConfigController");
const router = express_1.default.Router();
// Получить все конфигурации продуктов
router.get('/', productConfigController_1.productConfigController.getAllProductConfigs);
// Получить конфигурацию продукта по ID
router.get('/:id', productConfigController_1.productConfigController.getProductConfigById);
// Создать новую конфигурацию продукта
router.post('/', productConfigController_1.productConfigController.createProductConfig);
// Обновить конфигурацию продукта
router.put('/:id', productConfigController_1.productConfigController.updateProductConfig);
// Удалить конфигурацию продукта
router.delete('/:id', productConfigController_1.productConfigController.deleteProductConfig);
exports.default = router;
