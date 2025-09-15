import React, { useEffect, useState } from "react";
import "./index.css";
import { Order } from "./types";
import {
  getOrders,
  createOrder,
  deleteOrder,
} from "./api";
import { Link } from 'react-router-dom';
import AddItemModal from "./components/AddItemModal";
import ManageMaterialsModal from "./components/ManageMaterialsModal";
import ManagePresetsModal from "./components/ManagePresetsModal";

import { ProgressBar, OrderStatus } from "./components/order/ProgressBar";
import { OrderTotal } from "./components/order/OrderTotal";


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
            onClick={() => deleteOrder(selectedOrder.id).then(loadOrders)}
            title="Удалить заказ"
            style={{
              marginTop: 8,
              background: 'none',
              border: '1px solid #c00',
              cursor: 'pointer',
              color: '#c00',
              borderRadius: 4,
              padding: '8px'
            }}
          >
            Удалить выбранный заказ
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
                <button onClick={() => setShowPresets(true)}>Пресеты</button>
                <button onClick={() => setShowAddItem(true)}>+ Позиция</button>
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
                <div className="item" key={it.id}>
                  <strong>{it.type}</strong> — {it.params.description} —{" "}
                  {it.price.toLocaleString()} BYN
                </div>
              ))}
            </div>

            {/* ====== ВСТАВЛЯЕМ ИТОГОВУЮ СУММУ ====== */}
            <OrderTotal
              items={selectedOrder.items.map((it) => ({
                id: it.id,
                type: it.type,
                price: it.price,
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
