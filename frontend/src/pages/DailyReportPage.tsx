// frontend/src/pages/DailyReportPage.tsx
import React, { useEffect, useState } from 'react';
import { getDailyReports, getDailyReportByDate, updateDailyReport, createDailyReport, getUsers } from '../api';
import { DailyReport } from '../types';
import EditModal from '../components/EditReportModal';

export const DailyReportPage: React.FC = () => {
  const [history, setHistory] = useState<DailyReport[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getDailyReports().then(res => {
      setHistory(res.data);
      if (res.data.length) {
        setSelectedDate(res.data[0].report_date);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedDate) {
      getDailyReportByDate(selectedDate)
        .then(res => setReport(res.data))
        .catch(() => setReport(null));
    }
  }, [selectedDate]);

  return (
    <div style={{ display: 'flex', padding: 16 }}>
      <aside style={{ width: 200, marginRight: 16 }}>
        <h2>Архив отчётов</h2>
        <button
          style={{ marginBottom: 8 }}
          onClick={async () => {
            const today = new Date().toISOString().slice(0,10);
            setCreating(true);
            try {
              await createDailyReport({ report_date: today });
              const res = await getDailyReports();
              setHistory(res.data);
              setSelectedDate(today);
            } finally { setCreating(false); }
          }}
          disabled={creating}
        >Создать отчёт за сегодня</button>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {history.map(r => (
            <div
              key={r.id}
              onClick={() => setSelectedDate(r.report_date)}
              style={{
                padding: 8,
                cursor: 'pointer',
                background:
                  r.report_date === selectedDate ? '#eef' : undefined
              }}
            >
              {r.report_date} — {r.orders_count}
            </div>
          ))}
        </div>
      </aside>

      <section style={{ flex: 1 }}>
        {report ? (
          <>
            <h2>Отчёт за {selectedDate}</h2>
            <p>Заказов: {report.orders_count}</p>
            <p>
              Выручка:{' '}
              {report.total_revenue.toLocaleString('ru-RU')} BYN
            </p>
            <button onClick={() => setModalOpen(true)}>
              Редактировать
            </button>
          </>
        ) : (
          <p>Нет доступных данных</p>
        )}
      </section>

      {isModalOpen && report && (
        <EditModal
          report={report}
          onClose={() => setModalOpen(false)}
          onSave={async updates => {
            const res = await updateDailyReport(
              report.report_date,
              updates
            );
            setReport(res.data);
            // обновим имя пользователя в списке
            const refreshed = await getDailyReports();
            setHistory(refreshed.data);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
