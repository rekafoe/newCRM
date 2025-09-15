import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { setAuthToken } from '../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            setAuthToken(res.data.token);
            navigate('/', { replace: true });
        }
        catch (e) {
            setError('Неверный email или пароль');
        }
    }
    return (_jsx("div", { style: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7f8' }, children: _jsxs("form", { onSubmit: handleSubmit, style: {
                width: 320,
                padding: 16,
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff'
            }, children: [_jsx("h2", { style: { margin: '0 0 12px 0', fontSize: '1.25rem' }, children: "\u0412\u0445\u043E\u0434 \u0432 CRM" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx("input", { placeholder: "Email", value: email, onChange: e => setEmail(e.target.value), style: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 } }), _jsx("input", { placeholder: "\u041F\u0430\u0440\u043E\u043B\u044C", type: "password", value: password, onChange: e => setPassword(e.target.value), style: { padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6 } }), _jsx("button", { type: "submit", style: { padding: '10px', borderRadius: 6, border: '1px solid #1976d2', background: '#1976d2', color: '#fff' }, children: "\u0412\u043E\u0439\u0442\u0438" })] }), error && _jsx("div", { style: { color: '#c00', marginTop: 8 }, children: error })] }) }));
}
