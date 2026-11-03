/**
 * Legacy Service Adapter: SocialFeedService
 * Re-routes all social feed calls directly to canonical Domain 12 (d12_social_content).
 */

export * from '@/domains/d12_social_content';
import { socialContentDomain } from '@/domains/d12_social_content';
export const socialFeedService = socialContentDomain;
export default socialContentDomain;
