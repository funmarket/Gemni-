/**
 * Domain 16: Communities & Circles (D16)
 * Vibe Circles, discovery, creation, public/private membership,
 * founder bulletins, and live polls.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface CommunityCircle {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  category: string;
  emotionalPillar: 'love' | 'kindness' | 'help';
  description: string;
  founderId: string;
  founderName: string;
  districtAnchor?: string;
  isPrivate: boolean;
  memberIds: string[];
  pinnedBulletins: {
    id: string;
    text: string;
    pinnedAt: string;
  }[];
  createdAt: string;
}

const STORAGE_KEY = 'vq_communities_catalog_v1';
const MEMBERSHIP_STORAGE_KEY = 'vq_community_members_v1';

const DEFAULT_COMMUNITIES: CommunityCircle[] = [
  {
    id: 'comm_medina_artisans_01',
    name: 'Medina Roofs & Tea Collective',
    handle: 'medina_tea_co',
    emoji: '🍵',
    category: 'Culture',
    emotionalPillar: 'kindness',
    description: 'A neighborhood circle matching on tranquil sunset terraces, artisan leather goods, and sharing jasmine mint tea.',
    founderId: 'usr_hannibal_1337',
    founderName: 'hannibal',
    districtAnchor: 'Medina of Tunis',
    isPrivate: false,
    memberIds: ['usr_hannibal_1337', 'guardian_yassine_01'],
    pinnedBulletins: [
      { id: 'b_1', text: 'Weekly rooftop gathering every Thursday at Sunset near Bab Bhar!', pinnedAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'comm_carthage_sunset_02',
    name: 'Carthage Byrsa Sunset Seekers',
    handle: 'carthage_sunset',
    emoji: '🌅',
    category: 'Culture',
    emotionalPillar: 'love',
    description: 'Scouting secret sea view lookouts, ancient Byrsa citadel spots, and twilight acoustic vibes.',
    founderId: 'usr_sarah_carthage',
    founderName: 'sarah_carthage',
    districtAnchor: 'Carthage',
    isPrivate: false,
    memberIds: ['usr_sarah_carthage', 'usr_hannibal_1337'],
    pinnedBulletins: [
      { id: 'b_2', text: 'Next twilight acoustic chill: Friday 6 PM above the amphitheater.', pinnedAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'comm_sidi_bou_arts_03',
    name: 'Sidi Bou Blue White Creatives',
    handle: 'sidibou_arts',
    emoji: '🎨',
    category: 'Arts',
    emotionalPillar: 'help',
    description: 'Poets, illustrators, and musicians gathering at Café des Délices for collaborative jam sessions.',
    founderId: 'usr_hannibal_1337',
    founderName: 'hannibal',
    districtAnchor: 'Sidi Bou Said',
    isPrivate: false,
    memberIds: ['usr_hannibal_1337'],
    pinnedBulletins: [
      { id: 'b_3', text: 'Sketchbook swap and live oud accompaniment every Sunday morning.', pinnedAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

class CommunitiesDomain {
  private communities: CommunityCircle[] = [];
  private memberships: { id: string; user_id: string; community_id: string }[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
    this.syncFromSupabase();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.communities = raw ? JSON.parse(raw) : [...DEFAULT_COMMUNITIES];
      if (!raw) this.save();

      const memRaw = localStorage.getItem(MEMBERSHIP_STORAGE_KEY);
      this.memberships = memRaw ? JSON.parse(memRaw) : [
        { id: 'mem_1', user_id: 'usr_hannibal_1337', community_id: 'comm_medina_artisans_01' },
        { id: 'mem_2', user_id: 'usr_hannibal_1337', community_id: 'comm_carthage_sunset_02' }
      ];
    } catch {
      this.communities = [...DEFAULT_COMMUNITIES];
      this.memberships = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.communities));
      localStorage.setItem(MEMBERSHIP_STORAGE_KEY, JSON.stringify(this.memberships));
    } catch {}
  }

  private async syncFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('*');
      
      if (!error && Array.isArray(data) && data.length > 0) {
        this.memberships = data.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          community_id: m.community_id
        }));
        this.save();
        this.notify();
      }
    } catch (e) {
      console.warn('Supabase community_members initial sync skipped:', e);
    }
  }

  public getCommunities(): CommunityCircle[] {
    return this.communities;
  }

  public async listCommunities(): Promise<CommunityCircle[]> {
    return this.getCommunities();
  }

  public getCommunityById(id: string): CommunityCircle | null {
    return this.communities.find(c => c.id === id) || null;
  }

  public async createCommunity(
    data: Omit<CommunityCircle, 'id' | 'memberIds' | 'pinnedBulletins' | 'createdAt'> & { memberIds?: string[] }
  ): Promise<CommunityCircle> {
    const newComm: CommunityCircle = {
      ...data,
      id: `comm_${Date.now()}`,
      memberIds: data.memberIds || [data.founderId],
      pinnedBulletins: [],
      createdAt: new Date().toISOString()
    };
    this.communities.unshift(newComm);
    this.save();

    // Auto add membership for founder
    await this.joinCommunity(data.founderId, newComm.id);

    this.notify();
    return newComm;
  }

  public async listJoinedCommunities(userId: string): Promise<string[]> {
    const localJoined = this.memberships
      .filter(m => m.user_id === userId)
      .map(m => m.community_id);

    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId);

      if (!error && data) {
        const cloudJoined = data.map((d: any) => d.community_id);
        const merged = Array.from(new Set([...localJoined, ...cloudJoined]));
        return merged;
      }
    } catch {}

    return localJoined;
  }

  public async joinCommunity(userId: string, communityId: string): Promise<any> {
    const existingIndex = this.memberships.findIndex(
      m => m.user_id === userId && m.community_id === communityId
    );

    const memId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    if (existingIndex === -1) {
      this.memberships.push({
        id: memId,
        user_id: userId,
        community_id: communityId
      });
    }

    const comm = this.getCommunityById(communityId);
    if (comm && !comm.memberIds.includes(userId)) {
      comm.memberIds.push(userId);
    }

    this.save();
    this.notify();

    // Upsert to Supabase community_members table
    try {
      await supabase.from('community_members').upsert({
        id: memId,
        user_id: userId,
        community_id: communityId,
        role: 'member',
        joined_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not write community_members to Supabase:', e);
    }

    return { id: memId, userId, communityId };
  }

  public async leaveCommunity(userId: string, communityId: string): Promise<void> {
    this.memberships = this.memberships.filter(
      m => !(m.user_id === userId && m.community_id === communityId)
    );

    const comm = this.getCommunityById(communityId);
    if (comm) {
      comm.memberIds = comm.memberIds.filter(id => id !== userId);
    }

    this.save();
    this.notify();

    try {
      await supabase
        .from('community_members')
        .delete()
        .match({ user_id: userId, community_id: communityId });
    } catch (e) {
      console.warn('Could not delete from Supabase community_members:', e);
    }
  }

  public async toggleJoin(communityId: string, memberId: string): Promise<boolean> {
    const joined = await this.listJoinedCommunities(memberId);
    if (joined.includes(communityId)) {
      await this.leaveCommunity(memberId, communityId);
      return false;
    } else {
      await this.joinCommunity(memberId, communityId);
      return true;
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    cb();
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const communitiesDomain = new CommunitiesDomain();
export default communitiesDomain;

