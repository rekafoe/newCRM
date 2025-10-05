"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePricingController = void 0;
const databasePricingService_1 = require("../services/databasePricingService");
const middleware_1 = require("../middleware");
class DatabasePricingController {
}
exports.DatabasePricingController = DatabasePricingController;
_a = DatabasePricingController;
// Получить все базовые цены
DatabasePricingController.getBasePrices = (0, middleware_1.asyncHandler)(async (req, res) => {
    const prices = await databasePricingService_1.DatabasePricingService.getBasePrices();
    res.json({
        success: true,
        data: prices
    });
});
// Получить базовую цену по типу и варианту
DatabasePricingController.getBasePrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, productVariant } = req.params;
    const price = await databasePricingService_1.DatabasePricingService.getBasePrice(productType, productVariant);
    if (!price) {
        res.status(404).json({
            success: false,
            message: 'Цена не найдена'
        });
        return;
    }
    res.json({
        success: true,
        data: price
    });
});
// Обновить базовую цену
DatabasePricingController.updateBasePrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, productVariant } = req.params;
    const { urgent_price, online_price, promo_price } = req.body;
    if (!urgent_price || !online_price || !promo_price) {
        res.status(400).json({
            success: false,
            message: 'Все цены обязательны'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.updateBasePrice(productType, productVariant, {
        urgent_price,
        online_price,
        promo_price
    });
    res.json({
        success: true,
        message: 'Цена обновлена'
    });
});
// Добавить новую базовую цену
DatabasePricingController.addBasePrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { product_type, product_variant, urgent_price, online_price, promo_price } = req.body;
    if (!product_type || !product_variant || !urgent_price || !online_price || !promo_price) {
        res.status(400).json({
            success: false,
            message: 'Все поля обязательны'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.addBasePrice(product_type, product_variant, {
        urgent_price,
        online_price,
        promo_price
    });
    res.json({
        success: true,
        message: 'Цена добавлена'
    });
});
// Получить все множители срочности
DatabasePricingController.getUrgencyMultipliers = (0, middleware_1.asyncHandler)(async (req, res) => {
    const multipliers = await databasePricingService_1.DatabasePricingService.getUrgencyMultipliers();
    res.json({
        success: true,
        data: multipliers
    });
});
// Обновить множитель срочности
DatabasePricingController.updateUrgencyMultiplier = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { priceType } = req.params;
    const { multiplier } = req.body;
    if (!multiplier || multiplier <= 0) {
        res.status(400).json({
            success: false,
            message: 'Множитель должен быть больше 0'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.updateUrgencyMultiplier(priceType, multiplier);
    res.json({
        success: true,
        message: 'Множитель обновлен'
    });
});
// Получить все скидки по объему
DatabasePricingController.getVolumeDiscounts = (0, middleware_1.asyncHandler)(async (req, res) => {
    const discounts = await databasePricingService_1.DatabasePricingService.getVolumeDiscounts();
    res.json({
        success: true,
        data: discounts
    });
});
// Обновить скидку по объему
DatabasePricingController.updateVolumeDiscount = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { min_quantity, discount_percent } = req.body;
    if (!min_quantity || !discount_percent || min_quantity < 0 || discount_percent < 0 || discount_percent > 100) {
        res.status(400).json({
            success: false,
            message: 'Некорректные данные скидки'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.updateVolumeDiscount(Number(id), min_quantity, discount_percent);
    res.json({
        success: true,
        message: 'Скидка обновлена'
    });
});
// Добавить новую скидку по объему
DatabasePricingController.addVolumeDiscount = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { min_quantity, discount_percent } = req.body;
    if (!min_quantity || !discount_percent || min_quantity < 0 || discount_percent < 0 || discount_percent > 100) {
        res.status(400).json({
            success: false,
            message: 'Некорректные данные скидки'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.addVolumeDiscount(min_quantity, discount_percent);
    res.json({
        success: true,
        message: 'Скидка добавлена'
    });
});
// Удалить скидку по объему
DatabasePricingController.deleteVolumeDiscount = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await databasePricingService_1.DatabasePricingService.deleteVolumeDiscount(Number(id));
    res.json({
        success: true,
        message: 'Скидка удалена'
    });
});
// Получить все скидки по типу клиента
DatabasePricingController.getLoyaltyDiscounts = (0, middleware_1.asyncHandler)(async (req, res) => {
    const discounts = await databasePricingService_1.DatabasePricingService.getLoyaltyDiscounts();
    res.json({
        success: true,
        data: discounts
    });
});
// Обновить скидку по типу клиента
DatabasePricingController.updateLoyaltyDiscount = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { customerType } = req.params;
    const { discount_percent } = req.body;
    if (!discount_percent || discount_percent < 0 || discount_percent > 100) {
        res.status(400).json({
            success: false,
            message: 'Некорректный процент скидки'
        });
        return;
    }
    await databasePricingService_1.DatabasePricingService.updateLoyaltyDiscount(customerType, discount_percent);
    res.json({
        success: true,
        message: 'Скидка обновлена'
    });
});
// Рассчитать цену
DatabasePricingController.calculatePrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, productVariant, quantity, priceType, customerType } = req.body;
    if (!productType || !productVariant || !quantity || !priceType || !customerType) {
        res.status(400).json({
            success: false,
            message: 'Все параметры обязательны'
        });
        return;
    }
    const result = await databasePricingService_1.DatabasePricingService.calculatePrice({
        productType,
        productVariant,
        quantity: Number(quantity),
        priceType,
        customerType
    });
    res.json({
        success: true,
        data: result
    });
});
