"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMonitoringService = void 0;
const db_1 = require("../db");
const telegramService_1 = require("./telegramService");
const userNotificationService_1 = require("./userNotificationService");
class StockMonitoringService {
    /**
     * Инициализация мониторинга
     */
    static initialize(config) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
        console.log('📊 Stock monitoring service initialized:', this.config);
        if (this.config.enabled) {
            this.startMonitoring();
        }
    }
    /**
     * Запуск мониторинга
     */
    static startMonitoring() {
        if (this.isRunning) {
            console.log('⚠️ Stock monitoring is already running');
            return;
        }
        console.log(`🔄 Starting stock monitoring (interval: ${this.config.checkInterval} minutes)`);
        this.isRunning = true;
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.checkStockLevels();
            }
            catch (error) {
                console.error('❌ Error in stock monitoring:', error);
            }
        }, this.config.checkInterval * 60 * 1000);
        // Первоначальная проверка
        this.checkStockLevels();
    }
    /**
     * Остановка мониторинга
     */
    static stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isRunning = false;
        console.log('⏹️ Stock monitoring stopped');
    }
    /**
     * Проверка уровней запасов
     */
    static async checkStockLevels() {
        console.log('🔍 Checking stock levels...');
        const db = await (0, db_1.getDb)();
        // Получаем все материалы с их поставщиками и категориями
        const materials = await db.all(`
      SELECT 
        m.id, m.name, m.quantity, m.min_quantity, m.min_stock_level,
        s.name as supplier_name, s.contact as supplier_contact,
        c.name as category_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      WHERE m.is_active = 1
    `);
        const alerts = [];
        for (const material of materials) {
            const minStock = material.min_stock_level || material.min_quantity || 10;
            const currentQuantity = material.quantity || 0;
            // Определяем уровень предупреждения
            let alertLevel = null;
            if (currentQuantity <= 0) {
                alertLevel = 'out_of_stock';
            }
            else if (currentQuantity <= minStock) {
                alertLevel = 'critical';
            }
            else if (currentQuantity <= minStock * (this.config.lowStockThreshold / 100)) {
                alertLevel = 'low';
            }
            if (alertLevel) {
                const alert = {
                    id: Date.now() + Math.random(), // временный ID
                    materialId: material.id,
                    materialName: material.name,
                    currentQuantity,
                    minStockLevel: minStock,
                    supplierName: material.supplier_name,
                    supplierContact: material.supplier_contact,
                    categoryName: material.category_name,
                    alertLevel,
                    createdAt: new Date().toISOString(),
                    isResolved: false
                };
                alerts.push(alert);
                // Отправляем уведомление в Telegram (общее)
                const notification = {
                    materialId: material.id,
                    materialName: material.name,
                    currentQuantity,
                    minStockLevel: minStock,
                    supplierName: material.supplier_name,
                    supplierContact: material.supplier_contact,
                    categoryName: material.category_name
                };
                await telegramService_1.TelegramService.sendLowStockNotification(notification);
                // Отправляем уведомление админам через UserNotificationService
                await userNotificationService_1.UserNotificationService.sendLowStockAlert(material.name, currentQuantity, minStock, material.supplier_name);
                // Сохраняем предупреждение в базу данных
                await this.saveStockAlert(alert);
            }
        }
        console.log(`📊 Stock check completed. Found ${alerts.length} alerts`);
        return alerts;
    }
    /**
     * Сохранение предупреждения в базу данных
     */
    static async saveStockAlert(alert) {
        const db = await (0, db_1.getDb)();
        try {
            await db.run(`
        INSERT INTO stock_alerts (
          material_id, material_name, current_quantity, min_stock_level,
          supplier_name, supplier_contact, category_name, alert_level,
          created_at, is_resolved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                alert.materialId,
                alert.materialName,
                alert.currentQuantity,
                alert.minStockLevel,
                alert.supplierName || null,
                alert.supplierContact || null,
                alert.categoryName || null,
                alert.alertLevel,
                alert.createdAt,
                alert.isResolved ? 1 : 0
            ]);
        }
        catch (error) {
            console.error('❌ Failed to save stock alert:', error);
        }
    }
    /**
     * Получение активных предупреждений
     */
    static async getActiveAlerts() {
        const db = await (0, db_1.getDb)();
        const alerts = await db.all(`
      SELECT 
        id, material_id as materialId, material_name as materialName,
        current_quantity as currentQuantity, min_stock_level as minStockLevel,
        supplier_name as supplierName, supplier_contact as supplierContact,
        category_name as categoryName, alert_level as alertLevel,
        created_at as createdAt, is_resolved as isResolved,
        resolved_at as resolvedAt
      FROM stock_alerts
      WHERE is_resolved = 0
      ORDER BY created_at DESC
    `);
        return alerts;
    }
    /**
     * Отметка предупреждения как решенного
     */
    static async resolveAlert(alertId) {
        const db = await (0, db_1.getDb)();
        await db.run(`
      UPDATE stock_alerts 
      SET is_resolved = 1, resolved_at = datetime('now')
      WHERE id = ?
    `, alertId);
    }
    /**
     * Получение конфигурации
     */
    static getConfig() {
        return { ...this.config };
    }
    /**
     * Обновление конфигурации
     */
    static updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📊 Stock monitoring config updated:', this.config);
        // Перезапускаем мониторинг с новой конфигурацией
        if (this.config.enabled) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }
    /**
     * Ручная проверка конкретного материала
     */
    static async checkMaterialStock(materialId) {
        const db = await (0, db_1.getDb)();
        const material = await db.get(`
      SELECT 
        m.id, m.name, m.quantity, m.min_quantity, m.min_stock_level,
        s.name as supplier_name, s.contact as supplier_contact,
        c.name as category_name
      FROM materials m
      LEFT JOIN suppliers s ON s.id = m.supplier_id
      LEFT JOIN material_categories c ON c.id = m.category_id
      WHERE m.id = ? AND m.is_active = 1
    `, materialId);
        if (!material) {
            return null;
        }
        const minStock = material.min_stock_level || material.min_quantity || 10;
        const currentQuantity = material.quantity || 0;
        let alertLevel = null;
        if (currentQuantity <= 0) {
            alertLevel = 'out_of_stock';
        }
        else if (currentQuantity <= minStock) {
            alertLevel = 'critical';
        }
        else if (currentQuantity <= minStock * (this.config.lowStockThreshold / 100)) {
            alertLevel = 'low';
        }
        if (alertLevel) {
            const alert = {
                id: Date.now() + Math.random(),
                materialId: material.id,
                materialName: material.name,
                currentQuantity,
                minStockLevel: minStock,
                supplierName: material.supplier_name,
                supplierContact: material.supplier_contact,
                categoryName: material.category_name,
                alertLevel,
                createdAt: new Date().toISOString(),
                isResolved: false
            };
            return alert;
        }
        return null;
    }
}
exports.StockMonitoringService = StockMonitoringService;
StockMonitoringService.config = {
    enabled: true,
    checkInterval: 30, // 30 минут
    lowStockThreshold: 120, // 120% от минимального уровня
    criticalStockThreshold: 100, // 100% от минимального уровня
    autoOrderEnabled: false,
    autoOrderThreshold: 80 // 80% от минимального уровня
};
StockMonitoringService.monitoringInterval = null;
StockMonitoringService.isRunning = false;
