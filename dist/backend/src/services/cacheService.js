"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
class CacheService {
    constructor() {
        this.cache = new Map();
        this.maxSize = 1000; // Максимальное количество элементов в кэше
        // Очистка устаревших элементов каждые 5 минут
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    set(key, data, ttl = 5 * 60 * 1000) {
        // Если кэш переполнен, удаляем самые старые элементы
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // Проверяем, не истек ли TTL
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item) {
            return false;
        }
        // Проверяем TTL
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    // Удаление элементов по паттерну
    deletePattern(pattern) {
        let deleted = 0;
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deleted++;
            }
        }
        return deleted;
    }
    // Получение статистики кэша
    getStats() {
        const now = Date.now();
        let validItems = 0;
        let expiredItems = 0;
        for (const item of this.cache.values()) {
            if (now - item.timestamp > item.ttl) {
                expiredItems++;
            }
            else {
                validItems++;
            }
        }
        return {
            total: this.cache.size,
            valid: validItems,
            expired: expiredItems,
            maxSize: this.maxSize
        };
    }
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`Cache cleanup: removed ${cleaned} expired items`);
        }
    }
    evictOldest() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    // Генерация ключа кэша для API запросов
    static generateKey(method, path, query) {
        const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
        return `${method}:${path}${queryString}`;
    }
    // Очистка кэша при завершении приложения
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
    }
}
exports.CacheService = CacheService;
// Создаем глобальный экземпляр кэша
exports.cacheService = new CacheService();
