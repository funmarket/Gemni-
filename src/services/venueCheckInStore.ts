/**
 * Legacy Service Adapter: VenueCheckInStore
 * Re-routes all venue check-in calls directly to canonical Domain 05 (d05_places).
 */

export * from '@/domains/d05_places';
import { placesDomain } from '@/domains/d05_places';
export const venueCheckInStore = placesDomain;
export default placesDomain;
