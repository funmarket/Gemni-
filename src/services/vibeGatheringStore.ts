/**
 * Legacy Service Adapter: VibeGatheringStore
 * Re-routes all pop-up gathering calls directly to canonical Domain 10 (d10_activities).
 */

export * from '@/domains/d10_activities';
import { activitiesDomain } from '@/domains/d10_activities';
export const vibeGatheringStore = activitiesDomain;
export default activitiesDomain;
