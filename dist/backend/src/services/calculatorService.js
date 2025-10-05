"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorService = void 0;
const database_1 = require("../config/database");
const calculators_1 = require("../utils/calculators");
class CalculatorService {
    static getFlyersSchema() {
        return calculators_1.FLYERS_SCHEMA;
    }
    static async calculateFlyersPrice(params) {
        const { format, qty, sides, paperDensity, lamination, priceType } = params;
        if (!format || !qty || !sides) {
            throw new Error('format, qty, sides обязательны');
        }
        const up = calculators_1.FLYERS_UP_ON_SRA3[format] || 8;
        const sra3PerItem = 1 / up;
        const wasteRatio = 0.02;
        const totalSheets = Math.ceil(qty * sra3PerItem * (1 + wasteRatio));
        // Sheet-based price
        const baseSheet = calculators_1.FLYERS_SHEET_PRICE[Number(paperDensity) || 130] ?? 0.4;
        const sidesK = sides === 2 ? 1.6 : 1;
        // Flyers: ламинацию для листовок не учитываем в стоимости
        const lamPS = 0;
        const type = (priceType || 'rush');
        // Pricing from tiers table
        const singleFromTier = await this.resolveSheetSinglePrice(format, type, Number(qty) || 0, Number(paperDensity) || 130);
        const sheetPrice = Math.round(((singleFromTier * sidesK) + lamPS) * 100) / 100;
        const discountK = (0, calculators_1.getQtyDiscountK)(Number(qty) || 0);
        const totalPrice = Math.round((totalSheets * sheetPrice * discountK) * 100) / 100;
        const pricePerItem = Math.round(((totalPrice / Math.max(1, qty))) * 100) / 100;
        const paperId = await this.getMaterialIdByDensity(Number(paperDensity) || 130);
        // Flyers: не добавляем компонент ламинации
        const lamId = undefined;
        const components = [];
        if (paperId)
            components.push({ materialId: paperId, qtyPerItem: sra3PerItem * (1 + wasteRatio) });
        if (lamId)
            components.push({ materialId: lamId, qtyPerItem: sra3PerItem * (1 + wasteRatio) });
        return {
            pricePerItem,
            totalPrice,
            totalSheets,
            components,
            derived: { up, sra3PerItem, wasteRatio, discountK }
        };
    }
    static async resolveSheetSinglePrice(format, priceType, qty, paperDensity) {
        const db = await (0, database_1.getDb)();
        const row = await db.get(`SELECT sheet_price_single FROM pricing_flyers_tiers
        WHERE format = ? AND price_type = ? AND paper_density = ? AND min_qty <= ?
        ORDER BY min_qty DESC LIMIT 1`, format, priceType, paperDensity, qty);
        return Number(row?.sheet_price_single || 0);
    }
    static async getMaterialIdByDensity(d) {
        const db = await (0, database_1.getDb)();
        // Используем новые материалы SRA3 с реальными ценами
        let name;
        if (d >= 150) {
            name = 'Бумага NEVIA SRA3 150г/м²';
        }
        else {
            name = 'Бумага NEVIA SRA3 128г/м²'; // Используем 128г вместо 130г
        }
        const result = await db.get('SELECT id FROM materials WHERE name = ?', name);
        return result?.id;
    }
    static async getLaminationMatId(type) {
        const db = await (0, database_1.getDb)();
        const name = type === 'glossy' ? 'Плёнка ламинации глянцевая 35 мкм, SRA3' : 'Плёнка ламинации матовая 35 мкм, SRA3';
        const result = await db.get('SELECT id FROM materials WHERE name = ?', name);
        return result?.id;
    }
}
exports.CalculatorService = CalculatorService;
