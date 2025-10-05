"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// GET /api/material-categories - получить все категории
router.get('/', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.getAllCategories));
// GET /api/material-categories/stats - получить статистику по категориям
router.get('/stats', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.getCategoryStats));
// GET /api/material-categories/:id - получить категорию по ID
router.get('/:id', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.getCategoryById));
// POST /api/material-categories - создать новую категорию
router.post('/', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.createCategory));
// PUT /api/material-categories/:id - обновить категорию
router.put('/:id', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.updateCategory));
// DELETE /api/material-categories/:id - удалить категорию
router.delete('/:id', (0, middleware_1.asyncHandler)(controllers_1.MaterialCategoryController.deleteCategory));
exports.default = router;
