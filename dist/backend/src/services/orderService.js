"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const database_1 = require("../config/database");
const utils_1 = require("../utils");
const unifiedWarehouseService_1 = require("./unifiedWarehouseService");
const autoMaterialDeductionService_1 = require("./autoMaterialDeductionService");
class OrderService {
    static async getAllOrders(userId) {
        const db = await (0, database_1.getDb)();
        const orders = (await db.all('SELECT id, number, status, createdAt, customerName, customerPhone, customerEmail, prepaymentAmount, prepaymentStatus, paymentUrl, paymentId, paymentMethod, userId FROM orders WHERE userId = ? OR userId IS NULL ORDER BY id DESC', userId));
        for (const order of orders) {
            const itemsRaw = (await db.all('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE orderId = ?', order.id));
            order.items = Array.isArray(itemsRaw) ? itemsRaw.map((ir) => {
                let params;
                try {
                    params = JSON.parse(ir.params);
                }
                catch (error) {
                    console.error(`Error parsing params for item ${ir.id}:`, error);
                    params = { description: 'Ошибка данных' };
                }
                return {
                    id: ir.id,
                    orderId: ir.orderId,
                    type: ir.type,
                    params,
                    price: ir.price,
                    quantity: ir.quantity ?? 1,
                    printerId: ir.printerId ?? undefined,
                    sides: ir.sides,
                    sheets: ir.sheets,
                    waste: ir.waste,
                    clicks: ir.clicks
                };
            }) : [];
        }
        return orders;
    }
    static async createOrder(customerName, customerPhone, customerEmail, prepaymentAmount, userId) {
        const createdAt = (0, utils_1.getCurrentTimestamp)();
        const db = await (0, database_1.getDb)();
        const insertRes = await db.run('INSERT INTO orders (status, createdAt, customerName, customerPhone, customerEmail, prepaymentAmount, userId) VALUES (?, ?, ?, ?, ?, ?, ?)', 1, createdAt, customerName || null, customerPhone || null, customerEmail || null, Number(prepaymentAmount || 0), userId ?? null);
        const id = insertRes.lastID;
        const number = `ORD-${String(id).padStart(4, '0')}`;
        await db.run('UPDATE orders SET number = ? WHERE id = ?', number, id);
        const raw = await db.get('SELECT * FROM orders WHERE id = ?', id);
        const order = { ...raw, items: [] };
        return order;
    }
    // Создание заказа с резервированием материалов
    static async createOrderWithReservation(orderData) {
        const db = await (0, database_1.getDb)();
        try {
            await db.run('BEGIN');
            // 1. Создаем заказ
            const order = await this.createOrder(orderData.customerName, orderData.customerPhone, orderData.customerEmail, orderData.prepaymentAmount, orderData.userId);
            // 2. Добавляем товары в заказ
            for (const item of orderData.items) {
                await db.run('INSERT INTO items (orderId, type, params, price, quantity) VALUES (?, ?, ?, ?, ?)', order.id, item.type, item.params, item.price, item.quantity);
            }
            // 3. Резервируем материалы, если указаны требования
            const materialReservations = [];
            for (const item of orderData.items) {
                if (item.materialRequirements) {
                    for (const requirement of item.materialRequirements) {
                        materialReservations.push({
                            material_id: requirement.material_id,
                            quantity: requirement.quantity * item.quantity, // Умножаем на количество товара
                            order_id: order.id,
                            reason: `Резерв для заказа ${order.number}`,
                            expires_in_hours: 24
                        });
                    }
                }
            }
            if (materialReservations.length > 0) {
                await unifiedWarehouseService_1.UnifiedWarehouseService.reserveMaterials(materialReservations);
            }
            await db.run('COMMIT');
            return order;
        }
        catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }
    // Создание заказа с автоматическим списанием материалов
    static async createOrderWithAutoDeduction(orderData) {
        const db = await (0, database_1.getDb)();
        try {
            await db.run('BEGIN');
            // 1. Создаем заказ
            const order = await this.createOrder(orderData.customerName, orderData.customerPhone, orderData.customerEmail, orderData.prepaymentAmount, orderData.userId);
            // 2. Добавляем товары в заказ
            for (const item of orderData.items) {
                await db.run('INSERT INTO items (orderId, type, params, price, quantity) VALUES (?, ?, ?, ?, ?)', order.id, item.type, item.params, item.price, item.quantity);
            }
            // 3. Автоматическое списание материалов
            const deductionResult = await autoMaterialDeductionService_1.AutoMaterialDeductionService.deductMaterialsForOrder(order.id, orderData.items.map(item => ({
                type: item.type,
                params: JSON.parse(item.params || '{}'),
                quantity: item.quantity,
                components: item.components
            })), orderData.userId);
            if (!deductionResult.success) {
                throw new Error(`Ошибка автоматического списания: ${deductionResult.errors.join(', ')}`);
            }
            await db.run('COMMIT');
            return {
                order,
                deductionResult
            };
        }
        catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }
    static async updateOrderStatus(id, status) {
        const db = await (0, database_1.getDb)();
        await db.run('UPDATE orders SET status = ? WHERE id = ?', status, id);
        const raw = await db.get('SELECT * FROM orders WHERE id = ?', id);
        const updated = { ...raw, items: [] };
        return updated;
    }
    static async deleteOrder(id, userId) {
        // Собираем все позиции заказа и их состав
        const db = await (0, database_1.getDb)();
        const items = (await db.all('SELECT id, type, params, quantity FROM items WHERE orderId = ?', id));
        // Агрегируем возвраты по materialId
        const returns = {};
        for (const item of items) {
            const paramsObj = JSON.parse(item.params || '{}');
            const composition = (await db.all('SELECT materialId, qtyPerItem FROM product_materials WHERE presetCategory = ? AND presetDescription = ?', item.type, paramsObj.description || ''));
            for (const c of composition) {
                const add = Math.ceil((c.qtyPerItem || 0) * Math.max(1, Number(item.quantity) || 1)); // Округляем вверх до целого числа
                returns[c.materialId] = (returns[c.materialId] || 0) + add;
            }
        }
        await db.run('BEGIN');
        try {
            for (const mid of Object.keys(returns)) {
                const materialId = Number(mid);
                const addQty = Math.ceil(returns[materialId]); // Округляем вверх до целого числа
                if (addQty > 0) {
                    await db.run('UPDATE materials SET quantity = quantity + ? WHERE id = ?', addQty, materialId);
                    await db.run('INSERT INTO material_moves (materialId, delta, reason, orderId, user_id) VALUES (?, ?, ?, ?, ?)', materialId, addQty, 'order delete', id, userId ?? null);
                }
            }
            // Удаляем заказ (позиции удалятся каскадно)
            await db.run('DELETE FROM orders WHERE id = ?', id);
            await db.run('COMMIT');
        }
        catch (e) {
            await db.run('ROLLBACK');
            throw e;
        }
    }
    static async duplicateOrder(originalOrderId) {
        const db = await (0, database_1.getDb)();
        const originalOrder = await db.get('SELECT * FROM orders WHERE id = ?', originalOrderId);
        if (!originalOrder) {
            throw new Error('Заказ не найден');
        }
        // Создаём новый заказ
        const newOrderNumber = `${originalOrder.number}-COPY-${Date.now()}`;
        const createdAt = (0, utils_1.getCurrentTimestamp)();
        const newOrderResult = await db.run('INSERT INTO orders (number, status, createdAt, customerName, customerPhone, customerEmail, prepaymentAmount, prepaymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', newOrderNumber, 1, // Новый статус
        createdAt, originalOrder.customerName, originalOrder.customerPhone, originalOrder.customerEmail, null, // Сбрасываем предоплату
        null);
        const newOrderId = newOrderResult.lastID;
        // Копируем позиции
        const originalItems = await db.all('SELECT * FROM items WHERE orderId = ?', originalOrderId);
        for (const item of originalItems) {
            await db.run('INSERT INTO items (orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', newOrderId, item.type, typeof item.params === 'string' ? item.params : JSON.stringify(item.params), item.price, item.quantity, item.printerId, item.sides, item.sheets, item.waste, item.clicks);
        }
        // Получаем созданный заказ с позициями
        const newOrder = await db.get('SELECT * FROM orders WHERE id = ?', newOrderId);
        const newItems = await db.all('SELECT * FROM items WHERE orderId = ?', newOrderId);
        if (newOrder) {
            newOrder.items = newItems.map((item) => ({
                ...item,
                params: typeof item.params === 'string' ? JSON.parse(item.params) : item.params
            }));
        }
        return newOrder;
    }
    static async addOrderItem(orderId, itemData) {
        const db = await (0, database_1.getDb)();
        // Проверяем, что заказ существует
        const order = await db.get('SELECT id FROM orders WHERE id = ?', orderId);
        if (!order) {
            throw new Error('Заказ не найден');
        }
        // Подготавливаем данные для вставки
        const { name, description, quantity, price, total, specifications, materials, services, productionTime, productType, urgency, customerType, estimatedDelivery, sheetsNeeded, piecesPerSheet, formatInfo } = itemData;
        // Создаем параметры для товара
        const params = {
            description,
            specifications,
            materials,
            services,
            productionTime,
            productType,
            urgency,
            customerType,
            estimatedDelivery,
            sheetsNeeded,
            piecesPerSheet,
            formatInfo
        };
        // Вставляем товар в заказ
        const result = await db.run(`INSERT INTO items (orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, orderId, name || 'Товар из калькулятора', JSON.stringify(params), price || 0, quantity || 1, null, // printerId
        1, // sides
        1, // sheets
        0, // waste
        0 // clicks
        );
        // Возвращаем созданный товар
        const newItem = await db.get('SELECT * FROM items WHERE id = ?', result.lastID);
        return {
            ...newItem,
            params: JSON.parse(newItem.params)
        };
    }
    // Новые методы для расширенного управления заказами
    static async searchOrders(userId, searchParams) {
        const db = await (0, database_1.getDb)();
        let whereConditions = ['(o.userId = ? OR o.userId IS NULL)'];
        let params = [userId];
        // Поиск по тексту
        if (searchParams.query) {
            whereConditions.push(`(
        o.number LIKE ? OR 
        o.customerName LIKE ? OR 
        o.customerPhone LIKE ? OR 
        o.customerEmail LIKE ? OR
        EXISTS (
          SELECT 1 FROM items i 
          WHERE i.orderId = o.id 
          AND (i.type LIKE ? OR i.params LIKE ?)
        )
      )`);
            const searchTerm = `%${searchParams.query}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }
        // Фильтр по статусу
        if (searchParams.status !== undefined) {
            whereConditions.push('o.status = ?');
            params.push(searchParams.status);
        }
        // Фильтр по дате
        if (searchParams.dateFrom) {
            whereConditions.push('DATE(o.createdAt) >= ?');
            params.push(searchParams.dateFrom);
        }
        if (searchParams.dateTo) {
            whereConditions.push('DATE(o.createdAt) <= ?');
            params.push(searchParams.dateTo);
        }
        // Фильтр по клиенту
        if (searchParams.customerName) {
            whereConditions.push('o.customerName LIKE ?');
            params.push(`%${searchParams.customerName}%`);
        }
        if (searchParams.customerPhone) {
            whereConditions.push('o.customerPhone LIKE ?');
            params.push(`%${searchParams.customerPhone}%`);
        }
        if (searchParams.customerEmail) {
            whereConditions.push('o.customerEmail LIKE ?');
            params.push(`%${searchParams.customerEmail}%`);
        }
        // Фильтр по предоплате
        if (searchParams.hasPrepayment !== undefined) {
            if (searchParams.hasPrepayment) {
                whereConditions.push('o.prepaymentAmount > 0');
            }
            else {
                whereConditions.push('(o.prepaymentAmount IS NULL OR o.prepaymentAmount = 0)');
            }
        }
        // Фильтр по способу оплаты
        if (searchParams.paymentMethod) {
            whereConditions.push('o.paymentMethod = ?');
            params.push(searchParams.paymentMethod);
        }
        const whereClause = whereConditions.join(' AND ');
        // Подзапрос для расчета общей суммы заказа
        const totalAmountSubquery = `
      (SELECT COALESCE(SUM(i.price * i.quantity), 0) 
       FROM items i 
       WHERE i.orderId = o.id)
    `;
        let query = `
      SELECT o.*, ${totalAmountSubquery} as totalAmount
      FROM orders o
      WHERE ${whereClause}
    `;
        // Фильтр по сумме (применяем после расчета totalAmount)
        if (searchParams.minAmount !== undefined || searchParams.maxAmount !== undefined) {
            query = `
        SELECT * FROM (${query}) filtered_orders
        WHERE 1=1
      `;
            if (searchParams.minAmount !== undefined) {
                query += ' AND totalAmount >= ?';
                params.push(searchParams.minAmount);
            }
            if (searchParams.maxAmount !== undefined) {
                query += ' AND totalAmount <= ?';
                params.push(searchParams.maxAmount);
            }
        }
        query += ' ORDER BY o.createdAt DESC';
        // Пагинация
        if (searchParams.limit) {
            query += ' LIMIT ?';
            params.push(searchParams.limit);
        }
        if (searchParams.offset) {
            query += ' OFFSET ?';
            params.push(searchParams.offset);
        }
        const orders = await db.all(query, ...params);
        // Загружаем позиции для каждого заказа
        for (const order of orders) {
            const itemsRaw = await db.all('SELECT id, orderId, type, params, price, quantity, printerId, sides, sheets, waste, clicks FROM items WHERE orderId = ?', order.id);
            order.items = Array.isArray(itemsRaw) ? itemsRaw.map((ir) => {
                let params;
                try {
                    params = JSON.parse(ir.params);
                }
                catch (error) {
                    console.error(`Error parsing params for item ${ir.id}:`, error);
                    params = { description: 'Ошибка данных' };
                }
                return {
                    id: ir.id,
                    orderId: ir.orderId,
                    type: ir.type,
                    params,
                    price: ir.price,
                    quantity: ir.quantity ?? 1,
                    printerId: ir.printerId ?? undefined,
                    sides: ir.sides,
                    sheets: ir.sheets,
                    waste: ir.waste,
                    clicks: ir.clicks
                };
            }) : [];
        }
        return orders;
    }
    static async getOrdersStats(userId, dateFrom, dateTo) {
        const db = await (0, database_1.getDb)();
        let whereConditions = ['(o.userId = ? OR o.userId IS NULL)'];
        let params = [userId];
        if (dateFrom) {
            whereConditions.push('DATE(o.createdAt) >= ?');
            params.push(dateFrom);
        }
        if (dateTo) {
            whereConditions.push('DATE(o.createdAt) <= ?');
            params.push(dateTo);
        }
        const whereClause = whereConditions.join(' AND ');
        const stats = await db.get(`
      SELECT 
        COUNT(*) as totalOrders,
        COUNT(CASE WHEN o.status = 1 THEN 1 END) as newOrders,
        COUNT(CASE WHEN o.status = 2 THEN 1 END) as inProgressOrders,
        COUNT(CASE WHEN o.status = 3 THEN 1 END) as readyOrders,
        COUNT(CASE WHEN o.status = 4 THEN 1 END) as shippedOrders,
        COUNT(CASE WHEN o.status = 5 THEN 1 END) as completedOrders,
        COALESCE(SUM(
          (SELECT COALESCE(SUM(i.price * i.quantity), 0) 
           FROM items i WHERE i.orderId = o.id)
        ), 0) as totalRevenue,
        COALESCE(AVG(
          (SELECT COALESCE(SUM(i.price * i.quantity), 0) 
           FROM items i WHERE i.orderId = o.id)
        ), 0) as averageOrderValue,
        COUNT(CASE WHEN o.prepaymentAmount > 0 THEN 1 END) as ordersWithPrepayment,
        COALESCE(SUM(o.prepaymentAmount), 0) as totalPrepayment
      FROM orders o
      WHERE ${whereClause}
    `, ...params);
        return stats;
    }
    static async bulkUpdateOrderStatus(orderIds, newStatus, userId) {
        const db = await (0, database_1.getDb)();
        if (orderIds.length === 0) {
            throw new Error('Не выбрано ни одного заказа');
        }
        const placeholders = orderIds.map(() => '?').join(',');
        const params = [newStatus, ...orderIds];
        await db.run(`UPDATE orders SET status = ? WHERE id IN (${placeholders})`, ...params);
        return { updatedCount: orderIds.length, newStatus };
    }
    static async bulkDeleteOrders(orderIds, userId) {
        const db = await (0, database_1.getDb)();
        if (orderIds.length === 0) {
            throw new Error('Не выбрано ни одного заказа');
        }
        let deletedCount = 0;
        await db.run('BEGIN');
        try {
            for (const orderId of orderIds) {
                await OrderService.deleteOrder(orderId, userId);
                deletedCount++;
            }
            await db.run('COMMIT');
        }
        catch (e) {
            await db.run('ROLLBACK');
            throw e;
        }
        return { deletedCount };
    }
    static async exportOrders(userId, format = 'csv', searchParams) {
        const orders = searchParams
            ? await OrderService.searchOrders(userId, { ...searchParams, limit: 10000 })
            : await OrderService.getAllOrders(userId);
        if (format === 'json') {
            return JSON.stringify(orders, null, 2);
        }
        // CSV формат
        const headers = [
            'ID', 'Номер', 'Статус', 'Дата создания', 'Клиент', 'Телефон', 'Email',
            'Предоплата', 'Способ оплаты', 'Количество позиций', 'Общая сумма'
        ];
        const rows = orders.map(order => [
            order.id,
            order.number,
            order.status,
            order.createdAt,
            order.customerName || '',
            order.customerPhone || '',
            order.customerEmail || '',
            order.prepaymentAmount || 0,
            order.paymentMethod || '',
            order.items.length,
            order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        return csvContent;
    }
}
exports.OrderService = OrderService;
