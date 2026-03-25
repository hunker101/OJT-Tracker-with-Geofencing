import React from 'react';

const ProgressBar = ({ totalHours, requiredHours }) => {
  const percentage = Math.min((totalHours / requiredHours) * 100, 100);
  const remaining = Math.max(requiredHours - totalHours, 0).toFixed(1);
  const displayPct = percentage.toFixed(1);

  return (
    <div className="glass-card fade-in-up" style={{ padding: '28px 32px', marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>OJT Progress</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="heading" style={{ fontSize: 38, lineHeight: 1 }}>{totalHours.toFixed(1)}</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}>/ {requiredHours} hrs</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Remaining</p>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: '#FF801E' }}>{remaining} hrs</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="progress-track" style={{ marginBottom: 12 }}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-blue">{displayPct}% Complete</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Target: 486 hrs</span>
      </div>
    </div>
  );
};

export default ProgressBar;
