import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { addOrderItem, getProductMaterials, getPresets } from '../api';
export default function AddItemModal({ order, onSave, onClose }) {
    const [presets, setPresets] = useState([]);
    const [category, setCategory] = useState(null);
    const [product, setProduct] = useState(null);
    const [price, setPrice] = useState(0);
    const [extras, setExtras] = useState({});
    const [required, setRequired] = useState([]);
    const [ok, setOk] = useState(true);
    useEffect(() => {
        getPresets().then(r => setPresets(r.data));
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
    return (_jsxs("div", { className: "modal", children: [_jsx("h3", { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u044E" }), _jsx("div", { children: _jsxs("select", { onChange: e => {
                        const cat = presets.find(p => p.category === e.target.value);
                        setCategory(cat);
                        setProduct(null);
                        setPrice(0);
                    }, children: [_jsx("option", { value: "", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E" }), presets.map(p => (_jsx("option", { value: p.category, children: p.category }, p.category)))] }) }), category && (_jsx("div", { children: _jsxs("select", { onChange: e => {
                        const prod = category.items.find(i => i.description === e.target.value);
                        setProduct(prod);
                        setPrice(prod.price);
                    }, children: [_jsx("option", { value: "", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442" }), category.items.map(i => (_jsxs("option", { value: i.description, children: [i.description, " (", i.price, ")"] }, i.description)))] }) })), product && (_jsxs("div", { children: [_jsxs("p", { children: ["\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430: ", product.price] }), _jsxs("p", { children: ["\u0421\u0432\u043E\u044F \u0446\u0435\u043D\u0430:", ' ', _jsx("input", { type: "number", value: price, onChange: e => setPrice(Number(e.target.value)) })] })] })), required.length > 0 && (_jsx("div", { style: { color: ok ? 'green' : 'red' }, children: required.map(r => (_jsxs("div", { children: [r.name, ": ", r.quantity, r.unit, " / needs ", r.qtyPerItem, r.unit] }, r.materialId))) })), _jsx("button", { onClick: onClose, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { onClick: handleSave, disabled: !product || !ok, children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] }));
}
