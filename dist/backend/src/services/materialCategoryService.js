"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialCategoryService = void 0;
const database_1 = require("../config/database");
class MaterialCategoryService {
    static async getAllCategories() {
        const db = await (0, database_1.getDb)();
        const categories = await db.all('SELECT id, name, description, color, created_at, updated_at FROM material_categories ORDER BY name');
        return categories;
    }
    static async getCategoryById(id) {
        const db = await (0, database_1.getDb)();
        const category = await db.get('SELECT id, name, description, color, created_at, updated_at FROM material_categories WHERE id = ?', id);
        return category;
    }
    static async createCategory(category) {
        const db = await (0, database_1.getDb)();
        try {
            const result = await db.run('INSERT INTO material_categories (name, description, color) VALUES (?, ?, ?)', category.name, category.description || null, category.color || '#1976d2');
            const newCategory = await db.get('SELECT id, name, description, color, created_at, updated_at FROM material_categories WHERE id = ?', result.lastID);
            return newCategory;
        }
        catch (e) {
            if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')) {
                const err = new Error('Категория с таким именем уже существует');
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    static async updateCategory(id, category) {
        const db = await (0, database_1.getDb)();
        try {
            await db.run('UPDATE material_categories SET name = ?, description = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', category.name, category.description || null, category.color || '#1976d2', id);
            const updatedCategory = await db.get('SELECT id, name, description, color, created_at, updated_at FROM material_categories WHERE id = ?', id);
            return updatedCategory;
        }
        catch (e) {
            if (e && typeof e.message === 'string' && e.message.includes('UNIQUE constraint failed')) {
                const err = new Error('Категория с таким именем уже существует');
                err.status = 409;
                throw err;
            }
            throw e;
        }
    }
    static async deleteCategory(id) {
        const db = await (0, database_1.getDb)();
        // Проверяем, есть ли материалы в этой категории
        const materialsCount = await db.get('SELECT COUNT(*) as count FROM materials WHERE category_id = ?', id);
        if (materialsCount && materialsCount.count > 0) {
            const err = new Error('Нельзя удалить категорию, в которой есть материалы');
            err.status = 400;
            throw err;
        }
        await db.run('DELETE FROM material_categories WHERE id = ?', id);
    }
    static async getCategoryStats() {
        const db = await (0, database_1.getDb)();
        const stats = await db.all(`SELECT 
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        COUNT(m.id) as materials_count,
        COALESCE(SUM(m.quantity), 0) as total_quantity,
        COALESCE(SUM(m.quantity * COALESCE(m.sheet_price_single, 0)), 0) as total_value
       FROM material_categories c
       LEFT JOIN materials m ON m.category_id = c.id
       GROUP BY c.id, c.name, c.color
       ORDER BY c.name`);
        return stats;
    }
}
exports.MaterialCategoryService = MaterialCategoryService;
