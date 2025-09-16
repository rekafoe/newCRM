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
  const [filterUserId, setFilterUserId] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getUsers().then(r => setUsers(r.data));
  }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0' }}>
          <select value={filterUserId} onChange={e => setFilterUserId(e.target.value ? +e.target.value : '')}>
            <option value="">Все пользователи</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          <button onClick={async () => {
            const res = await getDailyReports({
              user_id: filterUserId || undefined,
              from: fromDate || undefined,
              to: toDate || undefined
            });
            const data = res.data;
            setHistory(data);
            if (data.length) setSelectedDate(data[0].report_date);
          }}>Фильтр</button>
        </div>
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
