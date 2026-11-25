import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchSites, addSite, updateSite, deleteSite } from '../services/api';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSiteId, setActiveSiteId] = useState(localStorage.getItem('ojt_active_site_id') || '');
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState(150);

  const loadSites = async () => {
    try {
      const res = await fetchSites();
      setSites(res);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSites(); }, []);

  const startEdit = (site) => {
    setEditing(site);
    setName(site.name || '');
    setAddress(site.address || '');
    setLat(site.location ? String(site.location.lat) : '');
    setLng(site.location ? String(site.location.lng) : '');
    setRadius(site.radius_meters || 150);
    setError('');
  };

  const resetForm = () => {
    setEditing(null);
    setName('');
    setAddress('');
    setLat('');
    setLng('');
    setRadius(150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: name.trim(),
      address: address.trim(),
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius_meters: Number(radius),
    };
    try {
      if (editing) {
        await updateSite(editing._id, payload);
      } else {
        await addSite(payload);
      }
      resetForm();
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to save site');
    }
  };

  const handleDelete = async (site) => {
    if (!window.confirm(`Delete ${site.name}? This is blocked if any attendance record uses this site.`)) return;
    try {
      await deleteSite(site._id);
      if (activeSiteId === site._id) {
        localStorage.removeItem('ojt_active_site_id');
        setActiveSiteId('');
      }
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete site');
    }
  };

  const setActive = (site) => {
    localStorage.setItem('ojt_active_site_id', site._id);
    setActiveSiteId(site._id);
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>Loading sites…</p>
    </div>
  );

  return (
    <div className="page-layout">
      <div style={{ marginTop: 32, marginBottom: 28 }}>
        <h1 className="heading" style={{ fontSize: 32, margin: '0 0 4px', letterSpacing: '-1px' }}>OJT Sites</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', margin: 0 }}>
          Geofence locations for on-site tracking. The active site is the one used on the Dashboard.
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#DC2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <p className="heading" style={{ fontSize: 15, margin: '0 0 16px' }}>{editing ? 'Edit Site' : 'Add Site'}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Site name, e.g. TechHub Offices" className="glass-input" required />
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address (optional)" className="glass-input" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude (-90 to 90)" className="glass-input" required />
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude (-180 to 180)" className="glass-input" required />
            <input type="number" min="1" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="Radius (m)" className="glass-input" required />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primary">{editing ? 'Save Changes' : 'Add Site'}</button>
            {editing && <button type="button" onClick={resetForm} className="btn-ghost">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
          <p className="heading" style={{ fontSize: 15, margin: 0 }}>{sites.length} site(s)</p>
        </div>
        {sites.length === 0 ? (
          <p style={{ padding: '32px 24px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>No sites yet. Add one above, or run the server seed.</p>
        ) : sites.map((site, i) => (
          <div key={site._id} style={{ padding: '14px 24px', borderBottom: i < sites.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14 }}>{site.name}</span>
                {activeSiteId === site._id && <span className="badge badge-green" style={{ fontSize: 10, padding: '1px 7px' }}>Active</span>}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                {site.address ? `${site.address} · ` : ''}{site.location.lat}, {site.location.lng} · {site.radius_meters || 150}m radius
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeSiteId !== site._id && (
                <button onClick={() => setActive(site)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Set Active</button>
              )}
              <button onClick={() => startEdit(site)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Edit</button>
              <button onClick={() => handleDelete(site)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, color: '#DC2626' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sites;
