import React, { useState } from 'react';
import { setAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAuthToken(token);
    navigate('/', { replace: true });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7f8' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 320,
          padding: 16,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#fff'
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>Вход в CRM</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            placeholder="API Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <button
            type="submit"
            style={{ padding: '10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff' }}
          >
            Войти
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <small style={{ opacity: .7 }}>Тестовые токены:</small>
          <button type="button" onClick={() => setToken('admin-token-123')} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }}>admin</button>
          <button type="button" onClick={() => setToken('manager-token-111')} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }}>manager-1</button>
          <button type="button" onClick={() => setToken('manager-token-222')} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }}>manager-2</button>
          <button type="button" onClick={() => setToken('viewer-token-333')} style={{ border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }}>viewer</button>
        </div>
      </form>
    </div>
  );
}

