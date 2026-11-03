import { useState, useEffect } from 'react';

export interface Coords {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useDeviceLocation() {
  const [location, setLocation] = useState<Coords | null>(() => {
    try {
      const cached = localStorage.getItem('vq_device_location');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const onSuccess = (position: GeolocationPosition) => {
      if (!active) return;
      const coords: Coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setLocation(coords);
      setError(null);
      setLoading(false);
      try {
        localStorage.setItem('vq_device_location', JSON.stringify(coords));
      } catch (e) {}
    };

    const onError = (err: GeolocationPositionError) => {
      if (!active) return;
      console.warn("High-accuracy location failed/timeout, retrying with low-accuracy...", err);
      
      // Fallback: Low accuracy
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (fallbackErr) => {
          if (!active) return;
          console.warn("Low-accuracy location failed too, using defaults:", fallbackErr);
          setError(fallbackErr.message);
          setLoading(false);
          // Hard fallback coordinates (e.g., Paris/San Francisco coords) if browser geolocation block/fail
          const defaultCoords: Coords = { lat: 37.7749, lng: -122.4194, accuracy: 5000 };
          setLocation(defaultCoords);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });

    return () => {
      active = false;
    };
  }, []);

  return { location, error, loading };
}
