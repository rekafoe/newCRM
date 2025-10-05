"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRolesController = void 0;
const userRolesService_1 = require("../services/userRolesService");
const logger_1 = require("../utils/logger");
class UserRolesController {
    /**
     * Получить все роли
     */
    static async getAllRoles(req, res) {
        try {
            const roles = await userRolesService_1.UserRolesService.getAllRoles();
            res.json({ roles });
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения ролей', error);
            res.status(500).json({ error: 'Ошибка получения ролей' });
        }
    }
    /**
     * Получить роль по ID
     */
    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const roleId = parseInt(id);
            if (isNaN(roleId)) {
                res.status(400).json({ error: 'Неверный ID роли' });
                return;
            }
            const role = await userRolesService_1.UserRolesService.getRoleById(roleId);
            if (!role) {
                res.status(404).json({ error: 'Роль не найдена' });
                return;
            }
            res.json({ role });
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения роли', error);
            res.status(500).json({ error: 'Ошибка получения роли' });
        }
    }
    /**
     * Создать новую роль
     */
    static async createRole(req, res) {
        try {
            const { name, description, permissions } = req.body;
            if (!name || !description || !Array.isArray(permissions)) {
                res.status(400).json({ error: 'Необходимо указать name, description и permissions' });
                return;
            }
            const role = await userRolesService_1.UserRolesService.createRole({
                name,
                description,
                permissions
            });
            res.status(201).json({ role });
        }
        catch (error) {
            logger_1.logger.error('Ошибка создания роли', error);
            res.status(500).json({ error: error.message || 'Ошибка создания роли' });
        }
    }
    /**
     * Обновить роль
     */
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const roleId = parseInt(id);
            if (isNaN(roleId)) {
                res.status(400).json({ error: 'Неверный ID роли' });
                return;
            }
            const { name, description, permissions } = req.body;
            const role = await userRolesService_1.UserRolesService.updateRole(roleId, {
                name,
                description,
                permissions
            });
            if (!role) {
                res.status(404).json({ error: 'Роль не найдена' });
                return;
            }
            res.json({ role });
        }
        catch (error) {
            logger_1.logger.error('Ошибка обновления роли', error);
            res.status(500).json({ error: error.message || 'Ошибка обновления роли' });
        }
    }
    /**
     * Удалить роль
     */
    static async deleteRole(req, res) {
        try {
            const { id } = req.params;
            const roleId = parseInt(id);
            if (isNaN(roleId)) {
                res.status(400).json({ error: 'Неверный ID роли' });
                return;
            }
            await userRolesService_1.UserRolesService.deleteRole(roleId);
            res.json({ message: 'Роль удалена' });
        }
        catch (error) {
            logger_1.logger.error('Ошибка удаления роли', error);
            res.status(500).json({ error: error.message || 'Ошибка удаления роли' });
        }
    }
    /**
     * Получить всех пользователей
     */
    static async getAllUsers(req, res) {
        try {
            const users = await userRolesService_1.UserRolesService.getAllUsers();
            res.json({ users });
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения пользователей', error);
            res.status(500).json({ error: 'Ошибка получения пользователей' });
        }
    }
    /**
     * Назначить роль пользователю
     */
    static async assignRoleToUser(req, res) {
        try {
            const { userId, roleId } = req.body;
            const authUser = req.user;
            if (!userId || !roleId) {
                res.status(400).json({ error: 'Необходимо указать userId и roleId' });
                return;
            }
            if (!authUser) {
                res.status(401).json({ error: 'Не авторизован' });
                return;
            }
            await userRolesService_1.UserRolesService.assignRoleToUser(userId, roleId, authUser.id);
            res.json({ message: 'Роль назначена пользователю' });
        }
        catch (error) {
            logger_1.logger.error('Ошибка назначения роли', error);
            res.status(500).json({ error: error.message || 'Ошибка назначения роли' });
        }
    }
    /**
     * Получить разрешения пользователя
     */
    static async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
                res.status(400).json({ error: 'Неверный ID пользователя' });
                return;
            }
            const permissions = await userRolesService_1.UserRolesService.getUserPermissions(userIdNum);
            res.json({ permissions });
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения разрешений', error);
            res.status(500).json({ error: 'Ошибка получения разрешений' });
        }
    }
    /**
     * Проверить разрешение пользователя
     */
    static async checkPermission(req, res) {
        try {
            const { userId, permission } = req.params;
            const userIdNum = parseInt(userId);
            if (isNaN(userIdNum)) {
                res.status(400).json({ error: 'Неверный ID пользователя' });
                return;
            }
            const hasPermission = await userRolesService_1.UserRolesService.hasPermission(userIdNum, permission);
            res.json({ hasPermission });
        }
        catch (error) {
            logger_1.logger.error('Ошибка проверки разрешения', error);
            res.status(500).json({ error: 'Ошибка проверки разрешения' });
        }
    }
    /**
     * Получить все доступные разрешения
     */
    static async getAllPermissions(req, res) {
        try {
            const permissions = await userRolesService_1.UserRolesService.getAllPermissions();
            res.json({ permissions });
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения разрешений', error);
            res.status(500).json({ error: 'Ошибка получения разрешений' });
        }
    }
    /**
     * Создать стандартные роли
     */
    static async createDefaultRoles(req, res) {
        try {
            await userRolesService_1.UserRolesService.createDefaultRoles();
            res.json({ message: 'Стандартные роли созданы' });
        }
        catch (error) {
            logger_1.logger.error('Ошибка создания стандартных ролей', error);
            res.status(500).json({ error: 'Ошибка создания стандартных ролей' });
        }
    }
}
exports.UserRolesController = UserRolesController;
