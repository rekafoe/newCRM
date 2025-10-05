import { getDb } from '../db';
import { PhotoOrderService } from './photoOrderService';
import { UserOrderPageService } from './userOrderPageService';

export interface UnifiedOrder {
  id: number;
  type: 'website' | 'telegram' | 'manual';
  status: string;
  customerName?: string;
  customerContact?: string;
  totalAmount: number;
  createdAt: string;
  assignedTo?: number;
  assignedToName?: string;
  notes?: string;
  // Специфичные поля для разных типов заказов
  photoOrder?: any;
  websiteOrder?: any;
  manualOrder?: any;
}

export interface OrderPool {
  unassigned: UnifiedOrder[];
  assigned: UnifiedOrder[];
  completed: UnifiedOrder[];
}

export class OrderManagementService {
  /**
   * Получение пула заказов (не назначенных)
   */
  static async getOrderPool(): Promise<OrderPool> {
    try {
      const db = await getDb();
      
      // Получаем заказы фото из Telegram
      const photoOrders = await db.all(`
        SELECT 
          id,
          'telegram' as type,
          status,
          first_name as customer_name,
          chat_id as customer_contact,
          total_price as total_amount,
          created_at,
          notes
        FROM photo_orders 
        WHERE status IN ('pending', 'ready_for_approval')
        ORDER BY created_at DESC
      `);

      // Получаем заказы с сайта (если есть таблица orders)
      let websiteOrders: any[] = [];
      try {
        websiteOrders = await db.all(`
          SELECT 
            id,
            'website' as type,
            status,
            customer_name,
            customer_phone as customer_contact,
            total_amount,
            created_at,
            notes
          FROM orders 
          WHERE status IN ('pending', 'processing')
          ORDER BY created_at DESC
        `);
      } catch (error) {
        console.log('📝 Website orders table not found, skipping...');
      }

      // Объединяем все заказы
      const allOrders = [...photoOrders, ...websiteOrders];
      
      // Проверяем, какие заказы уже назначены
      const assignedOrderIds = await db.all(`
        SELECT order_id, order_type, page_id, uop.user_name as assigned_to_name
        FROM user_order_page_orders uopo
        JOIN user_order_pages uop ON uopo.page_id = uop.id
        WHERE uopo.status != 'completed'
      `);

      const assignedMap = new Map();
      assignedOrderIds.forEach(assignment => {
        assignedMap.set(`${assignment.order_id}_${assignment.order_type}`, {
          assignedTo: assignment.page_id,
          assignedToName: assignment.assigned_to_name
        });
      });

      // Разделяем заказы на категории
      const unassigned: UnifiedOrder[] = [];
      const assigned: UnifiedOrder[] = [];
      const completed: UnifiedOrder[] = [];

      allOrders.forEach(order => {
        const key = `${order.id}_${order.type}`;
        const assignment = assignedMap.get(key);
        
        const unifiedOrder: UnifiedOrder = {
          id: order.id,
          type: order.type,
          status: order.status,
          customerName: order.customer_name,
          customerContact: order.customer_contact,
          totalAmount: order.total_amount,
          createdAt: order.created_at,
          notes: order.notes,
          ...assignment
        };

        if (order.status === 'completed') {
          completed.push(unifiedOrder);
        } else if (assignment) {
          assigned.push(unifiedOrder);
        } else {
          unassigned.push(unifiedOrder);
        }
      });

      return {
        unassigned,
        assigned,
        completed
      };
    } catch (error) {
      console.error('❌ Error getting order pool:', error);
      return {
        unassigned: [],
        assigned: [],
        completed: []
      };
    }
  }

  /**
   * Назначение заказа пользователю
   */
  static async assignOrderToUser(orderId: number, orderType: string, userId: number, userName: string, date: string): Promise<boolean> {
    try {
      const db = await getDb();
      
      // Проверяем, не назначен ли уже заказ
      const existingAssignment = await db.get(`
        SELECT * FROM user_order_page_orders 
        WHERE order_id = ? AND order_type = ? AND status != 'completed'
      `, [orderId, orderType]);

      if (existingAssignment) {
        throw new Error('Заказ уже назначен другому пользователю');
      }

      // Получаем или создаем страницу пользователя
      const page = await UserOrderPageService.getOrCreateUserOrderPage(userId, userName, date);

      // Назначаем заказ
      await db.run(`
        INSERT INTO user_order_page_orders (page_id, order_id, order_type, status, assigned_at)
        VALUES (?, ?, ?, 'pending', datetime('now'))
      `, [page.id, orderId, orderType]);

      // Обновляем статус заказа в соответствующей таблице
      if (orderType === 'telegram') {
        await db.run(`
          UPDATE photo_orders 
          SET status = 'in_progress', updated_at = datetime('now')
          WHERE id = ?
        `, [orderId]);
      } else if (orderType === 'website') {
        await db.run(`
          UPDATE orders 
          SET status = 'in_progress', updated_at = datetime('now')
          WHERE id = ?
        `, [orderId]);
      }

      console.log(`✅ Assigned ${orderType} order ${orderId} to user ${userName}`);
      return true;
    } catch (error) {
      console.error('❌ Error assigning order to user:', error);
      return false;
    }
  }

  /**
   * Завершение заказа
   */
  static async completeOrder(orderId: number, orderType: string, notes?: string): Promise<boolean> {
    try {
      const db = await getDb();
      
      // Обновляем статус в user_order_page_orders
      await db.run(`
        UPDATE user_order_page_orders 
        SET status = 'completed', completed_at = datetime('now'), notes = ?
        WHERE order_id = ? AND order_type = ?
      `, [notes, orderId, orderType]);

      // Обновляем статус в соответствующей таблице
      if (orderType === 'telegram') {
        await db.run(`
          UPDATE photo_orders 
          SET status = 'completed', updated_at = datetime('now')
          WHERE id = ?
        `, [orderId]);
      } else if (orderType === 'website') {
        await db.run(`
          UPDATE orders 
          SET status = 'completed', updated_at = datetime('now')
          WHERE id = ?
        `, [orderId]);
      }

      // Обновляем статистику страницы
      const pageOrder = await db.get(`
        SELECT page_id FROM user_order_page_orders 
        WHERE order_id = ? AND order_type = ?
      `, [orderId, orderType]);

      if (pageOrder) {
        await UserOrderPageService.updatePageStats(pageOrder.page_id);
      }

      console.log(`✅ Completed ${orderType} order ${orderId}`);
      return true;
    } catch (error) {
      console.error('❌ Error completing order:', error);
      return false;
    }
  }

  /**
   * Получение деталей заказа
   */
  static async getOrderDetails(orderId: number, orderType: string): Promise<UnifiedOrder | null> {
    try {
      const db = await getDb();
      
      let order: any = null;
      
      if (orderType === 'telegram') {
        order = await db.get(`
          SELECT 
            id,
            'telegram' as type,
            status,
            first_name as customer_name,
            chat_id as customer_contact,
            total_price as total_amount,
            created_at,
            notes,
            selected_size,
            processing_options,
            quantity
          FROM photo_orders 
          WHERE id = ?
        `, [orderId]);
        
        if (order) {
          order.photoOrder = {
            selectedSize: JSON.parse(order.selected_size),
            processingOptions: JSON.parse(order.processing_options),
            quantity: order.quantity
          };
        }
      } else if (orderType === 'website') {
        order = await db.get(`
          SELECT 
            id,
            'website' as type,
            status,
            customer_name,
            customer_phone as customer_contact,
            total_amount,
            created_at,
            notes
          FROM orders 
          WHERE id = ?
        `, [orderId]);
      }

      if (!order) {
        return null;
      }

      // Получаем информацию о назначении
      const assignment = await db.get(`
        SELECT 
          uopo.status as assignment_status,
          uop.user_name as assigned_to_name,
          uopo.assigned_at,
          uopo.completed_at,
          uopo.notes as assignment_notes
        FROM user_order_page_orders uopo
        JOIN user_order_pages uop ON uopo.page_id = uop.id
        WHERE uopo.order_id = ? AND uopo.order_type = ?
      `, [orderId, orderType]);

      return {
        id: order.id,
        type: order.type,
        status: order.status,
        customerName: order.customer_name,
        customerContact: order.customer_contact,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
        notes: order.notes,
        assignedToName: assignment?.assigned_to_name,
        photoOrder: order.photoOrder,
        websiteOrder: order.websiteOrder,
        manualOrder: order.manualOrder
      };
    } catch (error) {
      console.error('❌ Error getting order details:', error);
      return null;
    }
  }
}
