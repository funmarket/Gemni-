/**
 * Domain 04: Geolocation & Spatial Proximity
 * Authoritative GPS math, distance calculations, and proximity proofs.
 */

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

/**
 * Great-circle distance between two points on a sphere (Haversine formula in meters)
 */
export function calculateHaversineDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Standard preset calibrations for seamless testing and demonstration
 */
export const CALIBRATION_CITIES: Record<string, GeoCoordinate & { name: string }> = {
  tunis: {
    name: 'Tunis, Tunisia',
    latitude: 36.7992,
    longitude: 10.1695,
  },
  sidibousaid: {
    name: 'Sidi Bou Said',
    latitude: 36.8705,
    longitude: 10.3418,
  },
  carthage: {
    name: 'Carthage',
    latitude: 36.8530,
    longitude: 10.3235,
  },
  sanfrancisco: {
    name: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
  }
};

class GeoPresenceDomain {
  private currentPosition: GeoCoordinate = { ...CALIBRATION_CITIES.tunis };
  private cityName: string = 'Tunis';
  private isUsingDeviceGps: boolean = false;
  private watchId: number | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initGps();
  }

  private initGps() {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracyMeters: pos.coords.accuracy,
          };
          this.isUsingDeviceGps = true;
          this.notify();
        },
        () => {
          // Fallback to Tunis calibration without breaking
          this.currentPosition = { ...CALIBRATION_CITIES.tunis };
          this.notify();
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getPosition(): GeoCoordinate {
    return { ...this.currentPosition };
  }

  public getCityName(): string {
    return this.cityName;
  }

  public isLiveDeviceGps(): boolean {
    return this.isUsingDeviceGps;
  }

  public setCalibrationCity(cityKey: keyof typeof CALIBRATION_CITIES) {
    const target = CALIBRATION_CITIES[cityKey];
    if (target) {
      this.currentPosition = {
        latitude: target.latitude,
        longitude: target.longitude,
        accuracyMeters: 10,
      };
      this.cityName = target.name.split(',')[0];
      this.isUsingDeviceGps = false;
      this.notify();
    }
  }

  public setCustomCoordinates(lat: number, lon: number, cityName?: string) {
    this.currentPosition = { latitude: lat, longitude: lon, accuracyMeters: 15 };
    if (cityName) this.cityName = cityName;
    this.notify();
  }

  public isWithinRadius(targetCoord: GeoCoordinate, maxDistanceMeters: number = 150): boolean {
    const dist = calculateHaversineDistance(this.currentPosition, targetCoord);
    return dist <= maxDistanceMeters;
  }

  public getDistanceTo(targetCoord: GeoCoordinate): number {
    return calculateHaversineDistance(this.currentPosition, targetCoord);
  }
}

export const geoPresenceDomain = new GeoPresenceDomain();
