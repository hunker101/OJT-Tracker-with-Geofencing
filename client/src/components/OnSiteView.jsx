import React from 'react';
import { useGeofence } from '../hooks/useGeofence';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OnSiteView = ({ site, activeLogId }) => {
  const { location, isInside, session, error } = useGeofence(site, activeLogId);

  if (!site) return (
    <div className="glass-card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', marginBottom: 20 }}>
      <div className="spinner" style={{ margin: '0 auto 12px' }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, margin: 0 }}>Loading site data...</p>
    </div>
  );

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
            background: 'linear-gradient(135deg, #60B1FF, #0084FF)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,132,255,0.3)',
          }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <p className="heading" style={{ fontSize: 15, margin: 0 }}>On-Site Tracker</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{site?.name || 'OJT Company'}</p>
          </div>
        </div>

        {isInside ? (
          <span className="badge badge-green" style={{ gap: 6 }}>
            <span className="pulse-dot" />
            Inside Zone
          </span>
        ) : (
          <span className="badge" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.06)' }}>
            Outside Zone
          </span>
        )}
      </div>

      {/* Map */}
      <div style={{ height: 260, position: 'relative' }}>
        {site?.location && (
          <MapContainer
            center={[site.location.lat, site.location.lng]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <Circle
              center={[site.location.lat, site.location.lng]}
              pathOptions={{ fillColor: '#0084FF', fillOpacity: 0.1, color: '#0084FF', weight: 2 }}
              radius={site.radius_meters || 150}
            />
            {location && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {error && <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#EF4444' }}>{error}</span>}
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
          GPS: <strong style={{ color: 'var(--text-primary)' }}>{location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Detecting...'}</strong>
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
          Session: <span className="badge badge-blue" style={{ fontSize: 11, padding: '2px 8px' }}>{session || 'Off Hours'}</span>
        </span>
      </div>
    </div>
  );
};

export default OnSiteView;
