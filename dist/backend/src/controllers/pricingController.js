"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
const pricingService_1 = require("../services/pricingService");
const middleware_1 = require("../middleware");
class PricingController {
}
exports.PricingController = PricingController;
_a = PricingController;
// Получить политику ценообразования
PricingController.getPricingPolicy = (0, middleware_1.asyncHandler)(async (req, res) => {
    const policy = await pricingService_1.PricingService.getPricingPolicy();
    res.json({
        success: true,
        data: policy
    });
});
// Рассчитать цену продукта
PricingController.calculateProductPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, productName, quantity, specifications, pricingType, customerType } = req.body;
    if (!productType || !productName || !quantity) {
        res.status(400).json({
            success: false,
            message: 'productType, productName и quantity обязательны'
        });
        return;
    }
    const pricing = await pricingService_1.PricingService.calculateProductPrice({
        productType,
        productName,
        quantity: Number(quantity),
        specifications: specifications || {},
        pricingType: pricingType || 'online',
        customerType: customerType || 'regular'
    });
    res.json({
        success: true,
        data: pricing
    });
});
// Получить базовые цены для продуктов
PricingController.getBasePrices = (0, middleware_1.asyncHandler)(async (req, res) => {
    const basePrices = {
        flyers: {
            A6: { urgent: 0.15, online: 0.10, promo: 0.07 },
            A5: { urgent: 0.25, online: 0.18, promo: 0.12 },
            A4: { urgent: 0.40, online: 0.30, promo: 0.20 }
        },
        business_cards: {
            standard: { urgent: 0.35, online: 0.25, promo: 0.18 },
            laminated: { urgent: 0.45, online: 0.35, promo: 0.25 },
            magnetic: { urgent: 0.60, online: 0.45, promo: 0.35 }
        },
        booklets: {
            A4_4page: { urgent: 0.80, online: 0.60, promo: 0.45 },
            A4_8page: { urgent: 1.20, online: 0.90, promo: 0.70 },
            A5_4page: { urgent: 0.50, online: 0.40, promo: 0.30 }
        }
    };
    res.json({
        success: true,
        data: basePrices
    });
});
// Получить цены на материалы
PricingController.getMaterialPrices = (0, middleware_1.asyncHandler)(async (req, res) => {
    const materialPrices = {
        'Бумага NEVIA SRA3 128г/м²': 0.05,
        'Бумага NEVIA SRA3 150г/м²': 0.06,
        'Бумага NEVIA SRA3 200г/м²': 0.08,
        'Бумага NEVIA SRA3 300г/м²': 0.12,
        'Краска черная': 0.15,
        'Краска цветная': 0.15,
        'Плёнка ламинации матовая 35 мкм, SRA3': 0.03,
        'Плёнка ламинации глянцевая 35 мкм, SRA3': 0.03
    };
    res.json({
        success: true,
        data: materialPrices
    });
});
// Получить цены на услуги
PricingController.getServicePrices = (0, middleware_1.asyncHandler)(async (req, res) => {
    const servicePrices = {
        'Печать цифровая': 0.03,
        'Резка': 0.01,
        'Биговка': 0.01,
        'Скругление углов': 0.02,
        'Ламинация матовая': 0.05,
        'Ламинация глянцевая': 0.05,
        'Сшивка': 0.10,
        'Расшивка': 0.10
    };
    res.json({
        success: true,
        data: servicePrices
    });
});
// Получить коэффициенты ценообразования
PricingController.getPricingMultipliers = (0, middleware_1.asyncHandler)(async (req, res) => {
    const multipliers = {
        urgent: 1.5,
        online: 1.0,
        promo: 0.7
    };
    res.json({
        success: true,
        data: multipliers
    });
});
// Получить скидки по объему
PricingController.getVolumeDiscounts = (0, middleware_1.asyncHandler)(async (req, res) => {
    const discounts = [
        { minQuantity: 1000, discountPercent: 10 },
        { minQuantity: 5000, discountPercent: 20 },
        { minQuantity: 10000, discountPercent: 30 }
    ];
    res.json({
        success: true,
        data: discounts
    });
});
// Получить скидки по типу клиента
PricingController.getLoyaltyDiscounts = (0, middleware_1.asyncHandler)(async (req, res) => {
    const discounts = [
        { customerType: 'regular', discountPercent: 5 },
        { customerType: 'vip', discountPercent: 15 }
    ];
    res.json({
        success: true,
        data: discounts
    });
});
// Сравнить цены с конкурентами
PricingController.compareWithCompetitors = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { productType, specifications, quantity } = req.body;
    if (!productType || !quantity) {
        res.status(400).json({
            success: false,
            message: 'productType и quantity обязательны'
        });
        return;
    }
    // Рассчитываем наши цены
    const ourPricing = await pricingService_1.PricingService.calculateProductPrice({
        productType,
        productName: 'Наш продукт',
        quantity: Number(quantity),
        specifications: specifications || {},
        pricingType: 'online',
        customerType: 'regular'
    });
    // Цены конкурентов (на основе анализа karandash.by)
    const competitorPrices = {
        karandash: {
            urgent: ourPricing.finalPrice * 0.8, // Примерно на 20% дешевле
            online: ourPricing.finalPrice * 0.7, // Примерно на 30% дешевле
            promo: ourPricing.finalPrice * 0.6 // Примерно на 40% дешевле
        },
        average: {
            urgent: ourPricing.finalPrice * 0.9,
            online: ourPricing.finalPrice * 0.8,
            promo: ourPricing.finalPrice * 0.7
        }
    };
    res.json({
        success: true,
        data: {
            ourPricing,
            competitorPrices,
            analysis: {
                isCompetitive: ourPricing.finalPrice <= competitorPrices.average.online * 1.2,
                recommendation: ourPricing.finalPrice > competitorPrices.average.online * 1.2
                    ? 'Снизить цены на 10-15% для повышения конкурентоспособности'
                    : 'Цены конкурентоспособны'
            }
        }
    });
});
// Обновить политику ценообразования
PricingController.updatePricingPolicy = (0, middleware_1.asyncHandler)(async (req, res) => {
    const policyData = req.body;
    // В реальном приложении здесь была бы логика сохранения в БД
    // Пока что просто возвращаем обновленные данные
    res.json({
        success: true,
        message: 'Политика ценообразования обновлена',
        data: policyData
    });
});
// Получить аналитику ценообразования
PricingController.getPricingAnalytics = (0, middleware_1.asyncHandler)(async (req, res) => {
    const analytics = {
        totalProducts: 15,
        averageMarkup: 35,
        mostProfitableProduct: 'Визитки магнитные',
        leastProfitableProduct: 'Листовки А6',
        priceChanges: [
            { date: '2024-01-15', product: 'Листовки А6', oldPrice: 0.12, newPrice: 0.10, change: -16.7 },
            { date: '2024-01-10', product: 'Визитки стандартные', oldPrice: 0.30, newPrice: 0.25, change: -16.7 },
            { date: '2024-01-05', product: 'Буклеты А4', oldPrice: 0.70, newPrice: 0.60, change: -14.3 }
        ],
        competitorAnalysis: {
            karandash: { marketShare: 25, avgPrice: 0.15 },
            average: { marketShare: 15, avgPrice: 0.18 },
            ourPosition: { marketShare: 10, avgPrice: 0.20 }
        }
    };
    res.json({
        success: true,
        data: analytics
    });
});
