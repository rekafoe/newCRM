// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './app';
import { DailyReportPage } from './pages/DailyReportPage';
import LoginPage from './pages/LoginPage';
import './index.css';

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('crmToken') : null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><App /></RequireAuth>} />
      <Route path="/reports" element={<RequireAuth><DailyReportPage /></RequireAuth>} />
    </Routes>
  </BrowserRouter>
);
