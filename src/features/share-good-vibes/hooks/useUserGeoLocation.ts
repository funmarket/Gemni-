import { useState, useEffect } from 'react';
import { getDevicePosition } from '@/shared/services/device/geolocation';

export const useUserGeoLocation = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pos = await getDevicePosition();
      setLatitude(pos.latitude);
      setLongitude(pos.longitude);
    } catch (err: any) {
      console.warn("Could not get initial user position:", err);
      setError(err.message || 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosition();
  }, []);

  return {
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    isLoading,
    error,
    refetchPosition: fetchPosition
  };
};
