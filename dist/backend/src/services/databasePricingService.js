"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabasePricingService = void 0;
const db_1 = require("../db");
class DatabasePricingService {
    // Получить все базовые цены
    static async getBasePrices() {
        const db = await (0, db_1.getDb)();
        return await db.all('SELECT * FROM base_prices ORDER BY product_type, product_variant');
    }
    // Получить базовую цену по типу и варианту продукта
    static async getBasePrice(productType, productVariant) {
        const db = await (0, db_1.getDb)();
        return await db.get('SELECT * FROM base_prices WHERE product_type = ? AND product_variant = ?', [productType, productVariant]);
    }
    // Обновить базовую цену
    static async updateBasePrice(productType, productVariant, prices) {
        const db = await (0, db_1.getDb)();
        await db.run('UPDATE base_prices SET urgent_price = ?, online_price = ?, promo_price = ?, updated_at = CURRENT_TIMESTAMP WHERE product_type = ? AND product_variant = ?', [prices.urgent_price, prices.online_price, prices.promo_price, productType, productVariant]);
    }
    // Добавить новую базовую цену
    static async addBasePrice(productType, productVariant, prices) {
        const db = await (0, db_1.getDb)();
        await db.run('INSERT INTO base_prices (product_type, product_variant, urgent_price, online_price, promo_price) VALUES (?, ?, ?, ?, ?)', [productType, productVariant, prices.urgent_price, prices.online_price, prices.promo_price]);
    }
    // Получить все множители срочности
    static async getUrgencyMultipliers() {
        const db = await (0, db_1.getDb)();
        return await db.all('SELECT * FROM urgency_multipliers ORDER BY price_type');
    }
    // Обновить множитель срочности
    static async updateUrgencyMultiplier(priceType, multiplier) {
        const db = await (0, db_1.getDb)();
        await db.run('UPDATE urgency_multipliers SET multiplier = ?, updated_at = CURRENT_TIMESTAMP WHERE price_type = ?', [multiplier, priceType]);
    }
    // Получить все скидки по объему
    static async getVolumeDiscounts() {
        const db = await (0, db_1.getDb)();
        return await db.all('SELECT * FROM volume_discounts ORDER BY min_quantity');
    }
    // Обновить скидку по объему
    static async updateVolumeDiscount(id, minQuantity, discountPercent) {
        const db = await (0, db_1.getDb)();
        await db.run('UPDATE volume_discounts SET min_quantity = ?, discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [minQuantity, discountPercent, id]);
    }
    // Добавить новую скидку по объему
    static async addVolumeDiscount(minQuantity, discountPercent) {
        const db = await (0, db_1.getDb)();
        await db.run('INSERT INTO volume_discounts (min_quantity, discount_percent) VALUES (?, ?)', [minQuantity, discountPercent]);
    }
    // Удалить скидку по объему
    static async deleteVolumeDiscount(id) {
        const db = await (0, db_1.getDb)();
        await db.run('DELETE FROM volume_discounts WHERE id = ?', [id]);
    }
    // Получить все скидки по типу клиента
    static async getLoyaltyDiscounts() {
        const db = await (0, db_1.getDb)();
        return await db.all('SELECT * FROM loyalty_discounts ORDER BY customer_type');
    }
    // Обновить скидку по типу клиента
    static async updateLoyaltyDiscount(customerType, discountPercent) {
        const db = await (0, db_1.getDb)();
        await db.run('UPDATE loyalty_discounts SET discount_percent = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_type = ?', [discountPercent, customerType]);
    }
    // Получить скидку по объему для заданного количества
    static async getVolumeDiscountForQuantity(quantity) {
        const db = await (0, db_1.getDb)();
        const discount = await db.get('SELECT * FROM volume_discounts WHERE min_quantity <= ? ORDER BY min_quantity DESC LIMIT 1', [quantity]);
        return discount ? discount.discount_percent / 100 : 0;
    }
    // Получить скидку по типу клиента
    static async getLoyaltyDiscountForCustomerType(customerType) {
        const db = await (0, db_1.getDb)();
        const discount = await db.get('SELECT * FROM loyalty_discounts WHERE customer_type = ?', [customerType]);
        return discount ? discount.discount_percent / 100 : 0;
    }
    // Получить множитель срочности
    static async getUrgencyMultiplier(priceType) {
        const db = await (0, db_1.getDb)();
        const multiplier = await db.get('SELECT * FROM urgency_multipliers WHERE price_type = ?', [priceType]);
        return multiplier ? multiplier.multiplier : 1.0;
    }
    // Рассчитать итоговую цену
    static async calculatePrice(params) {
        const { productType, productVariant, quantity, priceType, customerType } = params;
        // Получаем базовую цену
        const basePriceData = await this.getBasePrice(productType, productVariant);
        if (!basePriceData) {
            throw new Error(`Цена не найдена для ${productType} ${productVariant}`);
        }
        const basePrice = basePriceData[`${priceType}_price`];
        // Применяем множитель срочности
        const urgencyMultiplier = await this.getUrgencyMultiplier(priceType);
        const urgencyPrice = basePrice * urgencyMultiplier;
        // Применяем скидки
        const volumeDiscount = await this.getVolumeDiscountForQuantity(quantity);
        const loyaltyDiscount = await this.getLoyaltyDiscountForCustomerType(customerType);
        // Рассчитываем итоговую цену за штуку
        const finalPrice = urgencyPrice * (1 - volumeDiscount) * (1 - loyaltyDiscount);
        // Итоговая стоимость
        const total = finalPrice * quantity;
        return {
            basePrice,
            urgencyPrice,
            finalPrice,
            total,
            volumeDiscount,
            loyaltyDiscount
        };
    }
}
exports.DatabasePricingService = DatabasePricingService;
