/**
 * Domain 03: Social Graph & Orbits
 * Owns:
 * - Followers ("Echo": who tuned into your frequency)
 * - Following ("Orbit": who you are following)
 * - Mutes & Blocks
 */

export interface SocialProfile {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  bio: string;
  city: string;
  vibeScore: number;
  badge?: string;
  isFollowing?: boolean;
}

export interface SocialGraphState {
  orbitUserIds: string[]; // Following
  echoUserIds: string[];  // Followers
}

const STORAGE_KEY = 'vq_social_graph_v2';

const SEED_PROFILES: Record<string, SocialProfile> = {
  'user_yassine': {
    id: 'user_yassine',
    handle: 'yassine_medina',
    displayName: 'Yassine B.',
    avatar: '🦁',
    bio: 'Tunis Medina architect & historic coffee connoisseur',
    city: 'Tunis',
    vibeScore: 98,
    badge: 'Pro Guardian'
  },
  'user_sarah': {
    id: 'user_sarah',
    handle: 'sarah_carthage',
    displayName: 'Sarah K.',
    avatar: '🌸',
    bio: 'Carthage ruins photographer & sea cliff cyclist',
    city: 'Carthage',
    vibeScore: 94,
    badge: 'Local Legend'
  },
  'user_malek': {
    id: 'user_malek',
    handle: 'malek_sidibousaid',
    displayName: 'Malek D.',
    avatar: '☕',
    bio: 'Bambaloni seeker & acoustic jazz lover',
    city: 'Sidi Bou Said',
    vibeScore: 91,
    badge: 'Explorer'
  },
  'user_amina': {
    id: 'user_amina',
    handle: 'amina_marsa',
    displayName: 'Amina T.',
    avatar: '🌊',
    bio: 'Mediterranean swimmer, contemporary art curator',
    city: 'La Marsa',
    vibeScore: 89,
    badge: 'Vibe Creator'
  },
  'user_karim': {
    id: 'user_karim',
    handle: 'karim_elmenzah',
    displayName: 'Karim R.',
    avatar: '⚡',
    bio: 'Techno producer, street food navigator',
    city: 'Tunis',
    vibeScore: 86,
  }
};

class SocialGraphDomain {
  private following: Set<string> = new Set(['user_yassine', 'user_sarah']);
  private followers: Set<string> = new Set(['user_yassine', 'user_malek', 'user_amina']);
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SocialGraphState = JSON.parse(raw);
        this.following = new Set(parsed.orbitUserIds);
        this.followers = new Set(parsed.echoUserIds);
      }
    } catch {
      // defaults preserved
    }
  }

  private save() {
    try {
      const state: SocialGraphState = {
        orbitUserIds: Array.from(this.following),
        echoUserIds: Array.from(this.followers),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to persist social graph:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getProfile(userId: string): SocialProfile | undefined {
    return SEED_PROFILES[userId];
  }

  public getAllProfiles(): SocialProfile[] {
    return Object.values(SEED_PROFILES);
  }

  /**
   * "Echo": Users following you. Shows who is tuned into your frequency.
   * Action: "Follow Back" if you are not already following them.
   */
  public getEchoFollowers(): (SocialProfile & { isFollowedBack: boolean })[] {
    return Array.from(this.followers)
      .map((id) => SEED_PROFILES[id])
      .filter((p): p is SocialProfile => Boolean(p))
      .map((p) => ({
        ...p,
        isFollowedBack: this.following.has(p.id),
      }));
  }

  /**
   * "Orbit": Users you are actively following.
   */
  public getOrbitFollowing(): SocialProfile[] {
    return Array.from(this.following)
      .map((id) => SEED_PROFILES[id])
      .filter((p): p is SocialProfile => Boolean(p));
  }

  public isFollowing(userId: string): boolean {
    const clean = (userId || '').toLowerCase().replace(/^@/, '');
    if (this.following.has(userId) || this.following.has(clean) || this.following.has(`@${clean}`)) return true;
    for (const f of this.following) {
      if (f.toLowerCase().replace(/^@/, '') === clean) return true;
    }
    return false;
  }

  public follow(userId: string) {
    const clean = (userId || '').toLowerCase().replace(/^@/, '');
    this.following.add(clean);
    this.save();
  }

  public unfollow(userId: string) {
    const clean = (userId || '').toLowerCase().replace(/^@/, '');
    this.following.delete(clean);
    this.following.delete(userId);
    this.following.delete(`@${clean}`);
    this.save();
  }

  public getCounts() {
    return {
      echoCount: this.followers.size,
      orbitCount: this.following.size,
    };
  }

  // Compatibility methods for legacy callers
  public getFollowing(userId?: string): any[] {
    return this.getOrbitFollowing().map(p => ({
      id: p.id,
      username: p.handle,
      avatar: p.avatar,
      vibes: p.bio,
      interests: ['culture', 'travel', 'vibes'],
      isOnline: true
    }));
  }

  public getFollowers(userId?: string): any[] {
    return this.getEchoFollowers().map(p => ({
      id: p.id,
      username: p.handle,
      avatar: p.avatar,
      vibes: p.bio,
      interests: ['culture', 'travel', 'vibes'],
      isOnline: true
    }));
  }

  public getProfiles(): any[] {
    return this.getAllProfiles().map(p => ({
      id: p.id,
      username: p.handle,
      avatar: p.avatar,
      vibes: p.bio,
      interests: ['culture', 'travel', 'vibes'],
      isOnline: true
    }));
  }

  public followUser(userId: string, targetId: string): void {
    this.follow(targetId);
  }

  public unfollowUser(userId: string, targetId: string): void {
    this.unfollow(targetId);
  }

  public updateProfile(userId: string, updates: any): any {
    const existing = SEED_PROFILES[userId];
    if (existing) {
      Object.assign(existing, updates);
      this.save();
    }
    return existing;
  }
}

export const socialGraphDomain = new SocialGraphDomain();
export const socialGraphStore = socialGraphDomain;

