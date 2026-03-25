import React, { useState } from 'react';
import { updateAttendance } from '../services/api';
import { format } from 'date-fns';

const EditModal = ({ log, onClose, refreshData }) => {
  const [clockIn, setClockIn] = useState(log.clockIn ? log.clockIn.slice(0, 16) : '');
  const [clockOut, setClockOut] = useState(log.clockOut ? log.clockOut.slice(0, 16) : '');
  const [editReason, setEditReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editReason) return alert('Reason is required');
    setLoading(true);
    try {
      await updateAttendance(log._id, { clockIn, clockOut, editReason });
      refreshData();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in-up">
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.6)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #60B1FF, #0084FF)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <p className="heading" style={{ fontSize: 16, margin: 0 }}>Edit Time Record</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 8, display: 'flex' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Session badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Session:</span>
            <span className={`badge badge-${log.session === 'WFH' ? 'purple' : 'blue'}`}>{log.session}</span>
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time In</label>
            <input type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} className="glass-input" />
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time Out</label>
            <input type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)} className="glass-input" />
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Reason for Edit <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              required
              placeholder="e.g. Holiday, forgot to clock out, GPS error…"
              className="glass-input"
              style={{ height: 90, resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
