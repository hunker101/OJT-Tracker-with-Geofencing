import React, { useState } from 'react';
import { format } from 'date-fns';
import { logManualSession } from '../services/api';

const SESSION_OPTIONS = [
  { value: 'AM', label: '🌅 AM Session (On-site, 7am–12pm)', workMode: 'onsite' },
  { value: 'PM', label: '🌆 PM Session (On-site, 1pm–6pm)', workMode: 'onsite' },
  { value: 'WFH', label: '💻 WFH Session (Fri–Sun, 8am–5pm)', workMode: 'wfh' },
];

const ManualLogModal = ({ site, onClose, refreshData }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(today);
  const [session, setSession] = useState('AM');
  const [clockIn, setClockIn] = useState('07:00');
  const [clockOut, setClockOut] = useState('12:00');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill default times when session changes
  const handleSessionChange = (val) => {
    setSession(val);
    if (val === 'AM')  { setClockIn('07:00'); setClockOut('12:00'); }
    if (val === 'PM')  { setClockIn('13:00'); setClockOut('18:00'); }
    if (val === 'WFH') { setClockIn('08:00'); setClockOut('17:00'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!date) return setError('Please select a date.');

    const clockInISO  = `${date}T${clockIn}:00`;
    const clockOutISO = `${date}T${clockOut}:00`;
    const chosenSession = SESSION_OPTIONS.find(s => s.value === session);

    setLoading(true);
    try {
      await logManualSession({
        siteId: site?._id,
        workMode: chosenSession.workMode,
        session,
        clockIn: clockInISO,
        clockOut: clockOutISO,
        lunchDeductMins,
        note: note || `Manual past entry — ${session} session on ${date}`,
      });
      refreshData();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log session.');
    }
    setLoading(false);
  };

  const clockInDt = new Date(`${date}T${clockIn}:00`);
  const clockOutDt = new Date(`${date}T${clockOut}:00`);
  const rawMins = (clockOutDt - clockInDt) / 60000;

  // Auto-deduct 1hr lunch break if the session spans 12:00–13:00
  const lunchStart = new Date(`${date}T12:00:00`);
  const lunchEnd   = new Date(`${date}T13:00:00`);
  const hasLunchBreak = rawMins > 0 && clockInDt < lunchEnd && clockOutDt > lunchStart;
  const lunchDeductMins = hasLunchBreak ? 60 : 0;
  const durationMins = rawMins - lunchDeductMins;
  const durationHrs = durationMins > 0 ? (durationMins / 60).toFixed(2) : '—';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in-up">
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(255,255,255,0.6)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth={2.2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p className="heading" style={{ fontSize: 15, margin: 0 }}>Log Past Session</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Record hours you've already rendered</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4, borderRadius: 8 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Date */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => setDate(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          {/* Session type */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Session Type <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SESSION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSessionChange(opt.value)}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    borderColor: session === opt.value ? 'rgba(0,132,255,0.4)' : 'rgba(0,0,0,0.08)',
                    background: session === opt.value ? 'rgba(0,132,255,0.08)' : 'rgba(255,255,255,0.6)',
                    color: session === opt.value ? 'var(--blue-primary-solid)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.value}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              {SESSION_OPTIONS.find(s => s.value === session)?.label}
            </p>
          </div>

          {/* Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time In</label>
              <input type="time" value={clockIn} onChange={e => setClockIn(e.target.value)} className="glass-input" required />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time Out</label>
              <input type="time" value={clockOut} onChange={e => setClockOut(e.target.value)} className="glass-input" required />
            </div>
          </div>

          {/* Duration preview */}
          <div style={{
            padding: '12px 14px',
            background: 'rgba(0,132,255,0.05)',
            borderRadius: 10,
            border: '1px solid rgba(0,132,255,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Duration</span>
              <span className="heading" style={{ fontSize: 18, color: 'var(--blue-primary-solid)' }}>{durationHrs} hrs</span>
            </div>
            {hasLunchBreak && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'right' }}>
                ({(rawMins / 60).toFixed(2)} hrs raw − 1hr lunch break)
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Holiday makeup, forgotten log…"
              className="glass-input"
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#DC2626', margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              type="submit"
              disabled={loading || durationMins <= 0}
              className="btn-primary"
              style={{ opacity: loading || durationMins <= 0 ? 0.6 : 1, cursor: loading || durationMins <= 0 ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving…' : `Log ${durationHrs} hrs`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualLogModal;
