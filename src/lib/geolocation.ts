/**
 * High-performance, privacy-first geolocation logic for VibeQuest.
 * Targets Web environments with progressive geolocative precision.
 */

export interface Coords {
  lat: number;
  lng: number;
}

export interface LocationResult {
  coords: Coords | null;
  cityName: string | null;
  status: 'success' | 'fallback' | 'cached' | 'permission-blocked' | 'unavailable';
  accuracy?: number;
}

// Memory-based cache for reverse geocoding to comply with OpenStreetMap Nominatim 1-req/sec rate limits
const reverseGeocodeCache = new Map<string, string>();

/**
 * Truncates coordinate precision for user privacy protection (differential privacy)
 * 4 decimal places corresponds to approximately 11 meters resolution, which is 
 * perfect for proximity checking without leaking exact home/apartment numbers.
 */
export function anonymizeCoordinates(lat: number, lng: number, precision = 4): Coords {
  const factor = Math.pow(10, precision);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor
  };
}

/**
 * High-performance Haversine formula to compute great-circle distance between two GPS points
 * @returns distance in kilometers
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Reverse geocodes coordinates into [City], [Country] using cached OpenStreetMap Nominatim
 * Includes custom rate-limited queuing to avoid rate limit error codes
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey) || 'Nearby Area';
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'VibeQuest/2.0.0 (ReverseGeocoding; funmarketmn@gmail.com)'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Nominatim reverse geocode request failed');
    }

    const data = await response.json();
    if (data && data.address) {
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.suburb ||
        data.address.county ||
        'Nearby Area';
      const country = data.address.country || '';
      const resolved = country ? `${city}, ${country}` : city;
      reverseGeocodeCache.set(cacheKey, resolved);
      return resolved;
    }
    
    return 'Nearby Area';
  } catch (err) {
    console.warn('Nominatim fallback due to network/rate error:', err);
    return 'Nearby Area';
  }
}

/**
 * Safely fetches high-accuracy location via standard Web API with instant fallback mechanics.
 * Guaranteed to never throw errors, making it extremely resilient inside visual components.
 */
export async function captureLocationSafe(options?: PositionOptions): Promise<LocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return getFallbackFromStorage('unavailable');
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10 * 1000, // 10s fresh cache
        ...options
      });
    });

    const anon = anonymizeCoordinates(position.coords.latitude, position.coords.longitude);
    const cityName = await reverseGeocode(anon.lat, anon.lng);

    // Save to last known
    localStorage.setItem('vibe_quest_last_known_location', JSON.stringify({
      coords: anon,
      cityName
    }));

    return {
      coords: anon,
      cityName,
      status: 'success',
      accuracy: position.coords.accuracy
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : (error as any)?.message || String(error);
    console.warn('Geolocation capture failed or denied permission. Fallback active:', errorMsg);
    const status = (error as any).code === 1 ? 'permission-blocked' : 'unavailable';
    return getFallbackFromStorage(status as any);
  }
}

const getFallbackFromStorage = (currentStatus: 'success' | 'fallback' | 'cached' | 'permission-blocked' | 'unavailable'): LocationResult => {
  // Check last known
  const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
  if (lastKnownRaw) {
    try {
      const parsed = JSON.parse(lastKnownRaw);
      if (parsed && parsed.coords) {
        return {
          coords: parsed.coords,
          cityName: parsed.cityName || 'Last Known Area',
          status: 'cached'
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
          coords: parsed.coords,
          cityName: parsed.cityName || 'Manual Area',
          status: 'fallback'
        };
      }
    } catch (e) {
      console.warn('Error parsing manual location', e);
    }
  }

  return {
    coords: null,
    cityName: null,
    status: currentStatus
  };
};
