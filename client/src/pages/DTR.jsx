import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchDTR } from '../services/api';

const DTR = () => {
  const [dtrData, setDtrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDTR();
        setDtrData(res);
      } catch (err) {
        console.error('Failed to load DTR', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const exportCSV = () => {
    if (!dtrData) return;
    const headers = ['Date', 'Mode', 'AM In', 'AM Out', 'PM/WFH In', 'PM/WFH Out', 'Daily Hrs', 'Total Hrs'];
    const rows = dtrData.dtr.map(day => [
      day.date,
      day.isHoliday ? 'HOLIDAY' : day.mode || '-',
      day.amIn ? format(new Date(day.amIn), 'HH:mm') : '-',
      day.amOut ? format(new Date(day.amOut), 'HH:mm') : '-',
      day.pmIn ? format(new Date(day.pmIn), 'HH:mm') : day.wfhIn ? format(new Date(day.wfhIn), 'HH:mm') : '-',
      day.pmOut ? format(new Date(day.pmOut), 'HH:mm') : day.wfhOut ? format(new Date(day.wfhOut), 'HH:mm') : '-',
      day.dailyMinutes ? (day.dailyMinutes / 60).toFixed(2) : '0',
      day.runningTotalMinutes ? (day.runningTotalMinutes / 60).toFixed(2) : '0',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `DTR_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Loading DTR…</p>
    </div>
  );

  const totalHours = parseFloat(dtrData?.totalHours || 0);
  const required = dtrData?.requiredHours || 486;

  return (
    <div className="page-layout">
      {/* Header */}
      <div style={{ marginTop: 32, marginBottom: 28 }}>
        <h1 className="heading" style={{ fontSize: 32, margin: '0 0 4px', letterSpacing: '-1px' }}>Daily Time Record</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
          Official OJT Attendance Log · {totalHours.toFixed(1)} / {required} hrs rendered
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Rendered', value: `${totalHours.toFixed(1)} hrs`, color: '#0084FF' },
          { label: 'Remaining', value: `${Math.max(required - totalHours, 0).toFixed(1)} hrs`, color: '#FF801E' },
          { label: 'Completion', value: `${Math.min((totalHours / required) * 100, 100).toFixed(1)}%`, color: '#10B981' },
          { label: 'Days Logged', value: dtrData?.dtr?.length || 0, color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '18px 20px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', margin: '0 0 6px' }}>{label}</p>
            <span className="heading" style={{ fontSize: 22, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.5)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p className="heading" style={{ fontSize: 15, margin: 0 }}>Attendance Logs</p>
          <button onClick={exportCSV} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date', 'Mode', 'AM In', 'AM Out', 'PM / WFH In', 'PM / WFH Out', 'Daily Hrs', 'Running Total'].map(h => (
                  <th key={h} style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dtrData?.dtr?.length ? dtrData.dtr.map((day, i) => (
                <tr key={i} style={{ background: day.isHoliday ? 'rgba(255,128,30,0.03)' : 'transparent' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {format(new Date(day.date), 'MMM dd (EEE)')}
                  </td>
                  <td>
                    {day.isHoliday
                      ? <span className="badge badge-orange">Holiday</span>
                      : day.mode === 'onsite'
                      ? <span className="badge badge-blue">On-Site</span>
                      : day.mode === 'wfh'
                      ? <span className="badge badge-purple">WFH</span>
                      : '-'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{day.amIn ? format(new Date(day.amIn), 'h:mm a') : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{day.amOut ? format(new Date(day.amOut), 'h:mm a') : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {day.pmIn ? format(new Date(day.pmIn), 'h:mm a') : day.wfhIn ? format(new Date(day.wfhIn), 'h:mm a') : '—'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {day.pmOut ? format(new Date(day.pmOut), 'h:mm a') : day.wfhOut ? format(new Date(day.wfhOut), 'h:mm a') : '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--blue-primary-solid)' }}>
                    {day.dailyMinutes ? (day.dailyMinutes / 60).toFixed(2) : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {day.runningTotalMinutes ? (day.runningTotalMinutes / 60).toFixed(2) : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>📋</span>
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DTR;
