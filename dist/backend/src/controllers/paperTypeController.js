"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperTypeController = void 0;
const paperTypeService_1 = require("../services/paperTypeService");
const middleware_1 = require("../middleware");
class PaperTypeController {
}
exports.PaperTypeController = PaperTypeController;
_a = PaperTypeController;
// Получить все типы бумаги
PaperTypeController.getAllPaperTypes = (0, middleware_1.asyncHandler)(async (req, res) => {
    const paperTypes = await paperTypeService_1.PaperTypeService.getAllPaperTypes();
    res.json(paperTypes);
});
// Получить тип бумаги по ID
PaperTypeController.getPaperTypeById = (0, middleware_1.asyncHandler)(async (req, res) => {
    const id = Number(req.params.id);
    const paperType = await paperTypeService_1.PaperTypeService.getPaperTypeWithPrices(id);
    if (!paperType) {
        res.status(404).json({ error: 'Тип бумаги не найден' });
        return;
    }
    res.json(paperType);
});
// Создать новый тип бумаги
PaperTypeController.createPaperType = (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const { name, display_name, search_keywords, is_active = true } = req.body;
    if (!name || !display_name || !search_keywords) {
        res.status(400).json({ error: 'name, display_name и search_keywords обязательны' });
        return;
    }
    const paperType = await paperTypeService_1.PaperTypeService.createPaperType({
        name,
        display_name,
        search_keywords,
        is_active
    });
    res.status(201).json(paperType);
});
// Обновить тип бумаги
PaperTypeController.updatePaperType = (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const id = Number(req.params.id);
    const updates = req.body;
    const paperType = await paperTypeService_1.PaperTypeService.updatePaperType(id, updates);
    res.json(paperType);
});
// Удалить тип бумаги
PaperTypeController.deletePaperType = (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const id = Number(req.params.id);
    await paperTypeService_1.PaperTypeService.deletePaperType(id);
    res.status(204).end();
});
// Добавить цену печати
PaperTypeController.addPrintingPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const { paper_type_id, density, price } = req.body;
    if (!paper_type_id || !density || !price) {
        res.status(400).json({ error: 'paper_type_id, density и price обязательны' });
        return;
    }
    const printingPrice = await paperTypeService_1.PaperTypeService.addPrintingPrice(paper_type_id, density, price);
    res.status(201).json(printingPrice);
});
// Удалить цену печати
PaperTypeController.deletePrintingPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    if (!user || user.role !== 'admin') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    const id = Number(req.params.id);
    await paperTypeService_1.PaperTypeService.deletePrintingPrice(id);
    res.status(204).end();
});
// Найти тип бумаги по названию материала
PaperTypeController.findPaperTypeByMaterial = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { materialName } = req.query;
    if (!materialName) {
        res.status(400).json({ error: 'materialName обязателен' });
        return;
    }
    const paperType = await paperTypeService_1.PaperTypeService.findPaperTypeByMaterialName(materialName);
    res.json(paperType);
});
// Получить цену печати
PaperTypeController.getPrintingPrice = (0, middleware_1.asyncHandler)(async (req, res) => {
    const { paper_type_id, density } = req.query;
    if (!paper_type_id || !density) {
        res.status(400).json({ error: 'paper_type_id и density обязательны' });
        return;
    }
    const price = await paperTypeService_1.PaperTypeService.getPrintingPrice(Number(paper_type_id), Number(density));
    if (price === null) {
        res.status(404).json({ error: 'Цена не найдена' });
        return;
    }
    res.json({ price });
});
