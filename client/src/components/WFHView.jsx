import React, { useState } from 'react';
import { clockIn, clockOut } from '../services/api';

const WFHView = ({ site, todayLogs, refreshData }) => {
  const [loading, setLoading] = useState(false);

  const wfhLog = todayLogs.find(log => log.session === 'WFH');
  const isClockedIn = wfhLog && !wfhLog.clockOut;
  const isCompleted = wfhLog && wfhLog.clockOut;

  const handleStartWork = async () => {
    setLoading(true);
    try {
      await clockIn({ siteId: site._id, workMode: 'wfh', session: 'WFH', method: 'manual' });
      refreshData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start work');
    }
    setLoading(false);
  };

  const handleEndWork = async () => {
    setLoading(true);
    try {
      await clockOut(wfhLog._id);
      refreshData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end work');
    }
    setLoading(false);
  };

  return (
    <div className="glass-card fade-in-up" style={{ overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          }}>
            <span style={{ fontSize: 16 }}>💻</span>
          </div>
          <div>
            <p className="heading" style={{ fontSize: 15, margin: 0 }}>Work From Home</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Fri – Sun · Manual tracking · 8:00–17:00</p>
          </div>
        </div>
        <span className="badge badge-purple">Manual</span>
      </div>

      {/* Body */}
      <div style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
        {/* Big status orb */}
        <div style={{
          width: 100, height: 100,
          borderRadius: '50%',
          background: isCompleted
            ? 'linear-gradient(135deg, #6EE7B7, #10B981)'
            : isClockedIn
            ? 'linear-gradient(135deg, #60B1FF, #0084FF)'
            : 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40,
          boxShadow: isCompleted ? '0 8px 32px rgba(16,185,129,0.3)' : isClockedIn ? '0 8px 32px rgba(0,132,255,0.3)' : 'none',
          transition: 'all 0.5s ease',
        }}>
          {isCompleted ? '🎉' : isClockedIn ? '💼' : '🏠'}
        </div>

        <div>
          <p className="heading" style={{ fontSize: 20, margin: '0 0 6px' }}>
            {isCompleted ? 'Work Completed!' : isClockedIn ? 'Currently Working' : 'Ready to Start?'}
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0, maxWidth: 340 }}>
            {isCompleted
              ? "Great job! You've completed today's WFH shift. See you tomorrow!"
              : isClockedIn
              ? 'Your WFH session is active. Stay focused and hit your 8-hour target.'
              : 'Click "Start Work" to begin your WFH session for today.'}
          </p>
        </div>

        {!isCompleted && (
          <button
            onClick={isClockedIn ? handleEndWork : handleStartWork}
            disabled={loading}
            className={isClockedIn ? 'btn-danger' : 'btn-primary'}
            style={{ padding: '14px 36px', fontSize: 16, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processing…' : isClockedIn ? '⏹ End Work' : '▶ Start Work'}
          </button>
        )}
      </div>
    </div>
  );
};

export default WFHView;
