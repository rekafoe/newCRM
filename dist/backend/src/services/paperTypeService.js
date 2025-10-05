"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperTypeService = void 0;
const database_1 = require("../config/database");
class PaperTypeService {
    // Получить все типы бумаги с материалами и ценами
    static async getAllPaperTypes() {
        const db = await (0, database_1.getDb)();
        const paperTypes = await db.all('SELECT * FROM paper_types ORDER BY display_name');
        console.log('Найдено типов бумаги:', paperTypes.length);
        // Загружаем материалы для каждого типа бумаги
        const paperTypesWithMaterials = await Promise.all(paperTypes.map(async (paperType) => {
            // Получаем материалы, связанные с этим типом бумаги
            const materials = await db.all(`SELECT m.*, c.name as category_name 
           FROM materials m 
           LEFT JOIN material_categories c ON m.category_id = c.id 
           WHERE m.paper_type_id = ? 
           ORDER BY m.density`, paperType.id);
            console.log(`Материалы для ${paperType.display_name}:`, materials);
            // Создаем объект цен из материалов для обратной совместимости
            const pricesObject = materials.reduce((acc, material) => {
                if (material.density && (material.sheet_price_single || material.price)) {
                    acc[material.density] = material.sheet_price_single || material.price;
                }
                return acc;
            }, {});
            console.log(`Цены из материалов для ${paperType.display_name}:`, pricesObject);
            return {
                ...paperType,
                materials: materials,
                prices: pricesObject // Для обратной совместимости
            };
        }));
        console.log('Итоговые данные с материалами:', paperTypesWithMaterials);
        return paperTypesWithMaterials;
    }
    // Получить тип бумаги с материалами
    static async getPaperTypeWithMaterials(paperTypeId) {
        const db = await (0, database_1.getDb)();
        const paperType = await db.get('SELECT * FROM paper_types WHERE id = ? AND is_active = 1', paperTypeId);
        if (!paperType)
            return null;
        // Получаем материалы, связанные с этим типом бумаги
        const materials = await db.all(`SELECT m.*, c.name as category_name 
       FROM materials m 
       LEFT JOIN material_categories c ON m.category_id = c.id 
       WHERE m.paper_type_id = ? 
       ORDER BY m.density`, paperTypeId);
        // Создаем объект цен из материалов для обратной совместимости
        const pricesObject = materials.reduce((acc, material) => {
            if (material.density && (material.sheet_price_single || material.price)) {
                acc[material.density] = material.sheet_price_single || material.price;
            }
            return acc;
        }, {});
        return {
            ...paperType,
            materials: materials,
            prices: pricesObject
        };
    }
    // Получить все типы бумаги с материалами (алиас для getAllPaperTypes)
    static async getAllPaperTypesWithMaterials() {
        return this.getAllPaperTypes();
    }
    // Создать новый тип бумаги
    static async createPaperType(paperType) {
        const db = await (0, database_1.getDb)();
        const result = await db.run('INSERT INTO paper_types (name, display_name, search_keywords, is_active) VALUES (?, ?, ?, ?)', paperType.name, paperType.display_name, paperType.search_keywords, paperType.is_active);
        const newPaperType = await db.get('SELECT * FROM paper_types WHERE id = ?', result.lastID);
        return newPaperType;
    }
    // Обновить тип бумаги
    static async updatePaperType(id, paperType) {
        const db = await (0, database_1.getDb)();
        const fields = Object.keys(paperType).map(key => `${key} = ?`).join(', ');
        const values = Object.values(paperType);
        await db.run(`UPDATE paper_types SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ...values, id);
        const updatedPaperType = await db.get('SELECT * FROM paper_types WHERE id = ?', id);
        return updatedPaperType;
    }
    // Удалить тип бумаги (физическое удаление с каскадным удалением связанных данных)
    static async deletePaperType(id) {
        const db = await (0, database_1.getDb)();
        try {
            // Временно отключаем проверку внешних ключей
            await db.run('PRAGMA foreign_keys = OFF');
            // Удаляем из других таблиц, которые могут ссылаться на paper_types
            await db.run('DELETE FROM printing_prices WHERE paper_type_id = ?', id);
            // Затем удаляем сам тип бумаги
            await db.run('DELETE FROM paper_types WHERE id = ?', id);
            // Включаем обратно проверку внешних ключей
            await db.run('PRAGMA foreign_keys = ON');
        }
        catch (error) {
            // Включаем обратно проверку внешних ключей в случае ошибки
            await db.run('PRAGMA foreign_keys = ON');
            throw error;
        }
    }
    // Добавить материал к типу бумаги
    static async addMaterialToPaperType(paperTypeId, materialId) {
        const db = await (0, database_1.getDb)();
        await db.run('UPDATE materials SET paper_type_id = ? WHERE id = ?', paperTypeId, materialId);
    }
    // Удалить связь материала с типом бумаги
    static async removeMaterialFromPaperType(materialId) {
        const db = await (0, database_1.getDb)();
        await db.run('UPDATE materials SET paper_type_id = NULL WHERE id = ?', materialId);
    }
    // Найти тип бумаги по ключевым словам в названии материала
    static async findPaperTypeByMaterialName(materialName) {
        const db = await (0, database_1.getDb)();
        const paperTypes = await this.getAllPaperTypes();
        for (const paperType of paperTypes) {
            const keywords = paperType.search_keywords.split(',').map(k => k.trim().toLowerCase());
            for (const keyword of keywords) {
                if (materialName.toLowerCase().includes(keyword)) {
                    return paperType;
                }
            }
        }
        return null;
    }
    // Получить цену материала для типа бумаги и плотности
    static async getMaterialPrice(paperTypeId, density) {
        const db = await (0, database_1.getDb)();
        const material = await db.get('SELECT sheet_price_single, price FROM materials WHERE paper_type_id = ? AND density = ?', paperTypeId, density);
        return material?.sheet_price_single || material?.price || null;
    }
}
exports.PaperTypeService = PaperTypeService;
