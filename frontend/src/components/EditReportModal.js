import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// frontend/src/components/EditReportModal.tsx
import { useState } from 'react';
const EditModal = ({ report, onClose, onSave }) => {
    const [ordersCount, setOrdersCount] = useState(report.orders_count);
    const [totalRevenue, setTotalRevenue] = useState(report.total_revenue);
    return (_jsx("div", { className: "modal-backdrop", children: _jsxs("div", { className: "modal", children: [_jsxs("h3", { children: ["\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0442\u0447\u0451\u0442 \u0437\u0430 ", report.report_date] }), _jsxs("label", { children: ["\u0427\u0438\u0441\u043B\u043E \u0437\u0430\u043A\u0430\u0437\u043E\u0432:", _jsx("input", { type: "number", value: ordersCount, onChange: e => setOrdersCount(+e.target.value) })] }), _jsxs("label", { children: ["\u0412\u044B\u0440\u0443\u0447\u043A\u0430:", _jsx("input", { type: "number", step: "0.01", value: totalRevenue, onChange: e => setTotalRevenue(+e.target.value) })] }), _jsxs("div", { className: "modal-actions", children: [_jsx("button", { onClick: onClose, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { onClick: () => onSave({
                                orders_count: ordersCount,
                                total_revenue: totalRevenue
                            }), children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] }) }));
};
export default EditModal;
