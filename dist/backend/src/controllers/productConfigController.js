"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productConfigController = void 0;
const productConfigService_1 = require("../services/productConfigService");
exports.productConfigController = {
    // Получить все конфигурации продуктов
    async getAllProductConfigs(req, res) {
        try {
            const configs = await productConfigService_1.productConfigService.getAllProductConfigs();
            res.json(configs);
        }
        catch (error) {
            console.error('Ошибка получения конфигураций продуктов:', error);
            res.status(500).json({ error: 'Ошибка получения конфигураций продуктов' });
        }
    },
    // Получить конфигурацию продукта по ID
    async getProductConfigById(req, res) {
        try {
            const { id } = req.params;
            const config = await productConfigService_1.productConfigService.getProductConfigById(id);
            if (!config) {
                return res.status(404).json({ error: 'Конфигурация продукта не найдена' });
            }
            res.json(config);
        }
        catch (error) {
            console.error('Ошибка получения конфигурации продукта:', error);
            res.status(500).json({ error: 'Ошибка получения конфигурации продукта' });
        }
    },
    // Создать новую конфигурацию продукта
    async createProductConfig(req, res) {
        try {
            const configData = req.body;
            const newConfig = await productConfigService_1.productConfigService.createProductConfig(configData);
            res.status(201).json(newConfig);
        }
        catch (error) {
            console.error('Ошибка создания конфигурации продукта:', error);
            res.status(500).json({ error: 'Ошибка создания конфигурации продукта' });
        }
    },
    // Обновить конфигурацию продукта
    async updateProductConfig(req, res) {
        try {
            const { id } = req.params;
            const configData = req.body;
            const updatedConfig = await productConfigService_1.productConfigService.updateProductConfig(id, configData);
            if (!updatedConfig) {
                return res.status(404).json({ error: 'Конфигурация продукта не найдена' });
            }
            res.json(updatedConfig);
        }
        catch (error) {
            console.error('Ошибка обновления конфигурации продукта:', error);
            res.status(500).json({ error: 'Ошибка обновления конфигурации продукта' });
        }
    },
    // Удалить конфигурацию продукта
    async deleteProductConfig(req, res) {
        try {
            const { id } = req.params;
            const deleted = await productConfigService_1.productConfigService.deleteProductConfig(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Конфигурация продукта не найдена' });
            }
            res.json({ message: 'Конфигурация продукта удалена' });
        }
        catch (error) {
            console.error('Ошибка удаления конфигурации продукта:', error);
            res.status(500).json({ error: 'Ошибка удаления конфигурации продукта' });
        }
    }
};
