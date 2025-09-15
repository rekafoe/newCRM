import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getMaterials, saveMaterial, deleteMaterial } from '../api';
export default function ManageMaterialsModal({ onClose }) {
    const [materials, setMaterials] = useState([]);
    const [edit, setEdit] = useState({ name: '', unit: '', quantity: 0 });
    useEffect(() => {
        load();
    }, []);
    function load() {
        getMaterials().then(res => setMaterials(res.data));
    }
    function onSave() {
        saveMaterial(edit).then(() => {
            setEdit({ name: '', unit: '', quantity: 0 });
            load();
        });
    }
    return (_jsxs("div", { className: "modal", children: [_jsx("h3", { children: "Materials Stock" }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Unit" }), _jsx("th", { children: "Qty" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [materials.map(m => (_jsxs("tr", { children: [_jsx("td", { children: m.name }), _jsx("td", { children: m.unit }), _jsx("td", { children: m.quantity }), _jsx("td", { children: _jsx("button", { onClick: () => deleteMaterial(m.id).then(load), children: "\u2716" }) })] }, m.id))), _jsxs("tr", { children: [_jsx("td", { children: _jsx("input", { value: edit.name, onChange: e => setEdit(s => ({ ...s, name: e.target.value })), placeholder: "Name" }) }), _jsx("td", { children: _jsx("input", { value: edit.unit, onChange: e => setEdit(s => ({ ...s, unit: e.target.value })), placeholder: "Unit" }) }), _jsx("td", { children: _jsx("input", { type: "number", value: edit.quantity, onChange: e => setEdit(s => ({ ...s, quantity: Number(e.target.value) })) }) }), _jsx("td", { children: _jsx("button", { onClick: onSave, disabled: !edit.name, children: "Save" }) })] })] })] }), _jsx("button", { onClick: onClose, children: "Close" })] }));
}
