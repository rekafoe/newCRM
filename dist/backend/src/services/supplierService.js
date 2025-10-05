"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const database_1 = require("../config/database");
class SupplierService {
    static async getAllSuppliers() {
        const db = await (0, database_1.getDb)();
        const suppliers = await db.all('SELECT id, name, contact_person, phone, email, address, notes, is_active, created_at, updated_at FROM suppliers ORDER BY name');
        return suppliers;
    }
    static async getActiveSuppliers() {
        const db = await (0, database_1.getDb)();
        const suppliers = await db.all('SELECT id, name, contact_person, phone, email, address, notes, is_active, created_at, updated_at FROM suppliers WHERE is_active = 1 ORDER BY name');
        return suppliers;
    }
    static async getSupplierById(id) {
        const db = await (0, database_1.getDb)();
        const supplier = await db.get('SELECT id, name, contact_person, phone, email, address, notes, is_active, created_at, updated_at FROM suppliers WHERE id = ?', id);
        return supplier;
    }
    static async createSupplier(supplier) {
        const db = await (0, database_1.getDb)();
        try {
            const result = await db.run('INSERT INTO suppliers (name, contact_person, phone, email, address, notes, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)', supplier.name, supplier.contact_person || null, supplier.phone || null, supplier.email || null, supplier.address || null, supplier.notes || null, supplier.is_active !== false ? 1 : 0);
            const newSupplier = await db.get('SELECT id, name, contact_person, phone, email, address, notes, is_active, created_at, updated_at FROM suppliers WHERE id = ?', result.lastID);
            return newSupplier;
        }
        catch (e) {
            if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')) {
                const err = new Error('Поставщик с таким именем уже существует');
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    static async updateSupplier(id, supplier) {
        const db = await (0, database_1.getDb)();
        try {
            await db.run('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', supplier.name, supplier.contact_person || null, supplier.phone || null, supplier.email || null, supplier.address || null, supplier.notes || null, supplier.is_active !== false ? 1 : 0, id);
            const updatedSupplier = await db.get('SELECT id, name, contact_person, phone, email, address, notes, is_active, created_at, updated_at FROM suppliers WHERE id = ?', id);
            return updatedSupplier;
        }
        catch (e) {
            if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')) {
                const err = new Error('Поставщик с таким именем уже существует');
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    static async deleteSupplier(id) {
        const db = await (0, database_1.getDb)();
        // Проверяем, есть ли материалы у этого поставщика
        const materialsCount = await db.get('SELECT COUNT(*) as count FROM materials WHERE supplier_id = ?', id);
        if (materialsCount && materialsCount.count > 0) {
            const err = new Error('Нельзя удалить поставщика, у которого есть материалы');
            err.status = 400;
            throw err;
        }
        await db.run('DELETE FROM suppliers WHERE id = ?', id);
    }
    static async getSupplierStats() {
        const db = await (0, database_1.getDb)();
        const stats = await db.all(`SELECT 
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(m.id) as materials_count,
        COALESCE(SUM(m.quantity), 0) as total_quantity,
        COALESCE(SUM(m.quantity * COALESCE(m.sheet_price_single, 0)), 0) as total_value
       FROM suppliers s
       LEFT JOIN materials m ON m.supplier_id = s.id
       GROUP BY s.id, s.name
       ORDER BY s.name`);
        return stats;
    }
    static async getSupplierMaterials(supplierId) {
        const db = await (0, database_1.getDb)();
        const materials = await db.all(`SELECT 
        m.id, m.name, m.unit, m.quantity, m.min_quantity, m.sheet_price_single,
        c.name as category_name, c.color as category_color
       FROM materials m
       LEFT JOIN material_categories c ON c.id = m.category_id
       WHERE m.supplier_id = ?
       ORDER BY m.name`, supplierId);
        return materials;
    }
}
exports.SupplierService = SupplierService;
