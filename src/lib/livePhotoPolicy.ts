import { calculateHaversineDistance, Coords } from './geolocation';

export interface PhotoVerificationResult {
  isVerified: boolean;
  distanceMeter: number;
  reason?: string;
}

/**
 * Validates a captured live snapshot verification against a target coordinates destination.
 * For in-person gamification verification, the user must be within a required threshold radius (e.g. 150 meters).
 */
export function verifyPhotoProximity(
  photoCoords: Coords,
  targetCoords: Coords,
  allowedRadiusMeters = 150
): PhotoVerificationResult {
  const distanceKm = calculateHaversineDistance(
    photoCoords.lat,
    photoCoords.lng,
    targetCoords.lat,
    targetCoords.lng
  );
  
  const distanceMeter = Math.round(distanceKm * 1000);
  
  if (distanceMeter <= allowedRadiusMeters) {
    return {
      isVerified: true,
      distanceMeter,
      reason: `Verified proximity: device is ${distanceMeter}m away from the venue center.`
    };
  }
  
  return {
    isVerified: false,
    distanceMeter,
    reason: `Too far from venue. Current position is ${distanceMeter}m away, exceeds allowed ${allowedRadiusMeters}m limit.`
  };
}
