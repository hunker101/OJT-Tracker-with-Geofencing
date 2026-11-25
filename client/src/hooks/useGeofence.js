import { useState, useEffect, useRef } from 'react';
import { getDistance } from '../utils/haversine';
import { clockIn, clockOut } from '../services/api';

// useGeofence(site, initialActiveLogId)
// Watches GPS, auto clock-in on entering the geofence and auto clock-out
// on leaving it. initialActiveLogId is today's open log fetched from
// GET /api/attendance/active, so auto clock-out still works after a
// page refresh (previously the active id lived only in memory).
// Mutable state used inside the watch callback is kept in refs, so the
// watchPosition effect is set up once per site instead of being
// recreated on every isInside / activeLogId change.
export const useGeofence = (site, initialActiveLogId) => {
  const [location, setLocation] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [session, setSession] = useState(null); // 'AM' or 'PM'
  const [activeLogId, setActiveLogId] = useState(initialActiveLogId || null);
  const [error, setError] = useState(null);

  const isInsideRef = useRef(false);
  const activeLogIdRef = useRef(initialActiveLogId || null);
  const siteRef = useRef(site);

  // Keep refs in sync when the props / state change
  useEffect(() => {
    siteRef.current = site;
  }, [site]);

  useEffect(() => {
    if (initialActiveLogId) {
      activeLogIdRef.current = initialActiveLogId;
      setActiveLogId(initialActiveLogId);
    }
  }, [initialActiveLogId]);

  useEffect(() => {
    const currentSite = siteRef.current;
    if (!currentSite || !currentSite.location) return;

    const determineSession = () => {
        const hour = new Date().getHours();
        // 6AM to 12PM is AM session
        if (hour >= 6 && hour < 12) return 'AM';
        // 12PM to 6PM is PM session
        if (hour >= 12 && hour < 18) return 'PM';
        return null;
    };

    const handleSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });

      const siteNow = siteRef.current;
      if (!siteNow || !siteNow.location) return;

      const distance = getDistance(
        latitude,
        longitude,
        siteNow.location.lat,
        siteNow.location.lng
      );

      const currentlyInside = distance <= (siteNow.radius_meters || 150);
      const currentSession = determineSession();
      setSession(currentSession);

      // Transition logic, using refs so a stale closure cannot
      // clock in twice or lose the active log id.
      if (currentlyInside && !isInsideRef.current && currentSession) {
         // Entered Geofence! Try to clock in.
         try {
            const log = await clockIn({
                siteId: siteNow._id,
                workMode: 'onsite',
                session: currentSession,
                location: { lat: latitude, lng: longitude },
                method: 'auto'
            });
            activeLogIdRef.current = log._id;
            setActiveLogId(log._id);
         } catch(err) {
            console.error('Clock-in failed (might already be clocked in/out for session)', err.response?.data?.message || err.response?.data?.error);
         }
      }

      if (!currentlyInside && isInsideRef.current && activeLogIdRef.current) {
         // Exited Geofence! Try to clock out.
         try {
             await clockOut(activeLogIdRef.current);
             activeLogIdRef.current = null;
             setActiveLogId(null);
         } catch(err) {
             console.error('Clock-out failed', err.response?.data?.message || err.response?.data?.error);
         }
      }

      isInsideRef.current = currentlyInside;
      setIsInside(currentlyInside);
    };

    const handleError = (err) => {
      setError(err.message);
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    // Deliberately only depends on the site id: refs carry the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?._id]);

  return { location, isInside, session, error, activeLogId };
};
