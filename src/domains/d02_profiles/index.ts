/**
 * Domain 02: Profiles & Personal Preferences (D02)
 * Manages photo-first user presentation, custom interests, Cozy Diary completion-assist,
 * languages, and privacy preferences.
 */

export interface UserFullProfile {
  memberId: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  photos: string[];
  interests: string[];
  languages: string[];
  city: string;
  neighborhood: string;
  contactChannels: {
    telegramHandle?: string;
    xHandle?: string;
    isPublic: boolean;
  };
  cozyDiaryMode: boolean; // Opt-in completion assist mode (PRO-002)
  polarRomanceOptIn: boolean; // 18+ adult romance matching preference
  culturalPassport: {
    savedTrailIds: string[];
    visitedPlaceIds: string[];
    earnedBadgeIds: string[];
  };
  updatedAt: string;
}

const STORAGE_KEY = 'vq_profiles_full_v1';

const DEFAULT_PROFILES: Record<string, UserFullProfile> = {
  usr_hannibal_1337: {
    memberId: 'usr_hannibal_1337',
    handle: 'hannibal',
    displayName: 'Hannibal',
    bio: 'Urban explorer, heritage archivist, and nocturnal espresso seeker.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Heritage Trails', 'Vinyl & Jazz', 'Specialty Coffee', 'Medina Architecture'],
    languages: ['Arabic', 'French', 'English'],
    city: 'Tunis',
    neighborhood: 'Medina / Sidi Bou Said',
    contactChannels: {
      telegramHandle: 'hannibal_vq',
      isPublic: false
    },
    cozyDiaryMode: false,
    polarRomanceOptIn: false,
    culturalPassport: {
      savedTrailIds: ['trail_tunis_medina_01'],
      visitedPlaceIds: ['place_medina_tunis', 'place_carthage_baths'],
      earnedBadgeIds: ['badge_cartographer', 'badge_first_handshake']
    },
    updatedAt: new Date().toISOString()
  }
};

class ProfilesDomain {
  private profiles: Record<string, UserFullProfile> = {};
  private listeners: Set<(profiles: Record<string, UserFullProfile>) => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.profiles = raw ? JSON.parse(raw) : { ...DEFAULT_PROFILES };
      if (!raw) this.save();
    } catch {
      this.profiles = { ...DEFAULT_PROFILES };
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    } catch {
      // Storage unavailable
    }
  }

  public getProfile(memberId: string): UserFullProfile | null {
    return this.profiles[memberId] || null;
  }

  public updateProfile(
    memberId: string, 
    updates: Partial<Omit<UserFullProfile, 'memberId' | 'updatedAt'>>
  ): UserFullProfile {
    const existing = this.profiles[memberId] || {
      memberId,
      handle: 'explorer',
      displayName: 'Explorer',
      bio: '',
      avatarUrl: '',
      photos: [],
      interests: [],
      languages: ['English'],
      city: 'Local',
      neighborhood: 'Downtown',
      contactChannels: { isPublic: false },
      cozyDiaryMode: false,
      polarRomanceOptIn: false,
      culturalPassport: { savedTrailIds: [], visitedPlaceIds: [], earnedBadgeIds: [] },
      updatedAt: new Date().toISOString()
    };

    // PRO-002: If Cozy Diary Mode is enabled, require bio, broad location, and contact handles before saving
    if (updates.cozyDiaryMode || (existing.cozyDiaryMode && updates.cozyDiaryMode !== false)) {
      const bio = updates.bio ?? existing.bio;
      const city = updates.city ?? existing.city;
      const contacts = updates.contactChannels ?? existing.contactChannels;
      if (!bio.trim() || !city.trim() || (!contacts.telegramHandle && !contacts.xHandle)) {
        throw new Error('Cozy Diary Mode requires a bio, location, and configured contact handle before saving.');
      }
    }

    const updated: UserFullProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.profiles[memberId] = updated;
    this.save();
    this.notify();
    return updated;
  }

  public toggleSavedTrail(memberId: string, trailId: string): boolean {
    const profile = this.getProfile(memberId);
    if (!profile) return false;
    const exists = profile.culturalPassport.savedTrailIds.includes(trailId);
    if (exists) {
      profile.culturalPassport.savedTrailIds = profile.culturalPassport.savedTrailIds.filter(id => id !== trailId);
    } else {
      profile.culturalPassport.savedTrailIds.push(trailId);
    }
    this.save();
    this.notify();
    return !exists;
  }

  public subscribe(cb: (profiles: Record<string, UserFullProfile>) => void): () => void {
    this.listeners.add(cb);
    cb(this.profiles);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.profiles));
  }
}

export const profilesDomain = new ProfilesDomain();
