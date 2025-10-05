"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalCalculatorController = void 0;
const services_1 = require("../services");
class UniversalCalculatorController {
    // Получить конфигурацию калькулятора
    static async getCalculatorConfig(req, res) {
        try {
            const { productType, productName } = req.query;
            if (!productType) {
                res.status(400).json({ error: 'Необходимо указать тип продукта' });
                return;
            }
            const config = await services_1.UniversalCalculatorService.getCalculatorConfig(productType, productName);
            res.json(config);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить все типы продуктов
    static async getProductTypes(req, res) {
        try {
            const types = await services_1.UniversalCalculatorService.getProductTypes();
            res.json(types);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить продукты по типу
    static async getProductsByType(req, res) {
        try {
            const { productType } = req.params;
            const products = await services_1.UniversalCalculatorService.getProductsByType(productType);
            res.json(products);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Рассчитать стоимость продукта
    static async calculateProductCost(req, res) {
        try {
            const { productType, productName, quantity, options } = req.body;
            if (!productType || !productName || !quantity) {
                res.status(400).json({ error: 'Необходимо указать тип продукта, название и количество' });
                return;
            }
            const result = await services_1.UniversalCalculatorService.calculateProductCost(productType, productName, quantity, options || {});
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Получить все правила
    static async getAllRules(req, res) {
        try {
            const { product_type, product_name, material_id, is_required } = req.query;
            const rules = await services_1.UniversalCalculatorService.getAllRules({
                product_type: product_type,
                product_name: product_name,
                material_id: material_id ? Number(material_id) : undefined,
                is_required: is_required === 'true' ? true : is_required === 'false' ? false : undefined
            });
            res.json(rules);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Создать или обновить правило
    static async createOrUpdateRule(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const rule = req.body;
            const result = await services_1.UniversalCalculatorService.createOrUpdateRule(rule);
            res.json(result);
        }
        catch (error) {
            const status = error.status || 500;
            res.status(status).json({ error: error.message });
        }
    }
    // Удалить правило
    static async deleteRule(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const ruleId = Number(req.params.id);
            await services_1.UniversalCalculatorService.deleteRule(ruleId);
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Клонировать правила
    static async cloneRules(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== 'admin') {
                res.status(403).json({ message: 'Forbidden' });
                return;
            }
            const { fromProductType, fromProductName, toProductType, toProductName } = req.body;
            if (!fromProductType || !fromProductName || !toProductType || !toProductName) {
                res.status(400).json({ error: 'Необходимо указать все параметры для клонирования' });
                return;
            }
            const result = await services_1.UniversalCalculatorService.cloneRules(fromProductType, fromProductName, toProductType, toProductName);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.UniversalCalculatorController = UniversalCalculatorController;
