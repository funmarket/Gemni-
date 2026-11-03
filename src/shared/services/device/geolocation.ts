/**
 * Shared high-reliability Geolocation service
 * Safely wraps browser geolocation APIs, exposes a clean permission model,
 * and fails gracefully to default fallback coordinates.
 */

export type DeviceLocationStatus = 'gps-active' | 'permission-blocked' | 'manual-area' | 'last-known' | 'unavailable';

export interface GeolocationPositionData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  status: DeviceLocationStatus;
  cityName?: string | null;
}

/**
 * High-performance, safe GPS position getter.
 * Follows strict priority order without hardcoded fallback cities.
 */
export const getDevicePosition = async (options?: PositionOptions): Promise<GeolocationPositionData> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return getFallbackFromStorage('unavailable');
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy || 15;
        
        // Reverse geocode to get city name
        let cityName = 'Nearby Area';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'VibeQuest/2.0.0 (ReverseGeocoding; funmarketmn@gmail.com)'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              cityName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || 'Nearby Area';
            }
          }
        } catch (e) {
          console.warn('Reverse geocode failed during getDevicePosition', e);
        }

        const resolvedPos: GeolocationPositionData = {
          latitude,
          longitude,
          accuracy,
          status: 'gps-active',
          cityName
        };

        // Save to last known
        localStorage.setItem('vibe_quest_last_known_location', JSON.stringify({
          coords: { lat: latitude, lng: longitude },
          cityName
        }));

        resolve(resolvedPos);
      },
      (error) => {
        const errorMsg = error?.message || String(error);
        console.warn('Geolocation capture failed:', errorMsg);
        const status: DeviceLocationStatus = error.code === error.PERMISSION_DENIED ? 'permission-blocked' : 'unavailable';
        resolve(getFallbackFromStorage(status));
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5000,
        ...options
      }
    );
  });
};

const getFallbackFromStorage = (currentStatus: DeviceLocationStatus): GeolocationPositionData => {
  // Check last known
  const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
  if (lastKnownRaw) {
    try {
      const parsed = JSON.parse(lastKnownRaw);
      if (parsed && parsed.coords) {
        return {
          latitude: parsed.coords.lat,
          longitude: parsed.coords.lng,
          accuracy: 50,
          status: 'last-known',
          cityName: parsed.cityName || 'Last Known Area'
        };
      }
    } catch (e) {
      console.warn('Error parsing last known location', e);
    }
  }

  // Check manual area
  const manualRaw = localStorage.getItem('vibe_quest_manual_location');
  if (manualRaw) {
    try {
      const parsed = JSON.parse(manualRaw);
      if (parsed && parsed.coords) {
        return {
          latitude: parsed.coords.lat,
          longitude: parsed.coords.lng,
          accuracy: 100,
          status: 'manual-area',
          cityName: parsed.cityName || 'Manual Area'
        };
      }
    } catch (e) {
      console.warn('Error parsing manual location', e);
    }
  }

  return {
    latitude: null,
    longitude: null,
    accuracy: null,
    status: currentStatus,
    cityName: null
  };
};

/**
 * Safe permissions query check
 */
export const queryLocationPermission = async (): Promise<DeviceLocationStatus> => {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'unavailable';
  }

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    if (status.state === 'granted') return 'gps-active';
    if (status.state === 'denied') return 'permission-blocked';
    return 'unavailable';
  } catch {
    return 'unavailable';
  }
};
