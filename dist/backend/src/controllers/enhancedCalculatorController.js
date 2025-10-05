"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedCalculatorController = void 0;
const enhancedCalculatorService_1 = require("../services/enhancedCalculatorService");
const middleware_1 = require("../middleware");
class EnhancedCalculatorController {
}
exports.EnhancedCalculatorController = EnhancedCalculatorController;
_a = EnhancedCalculatorController;
// Расширенный расчет цен для листовок
EnhancedCalculatorController.calculateFlyersPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { format, qty, sides, paperDensity, lamination, priceType, customerType } = req.body;
    if (!format || !qty || !sides) {
        res.status(400).json({
            success: false,
            message: 'format, qty, sides обязательны'
        });
        return;
    }
    const result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateFlyersPrice({
        format,
        qty: Number(qty),
        sides: Number(sides),
        paperDensity: paperDensity || 130,
        lamination: lamination || 'none',
        priceType: priceType || 'online',
        customerType: customerType || 'regular'
    });
    res.json({
        success: true,
        data: result
    });
});
// Расчет цен для визиток
EnhancedCalculatorController.calculateBusinessCardsPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { qty, lamination, magnetic, priceType, customerType } = req.body;
    if (!qty) {
        res.status(400).json({
            success: false,
            message: 'qty обязателен'
        });
        return;
    }
    const result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateBusinessCardsPrice({
        qty: Number(qty),
        lamination: lamination || 'none',
        magnetic: magnetic || false,
        priceType: priceType || 'online',
        customerType: customerType || 'regular'
    });
    res.json({
        success: true,
        data: result
    });
});
// Расчет цен для буклетов
EnhancedCalculatorController.calculateBookletsPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { format, pages, qty, priceType, customerType } = req.body;
    if (!format || !pages || !qty) {
        res.status(400).json({
            success: false,
            message: 'format, pages, qty обязательны'
        });
        return;
    }
    const result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateBookletsPrice({
        format,
        pages: Number(pages),
        qty: Number(qty),
        priceType: priceType || 'online',
        customerType: customerType || 'regular'
    });
    res.json({
        success: true,
        data: result
    });
});
// Получить доступные типы продуктов
EnhancedCalculatorController.getAvailableProductTypes = (0, middleware_1.asyncHandler)(async (req, res) => {
    const productTypes = await enhancedCalculatorService_1.EnhancedCalculatorService.getAvailableProductTypes();
    res.json({
        success: true,
        data: productTypes
    });
});
// Получить политику ценообразования
EnhancedCalculatorController.getPricingPolicy = (0, middleware_1.asyncHandler)(async (req, res) => {
    const policy = await enhancedCalculatorService_1.EnhancedCalculatorService.getPricingPolicy();
    res.json({
        success: true,
        data: policy
    });
});
// Универсальный расчет цен
EnhancedCalculatorController.calculateUniversalPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, specifications, qty, priceType, customerType } = req.body;
    if (!productType || !qty) {
        res.status(400).json({
            success: false,
            message: 'productType, qty обязательны'
        });
        return;
    }
    let result;
    switch (productType) {
        case 'Листовки':
            result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateFlyersPrice({
                format: specifications.format || 'A6',
                qty: Number(qty),
                sides: specifications.sides || 1,
                paperDensity: specifications.paperDensity || 130,
                lamination: specifications.lamination || 'none',
                priceType: priceType || 'online',
                customerType: customerType || 'regular'
            });
            break;
        case 'Визитки':
            result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateBusinessCardsPrice({
                qty: Number(qty),
                lamination: specifications.lamination || 'none',
                magnetic: specifications.magnetic || false,
                priceType: priceType || 'online',
                customerType: customerType || 'regular'
            });
            break;
        case 'Буклеты':
            result = await enhancedCalculatorService_1.EnhancedCalculatorService.calculateBookletsPrice({
                format: specifications.format || 'A4',
                pages: specifications.pages || 4,
                qty: Number(qty),
                priceType: priceType || 'online',
                customerType: customerType || 'regular'
            });
            break;
        default:
            res.status(400).json({
                success: false,
                message: 'Неподдерживаемый тип продукта'
            });
            return;
    }
    res.json({
        success: true,
        data: result
    });
});
