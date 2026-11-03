/**
 * Calculate the geodetic distance between two coordinates using the Haversine formula.
 * Returns the distance in kilometers.
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
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
};

/**
 * Checks if user is within the required range (e.g. 200m) of target coordinates.
 */
export const isWithinRange = (lat1: number, lon1: number, lat2: number, lon2: number, maxRangeMeters: number = 200): boolean => {
  const distanceKm = getDistance(lat1, lon1, lat2, lon2);
  return distanceKm * 1000 <= maxRangeMeters;
};
