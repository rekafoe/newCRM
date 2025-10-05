"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRolesController_1 = require("../controllers/userRolesController");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// Получить все роли
router.get('/roles', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.getAllRoles));
// Получить роль по ID
router.get('/roles/:id', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.getRoleById));
// Создать новую роль
router.post('/roles', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.createRole));
// Обновить роль
router.put('/roles/:id', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.updateRole));
// Удалить роль
router.delete('/roles/:id', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.deleteRole));
// Получить всех пользователей
router.get('/users', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.getAllUsers));
// Назначить роль пользователю
router.post('/assign-role', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.assignRoleToUser));
// Получить разрешения пользователя
router.get('/users/:userId/permissions', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.getUserPermissions));
// Проверить разрешение пользователя
router.get('/users/:userId/permissions/:permission', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.checkPermission));
// Получить все доступные разрешения
router.get('/permissions', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.getAllPermissions));
// Создать стандартные роли
router.post('/create-default-roles', middleware_1.authenticate, (0, middleware_1.asyncHandler)(userRolesController_1.UserRolesController.createDefaultRoles));
exports.default = router;
