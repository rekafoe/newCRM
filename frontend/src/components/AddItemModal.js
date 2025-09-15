import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { defaultPresets } from '../presets';
import { addOrderItem, getProductMaterials } from '../api';
export default function AddItemModal({ order, onSave, onClose }) {
    const [presets] = useState(() => {
        const stored = localStorage.getItem('crmPresets');
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch { }
        }
        return defaultPresets;
    });
    const [category, setCategory] = useState(null);
    const [product, setProduct] = useState(null);
    const [price, setPrice] = useState(0);
    const [extras, setExtras] = useState({});
    const [required, setRequired] = useState([]);
    const [ok, setOk] = useState(true);
    useEffect(() => {
        if (product && category) {
            getProductMaterials(category.category, product.description).then(res => {
                setRequired(res.data);
                setOk(res.data.every(r => r.quantity >= r.qtyPerItem));
            });
        }
    }, [product, category]);
    function handleSave() {
        if (!product || !category)
            return;
        const params = { description: product.description };
        const item = {
            type: category.category,
            params,
            price: price || product.price
        };
        addOrderItem(order.id, item).then(onSave);
    }
    return (_jsxs("div", { className: "modal", children: [_jsx("h3", { children: "Add Item" }), _jsx("div", { children: _jsxs("select", { onChange: e => {
                        const cat = presets.find(p => p.category === e.target.value);
                        setCategory(cat);
                        setProduct(null);
                        setPrice(0);
                    }, children: [_jsx("option", { value: "", children: "Select Category" }), presets.map(p => (_jsx("option", { value: p.category, children: p.category }, p.category)))] }) }), category && (_jsx("div", { children: _jsxs("select", { onChange: e => {
                        const prod = category.items.find(i => i.description === e.target.value);
                        setProduct(prod);
                        setPrice(prod.price);
                    }, children: [_jsx("option", { value: "", children: "Select Product" }), category.items.map(i => (_jsxs("option", { value: i.description, children: [i.description, " (", i.price, ")"] }, i.description)))] }) })), product && (_jsxs("div", { children: [_jsxs("p", { children: ["Base Price: ", product.price] }), _jsxs("p", { children: ["Custom Price:", ' ', _jsx("input", { type: "number", value: price, onChange: e => setPrice(Number(e.target.value)) })] })] })), required.length > 0 && (_jsx("div", { style: { color: ok ? 'green' : 'red' }, children: required.map(r => (_jsxs("div", { children: [r.name, ": ", r.quantity, r.unit, " / needs ", r.qtyPerItem, r.unit] }, r.materialId))) })), _jsx("button", { onClick: onClose, children: "Cancel" }), _jsx("button", { onClick: handleSave, disabled: !product || !ok, children: "Save" })] }));
}
