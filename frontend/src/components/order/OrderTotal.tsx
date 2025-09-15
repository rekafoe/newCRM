import React from 'react';

export interface OrderItem {
  id: number;
  type: string;
  price: number | string;
  quantity?: number | string;
  serviceCost?: number | string;
}

interface OrderTotalProps {
  items: OrderItem[];
  discount?: number | string;
  taxRate?: number | string;
}

// Форматер для BYN
const bynFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'BYN',
  minimumFractionDigits: 2,
});

export const OrderTotal: React.FC<OrderTotalProps> = ({
  items,
  discount = 0,
  taxRate = 0,
}) => {
  // Приводим все входящие к числам
  const subtotal = React.useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity ?? 1) || 0;
      const service = Number(item.serviceCost ?? 0) || 0;
      return sum + price * qty + service;
    }, 0);
  }, [items]);

  const disc = Number(discount) || 0;
  const rate = Number(taxRate) || 0;

  const tax = React.useMemo(() => (subtotal - disc) * rate, [
    subtotal,
    disc,
    rate,
  ]);

  const total = subtotal - disc + tax;

  return (
    <div className="order-total">
      <div className="order-total__line">
        <span>Подытог:</span>
        <span>{bynFormatter.format(subtotal)}</span>
      </div>
      {disc > 0 && (
        <div className="order-total__line">
          <span>Скидка:</span>
          <span>-{bynFormatter.format(disc)}</span>
        </div>
      )}
      {tax > 0 && (
        <div className="order-total__line">
          <span>НДС:</span>
          <span>{bynFormatter.format(tax)}</span>
        </div>
      )}
      <hr />
      <div className="order-total__sum">
        <span>Итого:</span>
        <span>{bynFormatter.format(total)}</span>
      </div>
    </div>
  );
};
