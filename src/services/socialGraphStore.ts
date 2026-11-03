/**
 * Legacy Service Adapter: SocialGraphStore
 * Re-routes all social graph calls directly to canonical Domain 03 (d03_social_graph).
 */

export * from '@/domains/d03_social_graph';
import { socialGraphDomain } from '@/domains/d03_social_graph';
export const socialGraphStore = socialGraphDomain;
export default socialGraphDomain;
