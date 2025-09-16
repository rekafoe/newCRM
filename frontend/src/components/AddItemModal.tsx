import React, { useEffect, useState } from 'react';
import { PresetCategory, MaterialRow, Item, Order } from '../types';
import { addOrderItem, getProductMaterials, getPresets, getPrinters } from '../api';
import type { Printer } from '../types';

interface Props {
  order: Order;
  onSave: () => void;
  onClose: () => void;
}

export default function AddItemModal({ order, onSave, onClose }: Props) {
  const [presets, setPresets] = useState<PresetCategory[]>([]);
  const [category, setCategory] = useState<PresetCategory | null>(null);
  const [product, setProduct] = useState<PresetCategory['items'][0] | null>(null);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState<Record<string, number | boolean>>({});
  const [required, setRequired] = useState<MaterialRow[]>([]);
  const [ok, setOk] = useState(true);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerId, setPrinterId] = useState<number | ''>('');
  const [sides, setSides] = useState(1);
  const [sheets, setSheets] = useState(0);
  const [waste, setWaste] = useState(0);

  useEffect(() => {
    getPresets().then(r => setPresets(r.data));
    getPrinters().then(r => setPrinters(r.data));
    if (product && category) {
      getProductMaterials(category.category, product.description).then(res => {
        setRequired(res.data);
        setOk(res.data.every(r => r.quantity >= r.qtyPerItem * Math.max(1, quantity)));
      });
    }
  }, [product, category, quantity]);

  function handleSave() {
    if (!product || !category) return;
    const params = { description: product.description };
    const item: Omit<Item, 'id'> = {
      type: category.category,
      params,
      price: price || product.price,
      quantity,
      printerId: printerId ? Number(printerId) : undefined,
      sides,
      sheets,
      waste
    };
    addOrderItem(order.id, item).then(onSave);
  }

  return (
    <div className="modal">
      <h3>Добавить позицию</h3>
      <div>
        <select onChange={e => {
          const cat = presets.find(p => p.category === e.target.value)!;
          setCategory(cat);
          setProduct(null);
          setPrice(0);
        }}>
          <option value="">Выберите категорию</option>
          {presets.map(p => (
            <option key={p.category} value={p.category}>{p.category}</option>
          ))}
        </select>
      </div>

      {category && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select onChange={e => {
            const prod = category.items.find(i => i.description === e.target.value)!;
            setProduct(prod);
            setPrice(prod.price);
          }}>
            <option value="">Выберите продукт</option>
            {category.items.map(i => (
              <option key={i.description} value={i.description}>
                {i.description} ({i.price})
              </option>
            ))}
          </select>
          {product && (
            <button
              className="btn-danger"
              onClick={() => setProduct(null)}
            >Очистить</button>
          )}
        </div>
      )}

      {product && (
        <div>
          <p>Базовая цена: {product.price}</p>
          <p>
            Своя цена:{' '}
            <input
              type="number"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
            />
          </p>
          <p>
            Количество:
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              style={{ marginLeft: 8 }}
            />
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label>
              Принтер:
              <select value={printerId} onChange={e => setPrinterId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Не выбран</option>
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Стороны:
              <select value={sides} onChange={e => setSides(Number(e.target.value))}>
                <option value={1}>Односторонняя</option>
                <option value={2}>Двусторонняя</option>
              </select>
            </label>
            <label>
              Листы SRA3:
              <input type="number" value={sheets} min={0} onChange={e => setSheets(Math.max(0, Number(e.target.value) || 0))} />
            </label>
            <label>
              Брак (листы):
              <input type="number" value={waste} min={0} onChange={e => setWaste(Math.max(0, Number(e.target.value) || 0))} />
            </label>
          </div>
        </div>
      )}

      {required.length > 0 && (
        <div style={{ color: ok ? 'green' : 'red' }}>
          {required.map(r => (
            <div key={r.materialId}>
              {r.name}: {r.quantity}{r.unit} / needs {r.qtyPerItem * Math.max(1, quantity)}{r.unit}
            </div>
          ))}
        </div>
      )}

      <button onClick={onClose}>Отмена</button>
      <button onClick={handleSave} disabled={!product || !ok}>Сохранить</button>
    </div>
  );
}
