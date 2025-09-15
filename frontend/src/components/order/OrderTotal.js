import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
// Форматер для BYN
const bynFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'BYN',
    minimumFractionDigits: 2,
});
export const OrderTotal = ({ items, discount = 0, taxRate = 0, }) => {
    // Приводим все входящие к числам
    const subtotal = React.useMemo(() => {
        return items.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity ?? 1) || 0;
            const service = Number(item.serviceCost ?? 0) || 0;
            return sum + price * qty + service;
        }, 0);
    }, [items]);
    const disc = Number(discount) || 0;
    const rate = Number(taxRate) || 0;
    const tax = React.useMemo(() => (subtotal - disc) * rate, [
        subtotal,
        disc,
        rate,
    ]);
    const total = subtotal - disc + tax;
    return (_jsxs("div", { className: "order-total", children: [_jsxs("div", { className: "order-total__line", children: [_jsx("span", { children: "\u041F\u043E\u0434\u044B\u0442\u043E\u0433:" }), _jsx("span", { children: bynFormatter.format(subtotal) })] }), disc > 0 && (_jsxs("div", { className: "order-total__line", children: [_jsx("span", { children: "\u0421\u043A\u0438\u0434\u043A\u0430:" }), _jsxs("span", { children: ["-", bynFormatter.format(disc)] })] })), tax > 0 && (_jsxs("div", { className: "order-total__line", children: [_jsx("span", { children: "\u041D\u0414\u0421:" }), _jsx("span", { children: bynFormatter.format(tax) })] })), _jsx("hr", {}), _jsxs("div", { className: "order-total__sum", children: [_jsx("span", { children: "\u0418\u0442\u043E\u0433\u043E:" }), _jsx("span", { children: bynFormatter.format(total) })] })] }));
};
