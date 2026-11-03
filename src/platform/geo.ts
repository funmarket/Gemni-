/**
 * Platform Adapter for Geolocation Services.
 * Dynamically switches between Native Geolocation and Web Geolocation based on shell environment.
 */

import { captureLocationSafe, fallbackCoords, anonymizeCoordinates, reverseGeocode, LocationResult } from '../lib/geolocation';

// Safe checking for Capacitor native platform shell
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  // @ts-ignore
  return !!(window.Capacitor?.isNativePlatform && window.Capacitor.isNativePlatform());
}

/**
 * Platform-agnostic unified caller to fetch the user's current coordinates.
 * Falls back to high-grade browser or default fallback coordinates if denied.
 */
export async function getCurrentDeviceLocation(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}): Promise<LocationResult> {
  const finalOptions = {
    enableHighAccuracy: true,
    timeout: 6000,
    maximumAge: 5000,
    ...options
  };

  if (!isNativePlatform()) {
    // Run Web Core System
    return captureLocationSafe(finalOptions);
  }

  // Running in Native Capacitor/React Native shell
  try {
    // @ts-ignore
    const Capacitor = window.Capacitor;
    if (Capacitor && Capacitor.Plugins && Capacitor.Plugins.Geolocation) {
      const position = await Capacitor.Plugins.Geolocation.getCurrentPosition({
        enableHighAccuracy: finalOptions.enableHighAccuracy,
        timeout: finalOptions.timeout
      });

      if (position && position.coords) {
        const anon = anonymizeCoordinates(position.coords.latitude, position.coords.longitude);
        const name = await reverseGeocode(anon.lat, anon.lng);
        return {
          coords: anon,
          cityName: name,
          status: 'success',
          accuracy: position.coords.accuracy
        };
      }
    }

    // Fallback if plugin is not initialized in the window object yet
    const webResult = await captureLocationSafe(finalOptions);
    return webResult;
  } catch (err) {
    console.warn('Native GPS plugin failed, falling back to safe Web API:', err);
    return captureLocationSafe(finalOptions);
  }
}
