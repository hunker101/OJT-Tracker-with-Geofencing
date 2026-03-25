import React, { useState, useEffect } from 'react';
import { format, isWeekend } from 'date-fns';
import { fetchSites, fetchAttendance, fetchDTR } from '../services/api';
import OnSiteView from '../components/OnSiteView';
import WFHView from '../components/WFHView';
import ManualLogModal from '../components/ManualLogModal';
import ProgressBar from '../components/ProgressBar';
import EditModal from '../components/EditModal';

const Dashboard = () => {
  const [site, setSite] = useState(null);
  const [logs, setLogs] = useState([]);
  const [dtrData, setDtrData] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [showManualLog, setShowManualLog] = useState(false);
  const [loading, setLoading] = useState(true);

  const isWfhDay = isWeekend(new Date()) || new Date().getDay() === 5;

  const loadData = async () => {
    try {
      const [sitesRes, logsRes, dtrRes] = await Promise.all([fetchSites(), fetchAttendance(), fetchDTR()]);
      if (sitesRes.length > 0) setSite(sitesRes[0]);
      setLogs(logsRes);
      setDtrData(dtrRes);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLogs = logs.filter(log => log.clockIn && format(new Date(log.clockIn), 'yyyy-MM-dd') === today);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>Loading your tracker…</p>
    </div>
  );

  return (
    <div className="page-layout">
      {/* Page header */}
      <div style={{ marginBottom: 28, marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span className={`badge ${isWfhDay ? 'badge-purple' : 'badge-blue'}`}>
              {isWfhDay ? '🏠 WFH Schedule' : '📍 On-Site Schedule'}
            </span>
          </div>
          <h1 className="heading" style={{ fontSize: 32, margin: '0 0 4px', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button onClick={() => setShowManualLog(true)} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, marginTop: 8 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log Past Session
        </button>
      </div>

      {/* Progress */}
      {dtrData && (
        <ProgressBar totalHours={parseFloat(dtrData.totalHours)} requiredHours={dtrData.requiredHours} />
      )}

      {/* Today's summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Today', value: `${(todayLogs.reduce((a, l) => a + (l.durationMinutes || 0), 0) / 60).toFixed(1)} hrs`, icon: '⏱', color: '#0084FF' },
          { label: 'Sessions', value: todayLogs.length, icon: '📋', color: '#7C3AED' },
          { label: 'Mode', value: isWfhDay ? 'WFH' : 'On-site', icon: isWfhDay ? '🏠' : '📍', color: isWfhDay ? '#7C3AED' : '#0084FF' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass-card" style={{ padding: '18px 20px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)', margin: '0 0 8px' }}>{label}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span className="heading" style={{ fontSize: 22, color }}>{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tracker view (on-site or WFH) */}
      {isWfhDay
        ? <WFHView site={site} todayLogs={todayLogs} refreshData={loadData} />
        : <OnSiteView site={site} />
      }

      {/* Recent Activity */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p className="heading" style={{ fontSize: 15, margin: 0 }}>Recent Activity</p>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{logs.length} sessions total</span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>📭</span>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>No activity logged yet. Start your first session!</p>
          </div>
        ) : (
          <div>
            {logs.slice(0, 10).map((log, i) => (
              <div key={log._id} style={{
                padding: '14px 24px',
                borderBottom: i < 9 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,132,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: log.session === 'WFH' ? 'rgba(124,58,237,0.1)' : 'rgba(0,132,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {log.session === 'WFH' ? '💻' : log.session === 'AM' ? '🌅' : '🌆'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {format(new Date(log.clockIn), 'MMM d, yyyy')}
                      </span>
                      <span className={`badge badge-${log.session === 'WFH' ? 'purple' : 'blue'}`} style={{ fontSize: 10, padding: '1px 7px' }}>{log.session}</span>
                      {log.edited && <span className="badge badge-yellow" style={{ fontSize: 10, padding: '1px 7px' }}>Edited</span>}
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                      {format(new Date(log.clockIn), 'h:mm a')} → {log.clockOut ? format(new Date(log.clockOut), 'h:mm a') : <span style={{ color: '#22C55E' }}>Active</span>}
                      {log.durationMinutes > 0 && <span style={{ marginLeft: 6, color: 'var(--blue-primary-solid)', fontWeight: 600 }}>{(log.durationMinutes / 60).toFixed(1)}h</span>}
                    </span>
                  </div>
                </div>
                <button onClick={() => setEditingLog(log)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingLog && <EditModal log={editingLog} onClose={() => setEditingLog(null)} refreshData={loadData} />}
      {showManualLog && <ManualLogModal site={site} onClose={() => setShowManualLog(false)} refreshData={loadData} />}
    </div>
  );
};

export default Dashboard;
