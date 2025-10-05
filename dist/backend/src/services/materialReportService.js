"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialReportService = void 0;
const database_1 = require("../config/database");
class MaterialReportService {
    // Отчет по остаткам материалов
    static async getInventoryReport(filters) {
        const { categoryId, supplierId, lowStockOnly } = filters;
        const where = [];
        const params = [];
        if (categoryId) {
            where.push('m.category_id = ?');
            params.push(Number(categoryId));
        }
        if (supplierId) {
            where.push('m.supplier_id = ?');
            params.push(Number(supplierId));
        }
        if (lowStockOnly) {
            where.push('m.quantity <= COALESCE(m.min_quantity, 0)');
        }
        const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const db = await (0, database_1.getDb)();
        const report = await db.all(`SELECT 
        m.id, m.name, m.unit, m.quantity, m.min_quantity, m.sheet_price_single,
        c.name as category_name, c.color as category_color,
        s.name as supplier_name, s.contact_person as supplier_contact,
        CASE 
          WHEN m.quantity <= COALESCE(m.min_quantity, 0) THEN 'low'
          WHEN m.quantity <= COALESCE(m.min_quantity, 0) * 1.5 THEN 'warning'
          ELSE 'ok'
        END as stock_status,
        (m.quantity * COALESCE(m.sheet_price_single, 0)) as total_value
       FROM materials m
       LEFT JOIN material_categories c ON c.id = m.category_id
       LEFT JOIN suppliers s ON s.id = m.supplier_id
      ${whereSql}
      ORDER BY c.name, m.name`, ...params);
        return report;
    }
    // Отчет по расходу материалов за период
    static async getConsumptionReport(filters) {
        const { from, to, categoryId, supplierId, materialId } = filters;
        const where = ['mm.created_at >= ?', 'mm.created_at <= ?'];
        const params = [from, to];
        if (categoryId) {
            where.push('m.category_id = ?');
            params.push(Number(categoryId));
        }
        if (supplierId) {
            where.push('m.supplier_id = ?');
            params.push(Number(supplierId));
        }
        if (materialId) {
            where.push('mm.materialId = ?');
            params.push(Number(materialId));
        }
        const whereSql = 'WHERE ' + where.join(' AND ');
        const db = await (0, database_1.getDb)();
        const report = await db.all(`SELECT 
        m.id as material_id, m.name as material_name, m.unit,
        c.name as category_name, s.name as supplier_name,
        SUM(CASE WHEN mm.delta < 0 THEN ABS(mm.delta) ELSE 0 END) as total_consumed,
        SUM(CASE WHEN mm.delta > 0 THEN mm.delta ELSE 0 END) as total_received,
        COUNT(CASE WHEN mm.delta < 0 THEN 1 END) as consumption_count,
        COUNT(CASE WHEN mm.delta > 0 THEN 1 END) as receipt_count,
        AVG(CASE WHEN mm.delta < 0 THEN ABS(mm.delta) END) as avg_consumption
       FROM material_moves mm
       JOIN materials m ON m.id = mm.materialId
       LEFT JOIN material_categories c ON c.id = m.category_id
       LEFT JOIN suppliers s ON s.id = m.supplier_id
      ${whereSql}
      GROUP BY m.id, m.name, m.unit, c.name, s.name
      HAVING total_consumed > 0
      ORDER BY total_consumed DESC`, ...params);
        return report;
    }
    // Отчет по стоимости материалов
    static async getCostReport(filters) {
        const { categoryId, supplierId } = filters;
        const where = [];
        const params = [];
        if (categoryId) {
            where.push('m.category_id = ?');
            params.push(Number(categoryId));
        }
        if (supplierId) {
            where.push('m.supplier_id = ?');
            params.push(Number(supplierId));
        }
        const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
        const db = await (0, database_1.getDb)();
        const report = await db.all(`SELECT 
        m.id, m.name, m.unit, m.quantity, m.sheet_price_single,
        c.name as category_name, s.name as supplier_name,
        (m.quantity * COALESCE(m.sheet_price_single, 0)) as total_value,
        CASE 
          WHEN m.sheet_price_single IS NULL THEN 'Не указана'
          ELSE 'Указана'
        END as price_status
       FROM materials m
       LEFT JOIN material_categories c ON c.id = m.category_id
       LEFT JOIN suppliers s ON s.id = m.supplier_id
      ${whereSql}
      ORDER BY total_value DESC`, ...params);
        return report;
    }
    // Сводный отчет по материалам
    static async getSummaryReport() {
        const db = await (0, database_1.getDb)();
        const summary = await db.get(`SELECT 
        COUNT(m.id) as total_materials,
        COUNT(DISTINCT m.category_id) as total_categories,
        COUNT(DISTINCT m.supplier_id) as total_suppliers,
        SUM(m.quantity * COALESCE(m.sheet_price_single, 0)) as total_value,
        COUNT(CASE WHEN m.quantity <= COALESCE(m.min_quantity, 0) THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN m.sheet_price_single IS NULL THEN 1 END) as materials_without_price
       FROM materials m`);
        return summary;
    }
    // Отчет по движению материалов по дням
    static async getDailyMovementReport(filters) {
        const { from, to, categoryId, supplierId } = filters;
        const where = ['DATE(mm.created_at) >= ?', 'DATE(mm.created_at) <= ?'];
        const params = [from, to];
        if (categoryId) {
            where.push('m.category_id = ?');
            params.push(Number(categoryId));
        }
        if (supplierId) {
            where.push('m.supplier_id = ?');
            params.push(Number(supplierId));
        }
        const whereSql = 'WHERE ' + where.join(' AND ');
        const db = await (0, database_1.getDb)();
        const report = await db.all(`SELECT 
        DATE(mm.created_at) as date,
        COUNT(*) as total_moves,
        SUM(CASE WHEN mm.delta < 0 THEN ABS(mm.delta) ELSE 0 END) as total_consumed,
        SUM(CASE WHEN mm.delta > 0 THEN mm.delta ELSE 0 END) as total_received,
        COUNT(DISTINCT mm.materialId) as unique_materials,
        COUNT(DISTINCT mm.user_id) as unique_users
       FROM material_moves mm
       JOIN materials m ON m.id = mm.materialId
      ${whereSql}
      GROUP BY DATE(mm.created_at)
      ORDER BY date DESC`, ...params);
        return report;
    }
}
exports.MaterialReportService = MaterialReportService;
