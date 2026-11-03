/**
 * Canonical Domain Adapter: VibeStreamService
 * Re-routes all custom post operations directly to canonical Domain 12 (socialContentDomain).
 */

import { socialContentDomain } from '@/domains/d12_social_content';

export const vibeStreamService = {
  getCustomPosts(): any[] {
    return socialContentDomain.getCustomPosts();
  },

  saveCustomPost(hfPost: any): void {
    socialContentDomain.saveCustomPost(hfPost);
  },

  deleteCustomPost(id: string): void {
    socialContentDomain.deleteCustomPost(id);
  },

  editCustomPost(id: string, text: string): void {
    socialContentDomain.editCustomPost(id, text);
  }
};

export default vibeStreamService;

