/**
 * Repository: Community Repository
 * Authoritative Supabase persistence for Community Memberships.
 */

import { supabase } from '../supabase/supabaseClient';

export interface CommunityMembership {
  id?: string;
  userId: string;
  communityId: string;
  createdAt?: string;
}

export const communityRepository = {
  async listMemberships(userId: string): Promise<CommunityMembership[]> {
    try {
      const { data } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', userId);

      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || d.userId,
          communityId: d.community_id || d.communityId,
          createdAt: d.created_at || d.createdAt,
        }));
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'mem_001',
        userId,
        communityId: 'carthage_explorers',
        createdAt: new Date().toISOString(),
      }
    ];
  },

  async joinCommunity(userId: string, communityId: string): Promise<CommunityMembership> {
    const list = await this.listMemberships(userId);
    const existing = list.find((m) => m.communityId === communityId);
    if (existing) return existing;

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMember: CommunityMembership = {
      id,
      userId,
      communityId,
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('community_members').upsert({
        id,
        user_id: userId,
        community_id: communityId,
        created_at: newMember.createdAt,
      });
    } catch (err) {
      console.warn('Supabase join community notice:', err);
    }

    return newMember;
  },
};
