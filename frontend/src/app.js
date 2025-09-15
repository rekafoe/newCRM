import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "./index.css";
import { getOrders, createOrder, deleteOrder, deleteOrderItem, } from "./api";
import { Link } from 'react-router-dom';
import AddItemModal from "./components/AddItemModal";
import ManageMaterialsModal from "./components/ManageMaterialsModal";
import ManagePresetsModal from "./components/ManagePresetsModal";
import { ProgressBar } from "./components/order/ProgressBar";
import { OrderTotal } from "./components/order/OrderTotal";
import { setAuthToken } from './api';
export default function App() {
    const [orders, setOrders] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showMaterials, setShowMaterials] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    useEffect(() => {
        loadOrders();
    }, []);
    function loadOrders() {
        getOrders().then((res) => {
            setOrders(res.data);
            if (!selectedId && res.data.length)
                setSelectedId(res.data[0].id);
        });
    }
    async function handleCreateOrder() {
        const res = await createOrder();
        const order = res.data;
        setOrders([order, ...orders]);
        setSelectedId(order.id);
    }
    const selectedOrder = orders.find((o) => o.id === selectedId);
    return (_jsxs("div", { className: "app", children: [_jsxs("aside", { className: "sidebar", children: [_jsx(Link, { to: "/reports", children: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u043E\u0442\u0447\u0451\u0442\u044B" }), _jsx("h2", { children: "\u0417\u0430\u043A\u0430\u0437\u044B" }), _jsx("ul", { className: "order-list", children: orders.map((o) => (_jsx("li", { className: `order-item ${o.id === selectedId ? "active" : ""}`, onClick: () => setSelectedId(o.id), children: o.number }, o.id))) }), _jsx("button", { className: "add-order-btn", onClick: handleCreateOrder, children: "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), selectedOrder && (_jsx("button", { className: "btn-danger", style: { marginTop: 8 }, onClick: async () => {
                            try {
                                await deleteOrder(selectedOrder.id);
                                setSelectedId(null);
                                loadOrders();
                            }
                            catch (e) {
                                alert('Не удалось удалить заказ. Возможно нужна авторизация.');
                            }
                        }, children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" })), _jsx("button", { className: "add-order-btn", style: { marginTop: 8 }, onClick: () => setShowMaterials(true), children: "\uD83D\uDCE6 \u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B" })] }), _jsx("section", { className: "detail", children: selectedOrder ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "detail-header", children: [_jsx("h2", { children: selectedOrder.number }), _jsxs("div", { className: "detail-actions", children: [_jsx("button", { onClick: () => setShowPresets(true), children: "\u041F\u0440\u0435\u0441\u0435\u0442\u044B" }), _jsx("button", { onClick: () => setShowAddItem(true), children: "+ \u041F\u043E\u0437\u0438\u0446\u0438\u044F" }), _jsx("button", { onClick: () => { setAuthToken(undefined); location.href = '/login'; }, children: "\u0412\u044B\u0439\u0442\u0438" })] })] }), _jsx(ProgressBar, { current: ['Новый', 'В производстве', 'Готов к отправке', 'Отправлен', 'Завершён'][Math.min(Math.max(Number(selectedOrder.status) - 1, 0), 4)], height: "12px", fillColor: "#1976d2", bgColor: "#e0e0e0" }), _jsxs("div", { className: "detail-body", children: [selectedOrder.items.length === 0 && (_jsx("div", { className: "item", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0439" })), selectedOrder.items.map((it) => (_jsxs("div", { className: "item", style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("strong", { children: it.type }), " \u2014 ", it.params.description, " \u2014", " ", it.price.toLocaleString(), " BYN"] }), _jsx("button", { className: "btn-danger", onClick: async () => {
                                                try {
                                                    await deleteOrderItem(selectedOrder.id, it.id);
                                                    loadOrders();
                                                }
                                                catch (e) {
                                                    alert('Не удалось удалить позицию. Возможно нужна авторизация.');
                                                }
                                            }, children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] }, it.id)))] }), _jsx(OrderTotal, { items: selectedOrder.items.map((it) => ({
                                id: it.id,
                                type: it.type,
                                price: it.price,
                            })), discount: 0, taxRate: 0.2 })] })) : (_jsx("p", { children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u0430\u043A\u0430\u0437 \u0441\u043B\u0435\u0432\u0430" })) }), showAddItem && selectedOrder && (_jsx(AddItemModal, { order: selectedOrder, onSave: () => {
                    setShowAddItem(false);
                    loadOrders();
                }, onClose: () => setShowAddItem(false) })), showMaterials && (_jsx(ManageMaterialsModal, { onClose: () => setShowMaterials(false) })), showPresets && (_jsx(ManagePresetsModal, { onClose: () => setShowPresets(false), onSave: () => setShowPresets(false) }))] }));
}
