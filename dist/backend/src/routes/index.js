"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const orders_1 = __importDefault(require("./orders"));
const materials_1 = __importDefault(require("./materials"));
const materialCategories_1 = __importDefault(require("./materialCategories"));
const suppliers_1 = __importDefault(require("./suppliers"));
const materialReports_1 = __importDefault(require("./materialReports"));
const materialAlerts_1 = __importDefault(require("./materialAlerts"));
const materialBulk_1 = __importDefault(require("./materialBulk"));
const materialImportExport_1 = __importDefault(require("./materialImportExport"));
const materialCostTracking_1 = __importDefault(require("./materialCostTracking"));
const universalCalculator_1 = __importDefault(require("./universalCalculator"));
// import calculatorRoutes from './calculators' // MOVED TO ARCHIVE
const dailyReports_1 = __importDefault(require("./dailyReports"));
const webhooks_1 = __importDefault(require("./webhooks"));
const presets_1 = __importDefault(require("./presets"));
const reports_1 = __importDefault(require("./reports"));
const printers_1 = __importDefault(require("./printers"));
const users_1 = __importDefault(require("./users"));
const orderStatuses_1 = __importDefault(require("./orderStatuses"));
// import optimizedRoutes from './optimized' // Временно отключено
// import performanceRoutes from './performance' // Временно отключено
const pricing_1 = __importDefault(require("./pricing"));
// import databasePricingRoutes from './databasePricing' // Временно отключено
const enhancedCalculator_1 = __importDefault(require("./enhancedCalculator"));
const paperTypes_1 = __importDefault(require("./paperTypes"));
const dynamicPricing_1 = __importDefault(require("./dynamicPricing"));
const unifiedWarehouse_1 = __importDefault(require("./unifiedWarehouse"));
const warehouseTransactions_1 = __importDefault(require("./warehouseTransactions"));
// import autoMaterialDeductionRoutes from './autoMaterialDeduction' // Временно отключено
// import lowStockNotificationRoutes from './lowStockNotifications' // Временно отключено
const costCalculation_1 = __importDefault(require("./costCalculation"));
const materialsAnalytics_1 = __importDefault(require("./materialsAnalytics"));
const userRoles_1 = __importDefault(require("./userRoles"));
// import materialReservationsRoutes from './materialReservationsRoutes' // Временно отключено
const productConfigRoutes_1 = __importDefault(require("./productConfigRoutes"));
const priceManagement_1 = __importDefault(require("./priceManagement"));
const notifications_1 = __importDefault(require("./notifications"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/orders', orders_1.default);
router.use('/materials', materials_1.default);
router.use('/material-categories', materialCategories_1.default);
router.use('/suppliers', suppliers_1.default);
router.use('/material-reports', materialReports_1.default);
router.use('/material-alerts', materialAlerts_1.default);
router.use('/material-bulk', materialBulk_1.default);
router.use('/material-import-export', materialImportExport_1.default);
router.use('/material-cost-tracking', materialCostTracking_1.default);
router.use('/universal-calculator', universalCalculator_1.default);
// Отладочный endpoint
router.get('/debug-routes', (req, res) => {
    res.json({
        message: 'Роуты загружены',
        universalCalculator: 'OK',
        timestamp: new Date().toISOString()
    });
});
// router.use('/calculators', calculatorRoutes) // MOVED TO ARCHIVE
router.use('/daily-reports', dailyReports_1.default);
router.use('/webhooks', webhooks_1.default);
router.use('/presets', presets_1.default);
router.use('/reports', reports_1.default);
router.use('/printers', printers_1.default);
router.use('/users', users_1.default); // users
router.use('/order-statuses', orderStatuses_1.default); // order-statuses
// router.use('/optimized', optimizedRoutes) // optimized endpoints // Временно отключено
// router.use('/performance', performanceRoutes) // performance monitoring // Временно отключено
router.use('/pricing', pricing_1.default); // pricing policy
// router.use('/database-pricing', databasePricingRoutes) // database pricing // Временно отключено
router.use('/enhanced-calculator', enhancedCalculator_1.default); // enhanced calculator
router.use('/paper-types', paperTypes_1.default); // paper types and printing prices
router.use('/dynamic-pricing', dynamicPricing_1.default); // dynamic pricing system
router.use('/unified-warehouse', unifiedWarehouse_1.default); // unified warehouse system
router.use('/warehouse-transactions', warehouseTransactions_1.default); // warehouse transactions
// router.use('/auto-material-deduction', autoMaterialDeductionRoutes) // automatic material deduction // Временно отключено
// router.use('/low-stock-notifications', lowStockNotificationRoutes) // low stock notifications // Временно отключено
router.use('/cost-calculation', costCalculation_1.default); // cost calculation
router.use('/materials-analytics', materialsAnalytics_1.default); // materials analytics
router.use('/user-roles', userRoles_1.default); // user roles and permissions
// router.use('/material-reservations', materialReservationsRoutes) // material reservations // Временно отключено
router.use('/product-configs', productConfigRoutes_1.default); // product configurations
router.use('/price-management', priceManagement_1.default); // price management and history
router.use('/notifications', notifications_1.default); // notifications and automation
exports.default = router;
