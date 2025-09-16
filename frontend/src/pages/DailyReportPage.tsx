// frontend/src/pages/DailyReportPage.tsx
import React, { useEffect, useState } from 'react';
import { getDailyReports, getDailyReportByDate, updateDailyReport, createDailyReport, getUsers, getPrinters, submitPrinterCounter, getPrinterCountersByDate, getDailySummary } from '../api';
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
  const [printers, setPrinters] = useState<{ id: number; code: string; name: string }[]>([]);
  const [counterDate, setCounterDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [counters, setCounters] = useState<Record<number, string>>({});
  const [printerCounters, setPrinterCounters] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    getUsers().then(r => setUsers(r.data));
    getPrinters().then(r => setPrinters(r.data));
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
      getPrinterCountersByDate(selectedDate).then(r => setPrinterCounters(r.data as any[]));
      getDailySummary(selectedDate).then(r => setSummary(r.data as any));
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
            {summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '8px 0' }}>
                <div className="order-total"><div className="order-total__line"><span>Позиции</span><span>{summary.items_qty}</span></div><div className="order-total__line"><span>Клики</span><span>{summary.total_clicks}</span></div></div>
                <div className="order-total"><div className="order-total__line"><span>Листы</span><span>{summary.total_sheets}</span></div><div className="order-total__line"><span>Брак</span><span>{summary.total_waste}</span></div></div>
                <div className="order-total"><div className="order-total__line"><span>Предоплаты (оплачено)</span><span>{(summary.prepayment?.paid_amount||0).toLocaleString('ru-RU')} BYN</span></div><div className="order-total__line"><span>Ожидает</span><span>{(summary.prepayment?.pending_amount||0).toLocaleString('ru-RU')} BYN</span></div></div>
              </div>
            )}
            <button onClick={() => setModalOpen(true)}>
              Редактировать
            </button>

            {/* ===== СЧЁТЧИКИ ПРИНТЕРОВ ===== */}
            <div style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}>
              <h3 style={{ marginTop: 0 }}>Счётчики принтеров</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span>Дата:</span>
                <input type="date" value={counterDate} onChange={e => setCounterDate(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 150px 100px', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Принтер</div>
                <div style={{ fontWeight: 600 }}>Предыдущее</div>
                <div style={{ fontWeight: 600 }}>Показание</div>
                <div />
                {printers.map(p => (
                  <React.Fragment key={p.id}>
                    <div>{p.name}</div>
                    <div>{printerCounters.find(pc => pc.id === p.id)?.prev_value ?? '—'}</div>
                    <input type="number" value={counters[p.id] || ''} onChange={e => setCounters(s => ({ ...s, [p.id]: e.target.value }))} />
                    <button onClick={async () => {
                      if (!counters[p.id]) return;
                      try {
                        await submitPrinterCounter(p.id, { counter_date: counterDate, value: Number(counters[p.id]) });
                        alert('Сохранено');
                        getPrinterCountersByDate(counterDate).then(r => setPrinterCounters(r.data as any[]));
                      } catch { alert('Не удалось сохранить'); }
                    }}>Сохранить</button>
                  </React.Fragment>
                ))}
              </div>
              {printerCounters.some(pc => !pc.value) && (
                <div style={{ marginTop: 8, color: '#b45309' }}>Внимание: не по всем принтерам внесены показания за выбранную дату.</div>
              )}
            </div>
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
