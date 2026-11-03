import { getDistanceInKm } from '@/shared/utils/distance';

export const calculateGeoDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  return getDistanceInKm(lat1, lon1, lat2, lon2);
};
