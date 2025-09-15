import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// frontend/src/pages/DailyReportPage.tsx
import { useEffect, useState } from 'react';
import { getDailyReports, getDailyReportByDate, updateDailyReport, createDailyReport, getUsers } from '../api';
import EditModal from '../components/EditReportModal';
export const DailyReportPage = () => {
    const [history, setHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [report, setReport] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [filterUserId, setFilterUserId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [users, setUsers] = useState([]);
    useEffect(() => {
        getUsers().then(r => setUsers(r.data));
    }, []);
    useEffect(() => {
        getDailyReports().then(res => {
            setHistory(res.data);
            if (res.data.length) {
                setSelectedDate(res.data[0].report_date);
            }
        });
    }, []);
    useEffect(() => {
        if (selectedDate) {
            getDailyReportByDate(selectedDate)
                .then(res => setReport(res.data))
                .catch(() => setReport(null));
        }
    }, [selectedDate]);
    return (_jsxs("div", { style: { display: 'flex', padding: 16 }, children: [_jsxs("aside", { style: { width: 200, marginRight: 16 }, children: [_jsx("h2", { children: "\u0410\u0440\u0445\u0438\u0432 \u043E\u0442\u0447\u0451\u0442\u043E\u0432" }), _jsx("button", { style: { marginBottom: 8 }, onClick: async () => {
                            const today = new Date().toISOString().slice(0, 10);
                            setCreating(true);
                            try {
                                await createDailyReport({ report_date: today });
                                const res = await getDailyReports();
                                setHistory(res.data);
                                setSelectedDate(today);
                            }
                            finally {
                                setCreating(false);
                            }
                        }, disabled: creating, children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043E\u0442\u0447\u0451\u0442 \u0437\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }, children: [_jsxs("select", { value: filterUserId, onChange: e => setFilterUserId(e.target.value ? +e.target.value : ''), children: [_jsx("option", { value: "", children: "\u0412\u0441\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438" }), users.map(u => (_jsx("option", { value: u.id, children: u.name }, u.id)))] }), _jsx("input", { type: "date", value: fromDate, onChange: e => setFromDate(e.target.value) }), _jsx("input", { type: "date", value: toDate, onChange: e => setToDate(e.target.value) }), _jsx("button", { onClick: async () => {
                                    const params = new URLSearchParams();
                                    if (filterUserId)
                                        params.set('user_id', String(filterUserId));
                                    if (fromDate)
                                        params.set('from', fromDate);
                                    if (toDate)
                                        params.set('to', toDate);
                                    const res = await fetch('/api/daily-reports' + (params.toString() ? `?${params}` : ''));
                                    const data = await res.json();
                                    setHistory(data);
                                    if (data.length)
                                        setSelectedDate(data[0].report_date);
                                }, children: "\u0424\u0438\u043B\u044C\u0442\u0440" })] }), _jsx("div", { style: { maxHeight: 300, overflowY: 'auto' }, children: history.map(r => (_jsxs("div", { onClick: () => setSelectedDate(r.report_date), style: {
                                padding: 8,
                                cursor: 'pointer',
                                background: r.report_date === selectedDate ? '#eef' : undefined
                            }, children: [r.report_date, " \u2014 ", r.orders_count] }, r.id))) })] }), _jsx("section", { style: { flex: 1 }, children: report ? (_jsxs(_Fragment, { children: [_jsxs("h2", { children: ["\u041E\u0442\u0447\u0451\u0442 \u0437\u0430 ", selectedDate] }), _jsxs("p", { children: ["\u0417\u0430\u043A\u0430\u0437\u043E\u0432: ", report.orders_count] }), _jsxs("p", { children: ["\u0412\u044B\u0440\u0443\u0447\u043A\u0430:", ' ', report.total_revenue.toLocaleString('ru-RU'), " BYN"] }), _jsx("button", { onClick: () => setModalOpen(true), children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })] })) : (_jsx("p", { children: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445" })) }), isModalOpen && report && (_jsx(EditModal, { report: report, onClose: () => setModalOpen(false), onSave: async (updates) => {
                    const res = await updateDailyReport(report.report_date, updates);
                    setReport(res.data);
                    // обновим имя пользователя в списке
                    const refreshed = await getDailyReports();
                    setHistory(refreshed.data);
                    setModalOpen(false);
                } }))] }));
};
