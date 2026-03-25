import React, { useEffect } from 'react';
import { useGeofence } from '../hooks/useGeofence';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const OnSiteView = ({ site }) => {
  const { location, isInside, session, error } = useGeofence(site);

  if (!site) return <div className="p-4 bg-white rounded-lg shadow">Loading site data...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-blue-800">📍 On-Site Tracker</h2>
        {isInside ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Inside Zone
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
            Outside Zone
          </span>
        )}
      </div>

      <div className="h-64 bg-gray-100 relative">
        {site.location && (
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
              {/* Geofence boundary */}
              <Circle
                center={[site.location.lat, site.location.lng]}
                pathOptions={{ fillColor: 'blue', color: 'blue', weight: 1 }}
                radius={site.radius_meters || 150}
              />
              
              {/* User location marker */}
              {location && (
                <Marker position={[location.lat, location.lng]}>
                  <Popup>You are here</Popup>
                </Marker>
              )}
            </MapContainer>
        )}
      </div>

      <div className="p-4">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <p>Location: {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Detecting...'}</p>
          <p>Session: <span className="font-semibold text-gray-800">{session || 'Off Hours'}</span> (Auto clock-in active for AM/PM)</p>
        </div>
      </div>
    </div>
  );
};

export default OnSiteView;
