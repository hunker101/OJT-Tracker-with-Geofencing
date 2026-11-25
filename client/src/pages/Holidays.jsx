import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchHolidays, addHoliday, deleteHoliday } from '../services/api';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [name, setName] = useState('');
  const [type, setType] = useState('regular');

  const loadHolidays = async () => {
    try {
      const res = await fetchHolidays();
      setHolidays(res);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHolidays(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addHoliday({ date, name: name.trim(), type });
      setName('');
      loadHolidays();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add holiday');
    }
  };

  const handleDelete = async (holiday) => {
    if (!window.confirm(`Delete ${holiday.name} on ${format(new Date(holiday.date), 'MMM d, yyyy')}?`)) return;
    try {
      await deleteHoliday(holiday._id);
      loadHolidays();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete holiday');
    }
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading holidays…</p>
    </div>
  );

  return (
    <div className="page-layout">
      <div style={{ marginTop: 32, marginBottom: 28 }}>
        <h1 className="heading" style={{ fontSize: 32, margin: '0 0 4px', letterSpacing: '-1px' }}>Holidays</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
          Holidays are excluded from the DTR total hours, and now appear in the DTR even on days with no log.
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <p className="heading" style={{ fontSize: 15, margin: '0 0 16px' }}>Add Holiday</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass-input" required />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday name, e.g. Christmas Day" className="glass-input" required />
            <select value={type} onChange={(e) => setType(e.target.value)} className="glass-input">
              <option value="regular">Regular</option>
              <option value="special">Special</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn-primary">Add Holiday</button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
          <p className="heading" style={{ fontSize: 15, margin: 0 }}>{holidays.length} holiday(s)</p>
        </div>
        {holidays.length === 0 ? (
          <p style={{ padding: '32px 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>No holidays yet.</p>
        ) : holidays.map((h, i) => (
          <div key={h._id} style={{ padding: '14px 24px', borderBottom: i < holidays.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>{h.name}</span>
              <span className={`badge badge-${h.type === 'special' ? 'purple' : 'orange'}`} style={{ fontSize: 10, padding: '1px 7px', marginLeft: 8 }}>{h.type}</span>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                {format(new Date(h.date), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
            <button onClick={() => handleDelete(h)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, color: '#DC2626' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Holidays;
