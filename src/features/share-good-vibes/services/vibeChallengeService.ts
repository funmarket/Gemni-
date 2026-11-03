/**
 * Legacy Service Adapter: VibeChallengeService
 * Re-routes all challenge interactions directly to canonical Domain 18 (d18_challenges).
 */

export * from '@/domains/d18_challenges';
import { challengesDomain } from '@/domains/d18_challenges';
export const vibeChallengeService = challengesDomain;
export default challengesDomain;
