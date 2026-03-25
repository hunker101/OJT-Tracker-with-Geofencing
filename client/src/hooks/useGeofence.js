import { useState, useEffect } from 'react';
import { getDistance } from '../utils/haversine';
import { clockIn, clockOut } from '../services/api';

export const useGeofence = (site) => {
  const [location, setLocation] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [session, setSession] = useState(null); // 'AM' or 'PM'
  const [activeLogId, setActiveLogId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!site || !site.location) return;

    const determineSession = () => {
        const hour = new Date().getHours();
        // 7AM to 12PM is AM session
        if (hour >= 6 && hour < 12) return 'AM';
        // 1PM to 6PM is PM session
        if (hour >= 12 && hour < 18) return 'PM';
        return null;
    };

    const handleSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lng: longitude });

      const distance = getDistance(
        latitude,
        longitude,
        site.location.lat,
        site.location.lng
      );

      const currentlyInside = distance <= site.radius_meters;
      const currentSession = determineSession();
      setSession(currentSession);

      // Transition Logics
      if (currentlyInside && !isInside && currentSession) {
         // Entered Geofence! Try to clock in.
         try {
            const log = await clockIn({
                siteId: site._id,
                workMode: 'onsite',
                session: currentSession,
                location: { lat: latitude, lng: longitude },
                method: 'auto'
            });
            setActiveLogId(log._id);
         } catch(err) {
            console.error('Clock-in failed (might already be clocked in/out for session)', err.response?.data?.message);
         }
      } 
      
      if (!currentlyInside && isInside && activeLogId) {
         // Exited Geofence! Try to clock out.
         try {
             await clockOut(activeLogId);
             setActiveLogId(null);
         } catch(err) {
             console.error('Clock-out failed', err.response?.data?.message);
         }
      }

      setIsInside(currentlyInside);
    };

    const handleError = (error) => {
      setError(error.message);
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [site, isInside, activeLogId]);

  return { location, isInside, session, error };
};
