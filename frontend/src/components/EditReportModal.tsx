// frontend/src/components/EditReportModal.tsx
import React, { useState } from 'react';
import { DailyReport } from '../types';

interface Props {
  report: DailyReport;
  onClose: () => void;
  onSave: (updates: {
    orders_count?: number;
    total_revenue?: number;
  }) => void;
}

const EditModal: React.FC<Props> = ({ report, onClose, onSave }) => {
  const [ordersCount, setOrdersCount] = useState(report.orders_count);
  const [totalRevenue, setTotalRevenue] = useState(
    report.total_revenue
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Редактировать отчёт за {report.report_date}</h3>
        <label>
          Число заказов:
          <input
            type="number"
            value={ordersCount}
            onChange={e => setOrdersCount(+e.target.value)}
          />
        </label>
        <label>
          Выручка:
          <input
            type="number"
            step="0.01"
            value={totalRevenue}
            onChange={e => setTotalRevenue(+e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <button onClick={onClose}>Отмена</button>
          <button
            onClick={() =>
              onSave({
                orders_count: ordersCount,
                total_revenue: totalRevenue
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
