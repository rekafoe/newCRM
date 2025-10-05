"use strict";
// Используем встроенный fetch (Node.js 18+)
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
class TelegramService {
    /**
     * Инициализация конфигурации Telegram
     */
    static initialize(config) {
        this.config = config;
        console.log('🤖 Telegram service initialized:', {
            enabled: config.enabled,
            chatId: config.chatId ? `${config.chatId.substring(0, 4)}...` : 'not set'
        });
    }
    /**
     * Проверка доступности сервиса
     */
    static isEnabled() {
        return this.config?.enabled && !!this.config?.botToken && !!this.config?.chatId;
    }
    /**
     * Отправка уведомления о низких остатках
     */
    static async sendLowStockNotification(notification) {
        if (!this.isEnabled()) {
            console.log('⚠️ Telegram notifications disabled');
            return false;
        }
        const message = this.formatLowStockMessage(notification);
        return this.sendMessage(message);
    }
    /**
     * Отправка уведомления о заказе поставщику
     */
    static async sendOrderNotification(notification) {
        if (!this.isEnabled()) {
            console.log('⚠️ Telegram notifications disabled');
            return false;
        }
        const message = this.formatOrderMessage(notification);
        return this.sendMessage(message);
    }
    /**
     * Отправка общего уведомления
     */
    static async sendNotification(title, message, priority = 'medium') {
        if (!this.isEnabled()) {
            console.log('⚠️ Telegram notifications disabled');
            return false;
        }
        const emoji = priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️';
        const formattedMessage = `${emoji} *${title}*\n\n${message}`;
        return this.sendMessage(formattedMessage);
    }
    /**
     * Отправка сообщения в Telegram
     */
    static async sendMessage(message) {
        if (!this.config) {
            console.error('❌ Telegram config not initialized');
            return false;
        }
        try {
            const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.config.chatId,
                    text: message,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                })
            });
            const data = await response.json();
            if (data.ok) {
                console.log('✅ Telegram message sent successfully');
                return true;
            }
            else {
                console.error('❌ Telegram API error:', data);
                return false;
            }
        }
        catch (error) {
            console.error('❌ Failed to send Telegram message:', error.message);
            return false;
        }
    }
    /**
     * Форматирование сообщения о низких остатках
     */
    static formatLowStockMessage(notification) {
        const { materialName, currentQuantity, minStockLevel, supplierName, supplierContact, categoryName } = notification;
        let message = `🚨 *Низкий остаток материала*\n\n`;
        message += `📦 *Материал:* ${materialName}\n`;
        message += `📊 *Текущий остаток:* ${currentQuantity}\n`;
        message += `⚠️ *Минимальный уровень:* ${minStockLevel}\n`;
        if (categoryName) {
            message += `🏷️ *Категория:* ${categoryName}\n`;
        }
        if (supplierName) {
            message += `🏢 *Поставщик:* ${supplierName}\n`;
        }
        if (supplierContact) {
            message += `📞 *Контакт:* ${supplierContact}\n`;
        }
        message += `\n💡 *Рекомендация:* Необходимо пополнить запас`;
        return message;
    }
    /**
     * Форматирование сообщения о заказе
     */
    static formatOrderMessage(notification) {
        const { orderId, supplierName, supplierContact, materials, totalAmount, deliveryDate } = notification;
        let message = `📋 *Новый заказ поставщику*\n\n`;
        message += `🆔 *Заказ №:* ${orderId}\n`;
        message += `🏢 *Поставщик:* ${supplierName}\n`;
        if (supplierContact) {
            message += `📞 *Контакт:* ${supplierContact}\n`;
        }
        if (deliveryDate) {
            message += `📅 *Дата поставки:* ${deliveryDate}\n`;
        }
        message += `\n📦 *Материалы:*\n`;
        materials.forEach((material, index) => {
            message += `${index + 1}. ${material.name} - ${material.quantity} ${material.unit} (${material.price} BYN)\n`;
        });
        message += `\n💰 *Общая сумма:* ${totalAmount.toFixed(2)} BYN`;
        return message;
    }
    /**
     * Тестовая отправка сообщения
     */
    static async sendTestMessage() {
        const testMessage = `🧪 *Тестовое сообщение*\n\nСистема уведомлений работает корректно!`;
        return this.sendMessage(testMessage);
    }
}
exports.TelegramService = TelegramService;
TelegramService.config = null;
