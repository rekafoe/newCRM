import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './app';
import { DailyReportPage } from './pages/DailyReportPage';
import LoginPage from './pages/LoginPage';
import './index.css';
function RequireAuth({ children }) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('crmToken') : null;
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    return children;
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(RequireAuth, { children: _jsx(App, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(RequireAuth, { children: _jsx(DailyReportPage, {}) }) })] }) }));
