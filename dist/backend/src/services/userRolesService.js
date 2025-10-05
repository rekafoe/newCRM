"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRolesService = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class UserRolesService {
    /**
     * Получить все роли
     */
    static async getAllRoles() {
        try {
            const db = await (0, database_1.getDb)();
            const roles = await db.all(`
        SELECT 
          id,
          name,
          description,
          permissions,
          is_active,
          created_at,
          updated_at
        FROM user_roles
        WHERE is_active = 1
        ORDER BY name
      `);
            return roles.map((role) => ({
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: JSON.parse(role.permissions || '[]'),
                isActive: Boolean(role.is_active),
                createdAt: role.created_at,
                updatedAt: role.updated_at
            }));
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения ролей', error);
            return [];
        }
    }
    /**
     * Получить роль по ID
     */
    static async getRoleById(roleId) {
        try {
            const db = await (0, database_1.getDb)();
            const role = await db.get(`
        SELECT 
          id,
          name,
          description,
          permissions,
          is_active,
          created_at,
          updated_at
        FROM user_roles
        WHERE id = ? AND is_active = 1
      `, roleId);
            if (!role)
                return null;
            return {
                id: role.id,
                name: role.name,
                description: role.description,
                permissions: JSON.parse(role.permissions || '[]'),
                isActive: Boolean(role.is_active),
                createdAt: role.created_at,
                updatedAt: role.updated_at
            };
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения роли', error);
            return null;
        }
    }
    /**
     * Создать новую роль
     */
    static async createRole(roleData) {
        try {
            const db = await (0, database_1.getDb)();
            const result = await db.run(`
        INSERT INTO user_roles (name, description, permissions, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
      `, roleData.name, roleData.description, JSON.stringify(roleData.permissions));
            const newRole = await this.getRoleById(result.lastID);
            if (!newRole) {
                throw new Error('Ошибка создания роли');
            }
            logger_1.logger.info('Роль создана', { roleId: newRole.id, name: newRole.name });
            return newRole;
        }
        catch (error) {
            logger_1.logger.error('Ошибка создания роли', error);
            throw error;
        }
    }
    /**
     * Обновить роль
     */
    static async updateRole(roleId, roleData) {
        try {
            const db = await (0, database_1.getDb)();
            const updateFields = [];
            const updateValues = [];
            if (roleData.name !== undefined) {
                updateFields.push('name = ?');
                updateValues.push(roleData.name);
            }
            if (roleData.description !== undefined) {
                updateFields.push('description = ?');
                updateValues.push(roleData.description);
            }
            if (roleData.permissions !== undefined) {
                updateFields.push('permissions = ?');
                updateValues.push(JSON.stringify(roleData.permissions));
            }
            updateFields.push('updated_at = datetime(\'now\')');
            updateValues.push(roleId);
            await db.run(`
        UPDATE user_roles 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, ...updateValues);
            const updatedRole = await this.getRoleById(roleId);
            if (updatedRole) {
                logger_1.logger.info('Роль обновлена', { roleId, name: updatedRole.name });
            }
            return updatedRole;
        }
        catch (error) {
            logger_1.logger.error('Ошибка обновления роли', error);
            throw error;
        }
    }
    /**
     * Удалить роль
     */
    static async deleteRole(roleId) {
        try {
            const db = await (0, database_1.getDb)();
            // Проверяем, есть ли пользователи с этой ролью
            const usersWithRole = await db.get(`
        SELECT COUNT(*) as count FROM users WHERE role = (SELECT name FROM user_roles WHERE id = ?)
      `, roleId);
            if (usersWithRole.count > 0) {
                throw new Error('Нельзя удалить роль, которая назначена пользователям');
            }
            await db.run(`
        UPDATE user_roles 
        SET is_active = 0, updated_at = datetime('now')
        WHERE id = ?
      `, roleId);
            logger_1.logger.info('Роль удалена', { roleId });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Ошибка удаления роли', error);
            throw error;
        }
    }
    /**
     * Получить всех пользователей
     */
    static async getAllUsers() {
        try {
            const db = await (0, database_1.getDb)();
            const users = await db.all(`
        SELECT 
          id,
          name,
          email,
          role,
          is_active,
          created_at,
          last_login
        FROM users
        ORDER BY name
      `);
            return users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: Boolean(user.is_active),
                createdAt: user.created_at,
                lastLogin: user.last_login || 'Никогда'
            }));
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения пользователей', error);
            return [];
        }
    }
    /**
     * Назначить роль пользователю
     */
    static async assignRoleToUser(userId, roleId, assignedBy) {
        try {
            const db = await (0, database_1.getDb)();
            // Получаем название роли
            const role = await db.get('SELECT name FROM user_roles WHERE id = ?', roleId);
            if (!role) {
                throw new Error('Роль не найдена');
            }
            // Обновляем роль пользователя
            await db.run(`
        UPDATE users 
        SET role = ?, updated_at = datetime('now')
        WHERE id = ?
      `, role.name, userId);
            // Записываем назначение роли
            await db.run(`
        INSERT INTO role_assignments (user_id, role_id, assigned_by, assigned_at)
        VALUES (?, ?, ?, datetime('now'))
      `, userId, roleId, assignedBy);
            logger_1.logger.info('Роль назначена пользователю', { userId, roleId, assignedBy });
            return true;
        }
        catch (error) {
            logger_1.logger.error('Ошибка назначения роли', error);
            throw error;
        }
    }
    /**
     * Получить разрешения пользователя
     */
    static async getUserPermissions(userId) {
        try {
            const db = await (0, database_1.getDb)();
            const user = await db.get(`
        SELECT role FROM users WHERE id = ?
      `, userId);
            if (!user)
                return [];
            const role = await db.get(`
        SELECT permissions FROM user_roles WHERE name = ? AND is_active = 1
      `, user.role);
            if (!role)
                return [];
            return JSON.parse(role.permissions || '[]');
        }
        catch (error) {
            logger_1.logger.error('Ошибка получения разрешений пользователя', error);
            return [];
        }
    }
    /**
     * Проверить разрешение пользователя
     */
    static async hasPermission(userId, permission) {
        try {
            const permissions = await this.getUserPermissions(userId);
            return permissions.includes(permission);
        }
        catch (error) {
            logger_1.logger.error('Ошибка проверки разрешения', error);
            return false;
        }
    }
    /**
     * Получить все доступные разрешения
     */
    static async getAllPermissions() {
        return [
            // Управление заказами
            { id: 'orders.view', name: 'Просмотр заказов', description: 'Просматривать список заказов', category: 'Заказы' },
            { id: 'orders.create', name: 'Создание заказов', description: 'Создавать новые заказы', category: 'Заказы' },
            { id: 'orders.edit', name: 'Редактирование заказов', description: 'Редактировать существующие заказы', category: 'Заказы' },
            { id: 'orders.delete', name: 'Удаление заказов', description: 'Удалять заказы', category: 'Заказы' },
            // Управление складом
            { id: 'warehouse.view', name: 'Просмотр склада', description: 'Просматривать материалы на складе', category: 'Склад' },
            { id: 'warehouse.edit', name: 'Редактирование склада', description: 'Редактировать материалы на складе', category: 'Склад' },
            { id: 'warehouse.moves', name: 'Движения материалов', description: 'Выполнять движения материалов', category: 'Склад' },
            // Управление пользователями
            { id: 'users.view', name: 'Просмотр пользователей', description: 'Просматривать список пользователей', category: 'Пользователи' },
            { id: 'users.create', name: 'Создание пользователей', description: 'Создавать новых пользователей', category: 'Пользователи' },
            { id: 'users.edit', name: 'Редактирование пользователей', description: 'Редактировать пользователей', category: 'Пользователи' },
            { id: 'users.delete', name: 'Удаление пользователей', description: 'Удалять пользователей', category: 'Пользователи' },
            // Аналитика
            { id: 'analytics.view', name: 'Просмотр аналитики', description: 'Просматривать аналитику и отчеты', category: 'Аналитика' },
            { id: 'analytics.export', name: 'Экспорт данных', description: 'Экспортировать данные и отчеты', category: 'Аналитика' },
            // Настройки
            { id: 'settings.view', name: 'Просмотр настроек', description: 'Просматривать настройки системы', category: 'Настройки' },
            { id: 'settings.edit', name: 'Редактирование настроек', description: 'Редактировать настройки системы', category: 'Настройки' },
            // Администрирование
            { id: 'admin.roles', name: 'Управление ролями', description: 'Управлять ролями и разрешениями', category: 'Администрирование' },
            { id: 'admin.system', name: 'Системное администрирование', description: 'Полный доступ к системе', category: 'Администрирование' }
        ];
    }
    /**
     * Создать стандартные роли
     */
    static async createDefaultRoles() {
        try {
            const db = await (0, database_1.getDb)();
            // Проверяем, есть ли уже роли
            const existingRoles = await db.get('SELECT COUNT(*) as count FROM user_roles');
            if (existingRoles.count > 0)
                return;
            const defaultRoles = [
                {
                    name: 'admin',
                    description: 'Администратор системы',
                    permissions: ['admin.system']
                },
                {
                    name: 'manager',
                    description: 'Менеджер',
                    permissions: [
                        'orders.view', 'orders.create', 'orders.edit', 'orders.delete',
                        'warehouse.view', 'warehouse.edit', 'warehouse.moves',
                        'users.view', 'users.create', 'users.edit',
                        'analytics.view', 'analytics.export',
                        'settings.view', 'settings.edit'
                    ]
                },
                {
                    name: 'operator',
                    description: 'Оператор',
                    permissions: [
                        'orders.view', 'orders.create', 'orders.edit',
                        'warehouse.view', 'warehouse.moves',
                        'analytics.view'
                    ]
                },
                {
                    name: 'viewer',
                    description: 'Просмотрщик',
                    permissions: [
                        'orders.view',
                        'warehouse.view',
                        'analytics.view'
                    ]
                }
            ];
            for (const role of defaultRoles) {
                await db.run(`
          INSERT INTO user_roles (name, description, permissions, is_active, created_at, updated_at)
          VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
        `, role.name, role.description, JSON.stringify(role.permissions));
            }
            logger_1.logger.info('Стандартные роли созданы', { count: defaultRoles.length });
        }
        catch (error) {
            logger_1.logger.error('Ошибка создания стандартных ролей', error);
            throw error;
        }
    }
}
exports.UserRolesService = UserRolesService;
