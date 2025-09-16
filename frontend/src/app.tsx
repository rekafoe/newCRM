import React, { useEffect, useState } from "react";
import "./index.css";
import { Order } from "./types";
import {
  getOrders,
  createOrder,
  deleteOrder,
  deleteOrderItem,
  updateOrderStatus,
} from "./api";
import { Link } from 'react-router-dom';
import AddItemModal from "./components/AddItemModal";
import ManageMaterialsModal from "./components/ManageMaterialsModal";
import ManagePresetsModal from "./components/ManagePresetsModal";

import { ProgressBar, OrderStatus } from "./components/order/ProgressBar";
import { OrderTotal } from "./components/order/OrderTotal";
import { setAuthToken } from './api';


export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    getOrders().then((res) => {
      setOrders(res.data);
      if (!selectedId && res.data.length) setSelectedId(res.data[0].id);
    });
  }

  async function handleCreateOrder() {
    const res = await createOrder();
    const order = res.data;
    setOrders([order, ...orders]);
    setSelectedId(order.id);
  }

  const selectedOrder = orders.find((o) => o.id === selectedId);

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/reports">Ежедневные отчёты</Link>
        <h2>Заказы</h2>
        
        <ul className="order-list">
          {orders.map((o) => (
            <li
              key={o.id}
              className={`order-item ${o.id === selectedId ? "active" : ""}`}
              onClick={() => setSelectedId(o.id)}
            >
              {o.number}
            </li>
          ))}
        </ul>
        <button className="add-order-btn" onClick={handleCreateOrder}>
          + Добавить заказ
        </button>
        {selectedOrder && (
          <button
            className="btn-danger"
            style={{ marginTop: 8 }}
            onClick={async () => {
              try {
                await deleteOrder(selectedOrder.id);
                setSelectedId(null);
                loadOrders();
              } catch (e: any) {
                alert('Не удалось удалить заказ. Возможно нужна авторизация.');
              }
            }}
          >
            Удалить заказ
          </button>
        )}
        <button
          className="add-order-btn"
          style={{ marginTop: 8 }}
          onClick={() => setShowMaterials(true)}
        >
          📦 Материалы
        </button>
      </aside>

      <section className="detail">
        {selectedOrder ? (
          <>
            <div className="detail-header">
              <h2>{selectedOrder.number}</h2>
              <div className="detail-actions">
                {/* Управление статусом заказа */}
                <select
                  value={String(Math.min(Math.max(Number(selectedOrder.status), 1), 5))}
                  onChange={async (e) => {
                    const newStatus = Number(e.target.value);
                    try {
                      await updateOrderStatus(selectedOrder.id, newStatus);
                      loadOrders();
                    } catch (err) {
                      alert('Не удалось обновить статус. Возможно нужна авторизация.');
                    }
                  }}
                  style={{ marginRight: 8 }}
                >
                  {(['Новый','В производстве','Готов к отправке','Отправлен','Завершён'] as OrderStatus[]).map((s, i) => (
                    <option key={s} value={i + 1}>{s}</option>
                  ))}
                </select>
                <button onClick={() => setShowPresets(true)}>Пресеты</button>
                <button onClick={() => setShowAddItem(true)}>+ Позиция</button>
                <button onClick={() => { setAuthToken(undefined); location.href = '/login'; }}>Выйти</button>
              </div>
            </div>

            {/* ====== ВСТАВЛЯЕМ ПРОГРЕСС-БАР ====== */}
            <ProgressBar
              current={
                (['Новый','В производстве','Готов к отправке','Отправлен','Завершён'] as OrderStatus[])[
                  Math.min(Math.max(Number(selectedOrder.status) - 1, 0), 4)
                ]
              }
              height="12px"
              fillColor="#1976d2"
              bgColor="#e0e0e0"
            />

            <div className="detail-body">
              {selectedOrder.items.length === 0 && (
                <div className="item">Пока нет позиций</div>
              )}

              {selectedOrder.items.map((it) => (
                <div className="item" key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{it.type}</strong> — {it.params.description} —{" "}
                    {it.price.toLocaleString()} BYN × {it.quantity ?? 1}
                  </div>
                  <button
                    className="btn-danger"
                    onClick={async () => {
                      try {
                        await deleteOrderItem(selectedOrder.id, it.id);
                        loadOrders();
                      } catch (e: any) {
                        alert('Не удалось удалить позицию. Возможно нужна авторизация.');
                      }
                    }}
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>

            {/* ====== ВСТАВЛЯЕМ ИТОГОВУЮ СУММУ ====== */}
            <OrderTotal
              items={selectedOrder.items.map((it) => ({
                id: it.id,
                type: it.type,
                price: it.price,
                quantity: it.quantity ?? 1,
              }))}
              discount={0}
              taxRate={0.2}
            />
          </>
        ) : (
          <p>Выберите заказ слева</p>
        )}
      </section>

      {showAddItem && selectedOrder && (
        <AddItemModal
          order={selectedOrder}
          onSave={() => {
            setShowAddItem(false);
            loadOrders();
          }}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {showMaterials && (
        <ManageMaterialsModal onClose={() => setShowMaterials(false)} />
      )}

      {showPresets && (
        <ManagePresetsModal
          onClose={() => setShowPresets(false)}
          onSave={() => setShowPresets(false)}
        />
      )}
    </div>
  );
}
