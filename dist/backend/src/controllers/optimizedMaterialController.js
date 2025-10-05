"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimizedMaterialController = void 0;
const optimizedQueries_1 = require("../services/optimizedQueries");
const cacheService_1 = require("../services/cacheService");
const middleware_1 = require("../middleware");
class OptimizedMaterialController {
}
exports.OptimizedMaterialController = OptimizedMaterialController;
_a = OptimizedMaterialController;
// Оптимизированная загрузка материалов с кэшированием
OptimizedMaterialController.getMaterials = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { categoryId, supplierId, search } = req.query;
    const filters = {
        categoryId: categoryId ? Number(categoryId) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        search: search
    };
    const cacheKey = cacheService_1.CacheService.getMaterialsKey(filters);
    const cached = cacheService_1.CacheService.get(cacheKey);
    if (cached) {
        res.json(cached);
        return;
    }
    const materials = await optimizedQueries_1.OptimizedQueries.getMaterialsWithDetails(filters);
    // Cache for 5 minutes
    cacheService_1.CacheService.set(cacheKey, materials, 5 * 60 * 1000);
    res.json(materials);
});
// Отчет по потреблению материалов
OptimizedMaterialController.getConsumptionReport = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { dateFrom, dateTo } = req.query;
    if (!dateFrom || !dateTo) {
        res.status(400).json({ error: 'dateFrom and dateTo are required' });
        return;
    }
    const cacheKey = `materials:consumption:${dateFrom}:${dateTo}`;
    const cached = cacheService_1.CacheService.get(cacheKey);
    if (cached) {
        res.json(cached);
        return;
    }
    const report = await optimizedQueries_1.OptimizedQueries.getMaterialConsumptionReport(dateFrom, dateTo);
    // Cache for 10 minutes
    cacheService_1.CacheService.set(cacheKey, report, 10 * 60 * 1000);
    res.json(report);
});
// Инвалидация кэша материалов
OptimizedMaterialController.invalidateCache = (0, middleware_1.asyncHandler)(async (req, res) => {
    cacheService_1.CacheService.invalidateMaterials();
    res.json({ message: 'Materials cache invalidated' });
});
