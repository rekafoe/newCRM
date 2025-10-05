"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const app_1 = require("./config/app");
const upload_1 = require("./config/upload");
const middleware_1 = require("./middleware");
const performance_1 = require("./middleware/performance");
const compression_1 = require("./middleware/compression");
const routes_1 = __importDefault(require("./routes"));
const telegramService_1 = require("./services/telegramService");
const stockMonitoringService_1 = require("./services/stockMonitoringService");
const autoOrderService_1 = require("./services/autoOrderService");
const userNotificationService_1 = require("./services/userNotificationService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: app_1.config.corsOrigin }));
app.use(compression_1.compressionMiddleware); // Сжатие ответов
app.use(performance_1.performanceMiddleware); // Мониторинг производительности
app.use(performance_1.performanceLoggingMiddleware); // Логирование производительности
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Static files
app.use('/uploads', express_1.default.static(upload_1.uploadsDir));
// Health check (before auth middleware)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Authentication middleware
app.use(middleware_1.authMiddleware);
// Routes
app.use('/api', routes_1.default);
// Error handling
app.use(middleware_1.errorHandler);
// Initialize database and start server
async function startServer() {
    try {
        await (0, database_1.initDB)();
        console.log('✅ Database initialized');
        // Инициализация сервисов уведомлений
        const telegramConfig = {
            botToken: process.env.TELEGRAM_BOT_TOKEN || '',
            chatId: process.env.TELEGRAM_CHAT_ID || '',
            enabled: process.env.TELEGRAM_ENABLED === 'true'
        };
        telegramService_1.TelegramService.initialize(telegramConfig);
        const stockMonitoringConfig = {
            enabled: process.env.STOCK_MONITORING_ENABLED !== 'false',
            checkInterval: parseInt(process.env.STOCK_CHECK_INTERVAL || '30'),
            lowStockThreshold: parseInt(process.env.LOW_STOCK_THRESHOLD || '120'),
            criticalStockThreshold: parseInt(process.env.CRITICAL_STOCK_THRESHOLD || '100'),
            autoOrderEnabled: process.env.AUTO_ORDER_ENABLED === 'true',
            autoOrderThreshold: parseInt(process.env.AUTO_ORDER_THRESHOLD || '80')
        };
        stockMonitoringService_1.StockMonitoringService.initialize(stockMonitoringConfig);
        const autoOrderConfig = {
            enabled: process.env.AUTO_ORDER_ENABLED === 'true',
            minOrderAmount: parseFloat(process.env.MIN_ORDER_AMOUNT || '100'),
            maxOrderAmount: parseFloat(process.env.MAX_ORDER_AMOUNT || '10000'),
            orderFrequency: process.env.ORDER_FREQUENCY || 'weekly',
            preferredDeliveryDays: process.env.PREFERRED_DELIVERY_DAYS?.split(',').map(Number) || [1, 2, 3, 4, 5],
            autoApproveOrders: process.env.AUTO_APPROVE_ORDERS === 'true',
            notificationEnabled: process.env.ORDER_NOTIFICATIONS_ENABLED !== 'false'
        };
        autoOrderService_1.AutoOrderService.initialize(autoOrderConfig);
        // Инициализация сервиса пользовательских уведомлений
        await userNotificationService_1.UserNotificationService.initialize();
        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📁 Uploads directory: ${upload_1.uploadsDir}`);
            console.log(`🤖 Telegram notifications: ${telegramConfig.enabled ? 'enabled' : 'disabled'}`);
            console.log(`📊 Stock monitoring: ${stockMonitoringConfig.enabled ? 'enabled' : 'disabled'}`);
            console.log(`🛒 Auto ordering: ${autoOrderConfig.enabled ? 'enabled' : 'disabled'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
