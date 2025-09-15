import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// frontend/src/components/ManagePresetsModal.tsx
import { useState } from 'react';
import { defaultPresets } from '../presets';
export default function ManagePresetsModal({ onClose, onSave }) {
    // Инициализируем из localStorage или дефолтными
    const [presets, setPresets] = useState(() => {
        const stored = localStorage.getItem('crmPresets');
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch {
                // игнорируем ошибку парсинга
            }
        }
        return defaultPresets;
    });
    // Формы для добавления новых items и extras
    const [newItem, setNewItem] = useState({});
    const [newExtra, setNewExtra] = useState({});
    // Сохранить всё в localStorage и закрыть
    function handleSaveAll() {
        localStorage.setItem('crmPresets', JSON.stringify(presets));
        onSave();
    }
    // Добавить новую категорию
    function addCategory() {
        setPresets([
            ...presets,
            { category: '', color: '#000000', items: [], extras: [] }
        ]);
    }
    // Удалить категорию
    function removeCategory(idx) {
        setPresets(presets.filter((_, i) => i !== idx));
    }
    // Обновить категорию
    function updateCategoryField(idx, field, value) {
        const arr = [...presets];
        arr[idx][field] = value;
        setPresets(arr);
    }
    // Items
    function addItem(idx) {
        const form = newItem[idx];
        if (!form || !form.desc)
            return;
        const arr = [...presets];
        const items = [...arr[idx].items, { description: form.desc, price: Number(form.price) }];
        arr[idx] = { ...arr[idx], items };
        setPresets(arr);
        setNewItem({ ...newItem, [idx]: { desc: '', price: '' } });
    }
    function removeItem(catIdx, itemIdx) {
        const arr = [...presets];
        arr[catIdx].items = arr[catIdx].items.filter((_, i) => i !== itemIdx);
        setPresets(arr);
    }
    function updateItemField(catIdx, itemIdx, field, value) {
        const arr = [...presets];
        const item = { ...arr[catIdx].items[itemIdx], [field]: field === 'price' ? Number(value) : value };
        arr[catIdx].items[itemIdx] = item;
        setPresets(arr);
    }
    // Extras
    function addExtra(idx) {
        const form = newExtra[idx];
        if (!form || !form.name)
            return;
        const arr = [...presets];
        const extra = {
            name: form.name,
            price: Number(form.price),
            type: form.type,
            unit: form.type === 'number' ? form.unit : undefined
        };
        arr[idx] = { ...arr[idx], extras: [...arr[idx].extras, extra] };
        setPresets(arr);
        setNewExtra({ ...newExtra, [idx]: { name: '', price: '', type: 'checkbox', unit: '' } });
    }
    function removeExtra(catIdx, extraIdx) {
        const arr = [...presets];
        arr[catIdx].extras = arr[catIdx].extras.filter((_, i) => i !== extraIdx);
        setPresets(arr);
    }
    function updateExtraField(catIdx, extraIdx, field, value) {
        const arr = [...presets];
        const extra = { ...arr[catIdx].extras[extraIdx], [field]: field === 'price' ? Number(value) : value };
        // Если сменили type на 'checkbox', очищаем unit
        if (field === 'type' && value === 'checkbox') {
            extra.unit = undefined;
        }
        arr[catIdx].extras[extraIdx] = extra;
        setPresets(arr);
    }
    return (_jsxs("div", { className: "modal", children: [_jsx("h3", { children: "Manage Presets" }), _jsx("button", { onClick: addCategory, children: "\u2795 Add Category" }), presets.map((cat, idx) => (_jsxs("div", { style: { border: `2px solid ${cat.color}`, padding: 8, margin: '8px 0' }, children: [_jsxs("div", { children: [_jsx("input", { value: cat.category, placeholder: "Category Name", onChange: e => updateCategoryField(idx, 'category', e.target.value) }), _jsx("input", { type: "color", value: cat.color, onChange: e => updateCategoryField(idx, 'color', e.target.value) }), _jsx("button", { onClick: () => removeCategory(idx), children: "\uD83D\uDDD1 Delete Category" })] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx("h4", { children: "Items" }), cat.items.map((it, i) => (_jsxs("div", { children: [_jsx("input", { value: it.description, onChange: e => updateItemField(idx, i, 'description', e.target.value) }), _jsx("input", { type: "number", value: it.price, onChange: e => updateItemField(idx, i, 'price', e.target.value) }), _jsx("button", { onClick: () => removeItem(idx, i), children: "\u2716" })] }, i))), _jsxs("div", { children: [_jsx("input", { placeholder: "New description", value: newItem[idx]?.desc || '', onChange: e => setNewItem({
                                            ...newItem,
                                            [idx]: { ...(newItem[idx] || { desc: '', price: '' }), desc: e.target.value }
                                        }) }), _jsx("input", { type: "number", placeholder: "Price", value: newItem[idx]?.price || '', onChange: e => setNewItem({
                                            ...newItem,
                                            [idx]: { ...(newItem[idx] || { desc: '', price: '' }), price: e.target.value }
                                        }) }), _jsx("button", { onClick: () => addItem(idx), children: "\u2795 Add Item" })] })] }), _jsxs("div", { style: { marginTop: 8 }, children: [_jsx("h4", { children: "Extras" }), cat.extras.map((ex, i) => (_jsxs("div", { children: [_jsx("input", { value: ex.name, onChange: e => updateExtraField(idx, i, 'name', e.target.value) }), _jsx("input", { type: "number", value: ex.price, onChange: e => updateExtraField(idx, i, 'price', e.target.value) }), _jsxs("select", { value: ex.type, onChange: e => updateExtraField(idx, i, 'type', e.target.value), children: [_jsx("option", { value: "checkbox", children: "Checkbox" }), _jsx("option", { value: "number", children: "Number" })] }), ex.type === 'number' && (_jsx("input", { placeholder: "Unit", value: ex.unit || '', onChange: e => updateExtraField(idx, i, 'unit', e.target.value) })), _jsx("button", { onClick: () => removeExtra(idx, i), children: "\u2716" })] }, i))), _jsxs("div", { children: [_jsx("input", { placeholder: "New extra name", value: newExtra[idx]?.name || '', onChange: e => setNewExtra({
                                            ...newExtra,
                                            [idx]: { ...(newExtra[idx] || { name: '', price: '', type: 'checkbox', unit: '' }), name: e.target.value }
                                        }) }), _jsx("input", { type: "number", placeholder: "Price", value: newExtra[idx]?.price || '', onChange: e => setNewExtra({
                                            ...newExtra,
                                            [idx]: { ...(newExtra[idx] || { name: '', price: '', type: 'checkbox', unit: '' }), price: e.target.value }
                                        }) }), _jsxs("select", { value: newExtra[idx]?.type || 'checkbox', onChange: e => setNewExtra({
                                            ...newExtra,
                                            [idx]: { ...(newExtra[idx] || { name: '', price: '', type: 'checkbox', unit: '' }), type: e.target.value }
                                        }), children: [_jsx("option", { value: "checkbox", children: "Checkbox" }), _jsx("option", { value: "number", children: "Number" })] }), newExtra[idx]?.type === 'number' && (_jsx("input", { placeholder: "Unit", value: newExtra[idx]?.unit || '', onChange: e => setNewExtra({
                                            ...newExtra,
                                            [idx]: { ...(newExtra[idx] || { name: '', price: '', type: 'checkbox', unit: '' }), unit: e.target.value }
                                        }) })), _jsx("button", { onClick: () => addExtra(idx), children: "\u2795 Add Extra" })] })] })] }, idx))), _jsxs("div", { style: { marginTop: 16 }, children: [_jsx("button", { onClick: onClose, children: "Cancel" }), _jsx("button", { onClick: handleSaveAll, children: "Save All" })] })] }));
}
