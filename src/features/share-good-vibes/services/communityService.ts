/**
 * Canonical Domain Adapter: CommunityService
 * Re-routes all community and membership queries to canonical Domain 16 (d16_communities).
 */

import { communitiesDomain, CommunityCircle } from '@/domains/d16_communities';
import { Community } from '../types/shareGoodVibesTypes';

export const communityService = {
  async listCommunities(): Promise<Community[]> {
    const list = await communitiesDomain.listCommunities();
    return list as unknown as Community[];
  },

  async createCommunity(newCommunity: Omit<Community, 'id'>): Promise<Community> {
    const created = await communitiesDomain.createCommunity({
      name: newCommunity.name,
      handle: (newCommunity.name || 'circle').toLowerCase().replace(/\s+/g, '_'),
      emoji: newCommunity.emoji || '🌿',
      category: newCommunity.category || 'Culture',
      emotionalPillar: 'kindness',
      description: newCommunity.description || '',
      founderId: 'usr_hannibal_1337',
      founderName: 'hannibal',
      isPrivate: false,
      memberIds: ['usr_hannibal_1337']
    });
    return created as unknown as Community;
  },

  async listJoinedCommunities(userId: string): Promise<string[]> {
    return await communitiesDomain.listJoinedCommunities(userId);
  },

  async joinCommunity(userId: string, communityId: string): Promise<any> {
    return await communitiesDomain.joinCommunity(userId, communityId);
  },

  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    return await communitiesDomain.leaveCommunity(userId, communityId);
  }
};

export default communityService;

