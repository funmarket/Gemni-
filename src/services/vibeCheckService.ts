/**
 * Legacy Service Adapter: VibeCheckService
 * Re-routes all vibe check requests directly to canonical Domain 18 (d18_challenges).
 */

export * from '@/domains/d18_challenges';
import { challengesDomain } from '@/domains/d18_challenges';
export const vibeCheckService = challengesDomain;
export default challengesDomain;
