import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './app';
import { DailyReportPage } from './pages/DailyReportPage';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(App, {}) }), _jsx(Route, { path: "/reports", element: _jsx(DailyReportPage, {}) })] }) }));
