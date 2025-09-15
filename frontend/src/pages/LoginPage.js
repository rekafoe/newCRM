import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { setAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';
export default function LoginPage() {
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        if (!token)
            return;
        setAuthToken(token);
        navigate('/', { replace: true });
    }
    return (_jsx("div", { style: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7f8' }, children: _jsxs("form", { onSubmit: handleSubmit, style: {
                width: 320,
                padding: 16,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff'
            }, children: [_jsx("h2", { style: { margin: '0 0 12px 0', fontSize: '1.25rem' }, children: "\u0412\u0445\u043E\u0434 \u0432 CRM" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx("input", { placeholder: "API Token", value: token, onChange: (e) => setToken(e.target.value), style: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 } }), _jsx("button", { type: "submit", style: { padding: '10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff' }, children: "\u0412\u043E\u0439\u0442\u0438" })] }), _jsxs("div", { style: { marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("small", { style: { opacity: .7 }, children: "\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0435 \u0442\u043E\u043A\u0435\u043D\u044B:" }), _jsx("button", { type: "button", onClick: () => setToken('admin-token-123'), style: { border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }, children: "admin" }), _jsx("button", { type: "button", onClick: () => setToken('manager-token-111'), style: { border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }, children: "manager-1" }), _jsx("button", { type: "button", onClick: () => setToken('manager-token-222'), style: { border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }, children: "manager-2" }), _jsx("button", { type: "button", onClick: () => setToken('viewer-token-333'), style: { border: '1px solid #e5e7eb', background: '#fff', padding: '4px 6px', borderRadius: 6 }, children: "viewer" })] })] }) }));
}
