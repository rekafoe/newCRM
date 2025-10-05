"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersCacheInvalidation = exports.materialsCacheInvalidation = exports.ordersCacheInvalidation = exports.usersCache = exports.materialsCache = exports.ordersCache = exports.cacheInvalidation = exports.cacheMiddleware = void 0;
const cacheService_1 = require("../services/cacheService");
// Middleware для кэширования GET запросов
const cacheMiddleware = (options = {}) => {
    const { ttl = 5 * 60 * 1000, // 5 минут по умолчанию
    keyGenerator = (req) => cacheService_1.CacheService.generateKey(req.method, req.path, req.query), skipCache = () => false } = options;
    return (req, res, next) => {
        // Кэшируем только GET запросы
        if (req.method !== 'GET') {
            return next();
        }
        // Пропускаем кэширование если указано в опциях
        if (skipCache(req)) {
            return next();
        }
        const cacheKey = keyGenerator(req);
        // Проверяем кэш
        const cachedData = cacheService_1.cacheService.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit: ${cacheKey}`);
            return res.json(cachedData);
        }
        // Сохраняем оригинальный res.json
        const originalJson = res.json.bind(res);
        // Переопределяем res.json для кэширования ответа
        res.json = function (data) {
            // Кэшируем только успешные ответы (статус 200)
            if (res.statusCode === 200) {
                cacheService_1.cacheService.set(cacheKey, data, ttl);
                console.log(`Cache set: ${cacheKey}`);
            }
            return originalJson(data);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
// Middleware для очистки кэша при изменениях
const cacheInvalidation = (pattern) => {
    return (req, res, next) => {
        // Сохраняем оригинальный res.json
        const originalJson = res.json.bind(res);
        // Переопределяем res.json для очистки кэша
        res.json = function (data) {
            // Очищаем кэш только при успешных операциях
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const deleted = cacheService_1.cacheService.deletePattern(pattern);
                if (deleted > 0) {
                    console.log(`Cache invalidated: ${deleted} items matching pattern "${pattern}"`);
                }
            }
            return originalJson(data);
        };
        next();
    };
};
exports.cacheInvalidation = cacheInvalidation;
// Специфичные middleware для разных типов данных
exports.ordersCache = (0, exports.cacheMiddleware)({
    ttl: 2 * 60 * 1000, // 2 минуты для заказов
    skipCache: (req) => {
        // Не кэшируем если есть параметры фильтрации
        return Object.keys(req.query).length > 0;
    }
});
exports.materialsCache = (0, exports.cacheMiddleware)({
    ttl: 10 * 60 * 1000, // 10 минут для материалов
});
exports.usersCache = (0, exports.cacheMiddleware)({
    ttl: 15 * 60 * 1000, // 15 минут для пользователей
});
// Middleware для очистки кэша заказов
exports.ordersCacheInvalidation = (0, exports.cacheInvalidation)('GET:/api/orders');
// Middleware для очистки кэша материалов
exports.materialsCacheInvalidation = (0, exports.cacheInvalidation)('GET:/api/materials');
// Middleware для очистки кэша пользователей
exports.usersCacheInvalidation = (0, exports.cacheInvalidation)('GET:/api/users');
