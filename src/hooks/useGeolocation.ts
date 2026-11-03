import { useSharedGeolocation } from '../lib/GeolocationProvider';

/**
 * Standardized plug-and-play hook to fetch current geolocation, proximity accuracy and address labels.
 * Consumes the global GeolocationProvider to ensure single battery-efficient background listener.
 */
export function useGeolocation() {
  const { coords, cityName, accuracy, permissionStatus, isLoading, refreshLocation, locationSource, setManualLocation, clearLocation } = useSharedGeolocation();
  
  return {
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    cityName,
    accuracy,
    isPermissionGranted: permissionStatus === 'granted',
    isPermissionDenied: permissionStatus === 'denied',
    isLoading,
    refresh: refreshLocation,
    locationSource,
    setManualLocation,
    clearLocation
  };
}
