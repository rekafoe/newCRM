"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQtyDiscountK = exports.LAM_SHEET_PRICE = exports.FLYERS_SHEET_PRICE = exports.FLYERS_UP_ON_SRA3 = exports.FLYERS_SCHEMA = void 0;
// Flyers calculator constants and utilities
exports.FLYERS_SCHEMA = {
    slug: 'flyers-color',
    name: 'Листовки цветные',
    options: {
        format: ['A6', 'A5', 'A4'],
        sides: [1, 2],
        qtySteps: [50, 100, 200, 300, 500, 1000, 2000, 5000],
        paperDensity: [130, 170],
        lamination: ['none', 'matte', 'glossy'],
        priceType: ['rush', 'online', 'promo']
    }
};
exports.FLYERS_UP_ON_SRA3 = {
    A6: 8,
    A5: 4,
    A4: 2
};
exports.FLYERS_SHEET_PRICE = {
    130: 0.4,
    150: 0.5
};
exports.LAM_SHEET_PRICE = {
    matte: 0.2,
    glossy: 0.2
};
const getQtyDiscountK = (_qty) => {
    return 1;
};
exports.getQtyDiscountK = getQtyDiscountK;
