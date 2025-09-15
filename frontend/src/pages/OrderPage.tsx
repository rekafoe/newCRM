// frontend/src/pages/OrdersPage.tsx

import React, { useEffect, useState } from 'react';
import {
  getOrders,
  getOrderById,
  deleteOrder,
  deleteOrderItem
} from '../api';
import { Order, OrderItem } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<
    (Order & { items: OrderItem[] }) | null
  >(null);

  // Загрузка списка заказов
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await getOrders();
    setOrders(res.data);
    setSelectedOrder(null);
  };

  // Выбор конкретного заказа
  const onSelectOrder = async (orderId: number) => {
    const res = await getOrderById(orderId);
    setSelectedOrder(res.data);
  };

  // Удаление всего заказа
  const onDeleteOrder = async (orderId: number) => {
    if (window.confirm('Удалить этот заказ?')) {
      await deleteOrder(orderId);
      await loadOrders();
    }
  };

  // Удаление позиции внутри заказа
  const onDeleteItem = async (item: OrderItem) => {
    if (!selectedOrder) return;
    if (window.confirm('Удалить эту позицию?')) {
      await deleteOrderItem(selectedOrder.id, item.id);
      // Повторно загрузим детали заказа
      onSelectOrder(selectedOrder.id);
    }
  };

  return (
    <div style={{ display: 'flex', padding: 16 }}>
      {/* Левая колонка: список заказов */}
      <aside style={{ width: 240, marginRight: 16 }}>
        <h2>Заказы</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(o => (
            <li
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8
              }}
            >
              <button
                onClick={() => onSelectOrder(o.id)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background:
                    o.id === selectedOrder?.id ? '#eef' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {o.customer_name} —{' '}
                {o.total_amount.toLocaleString('ru-RU')} BYN
              </button>

              {/* Кнопка удаления заказа */}
              <button
                onClick={() => onDeleteOrder(o.id)}
                title="Удалить заказ"
                style={{
                  marginLeft: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#c00',
                  fontSize: '1.2rem'
                }}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Правая колонка: детали выбранного заказа */}
      <section style={{ flex: 1 }}>
        {selectedOrder ? (
          <>
            <h2>
              Заказ #{selectedOrder.id} —{' '}
              {selectedOrder.customer_name}
            </h2>
            <p>
              Сумма:{' '}
              {selectedOrder.total_amount.toLocaleString(
                'ru-RU'
              )}{' '}
              BYN
            </p>

            <h3>Позиции</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {selectedOrder.items.map(item => (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 4
                  }}
                >
                  <span style={{ flex: 1 }}>
                    {item.product_name} — {item.quantity} ×{' '}
                    {item.unit_price} BYN
                  </span>

                  {/* Кнопка удаления позиции */}
                  <button
                    onClick={() => onDeleteItem(item)}
                    title="Удалить позицию"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#c00',
                      fontSize: '1.1rem'
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Выберите заказ слева</p>
        )}
      </section>
    </div>
  );
};
