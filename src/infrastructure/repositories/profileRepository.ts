/**
 * Repository: Profile Repository (Domain 01 Identity & Domain 02 Profiles)
 * Supabase persistence with cascading proximity math.
 */

import { supabase } from '../supabase/supabaseClient';
import { calculateHaversineDistance } from '../../lib/geolocation';

export interface Profile {
  id?: string;
  handle: string;
  displayName?: string;
  photoUrl?: string;
  points?: number;
  streaks?: number;
  accountType?: string;
  culturalPassport?: string[];
  lastActive?: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
}

const SEED_PROFILES: Profile[] = [
  {
    id: 'user_yassine',
    handle: 'yassine_medina',
    displayName: 'Yassine B.',
    accountType: 'pro',
    points: 1850,
    streaks: 14,
    culturalPassport: ['Tunis Medina', 'Souk des Chéchias'],
    latitude: 36.7995,
    longitude: 10.1689,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_sarah',
    handle: 'sarah_carthage',
    displayName: 'Sarah K.',
    accountType: 'pro',
    points: 1420,
    streaks: 9,
    culturalPassport: ['Carthage', 'Byrsa Hill'],
    latitude: 36.8535,
    longitude: 10.3320,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_malek',
    handle: 'malek_sidibousaid',
    displayName: 'Malek D.',
    accountType: 'vibe',
    points: 980,
    streaks: 7,
    culturalPassport: ['Sidi Bou Said', 'Café des Nattes'],
    latitude: 36.8708,
    longitude: 10.3422,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_amina',
    handle: 'amina_marsa',
    displayName: 'Amina T.',
    accountType: 'vibe',
    points: 750,
    streaks: 4,
    culturalPassport: ['La Marsa Corniche'],
    latitude: 36.8790,
    longitude: 10.3270,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const profileRepository = {
  async getById(id: string): Promise<Profile | null> {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (data) {
        return {
          id: data.id,
          handle: data.handle,
          displayName: data.display_name || data.displayName,
          photoUrl: data.photo_url || data.photoUrl,
          points: Number(data.points || 0),
          streaks: Number(data.streaks || 0),
          accountType: data.account_type || data.accountType,
          culturalPassport: data.cultural_passport || data.culturalPassport,
          latitude: data.latitude,
          longitude: data.longitude,
          lastActive: data.last_active || data.lastActive,
          createdAt: data.created_at || data.createdAt,
        };
      }
    } catch {
      // fallback
    }
    return SEED_PROFILES.find(p => p.id === id) || null;
  },

  async getByHandle(handle: string): Promise<Profile | null> {
    const trimmed = handle.toLowerCase().replace(/^@/, '').trim();
    try {
      const { data } = await supabase.from('profiles').select('*').ilike('handle', trimmed).maybeSingle();
      if (data) {
        return {
          id: data.id,
          handle: data.handle,
          displayName: data.display_name || data.displayName,
          photoUrl: data.photo_url || data.photoUrl,
          points: Number(data.points || 0),
          streaks: Number(data.streaks || 0),
          accountType: data.account_type || data.accountType,
          culturalPassport: data.cultural_passport || data.culturalPassport,
          latitude: data.latitude,
          longitude: data.longitude,
          lastActive: data.last_active || data.lastActive,
          createdAt: data.created_at || data.createdAt,
        };
      }
    } catch {
      // fallback
    }
    return SEED_PROFILES.find(p => p.handle.toLowerCase() === trimmed) || null;
  },

  async checkHandleUnique(handle: string): Promise<boolean> {
    const profile = await this.getByHandle(handle);
    return profile === null;
  },

  async create(profile: Profile): Promise<Profile> {
    const id = profile.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: Profile = {
      ...profile,
      id,
      handle: profile.handle.replace(/^@/, '').toLowerCase().trim(),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    try {
      await supabase.from('profiles').upsert({
        id,
        handle: newProfile.handle,
        display_name: newProfile.displayName,
        photo_url: newProfile.photoUrl,
        points: newProfile.points || 0,
        streaks: newProfile.streaks || 0,
        account_type: newProfile.accountType || 'vibe',
        cultural_passport: newProfile.culturalPassport || [],
        latitude: newProfile.latitude,
        longitude: newProfile.longitude,
        last_active: newProfile.lastActive,
        created_at: newProfile.createdAt,
      });
    } catch (err) {
      console.warn('Supabase profile create notice:', err);
    }
    return newProfile;
  },

  async update(id: string, updates: Partial<Profile>): Promise<void> {
    try {
      const payload: Record<string, any> = {
        last_active: new Date().toISOString(),
      };
      if (updates.displayName !== undefined) payload.display_name = updates.displayName;
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
      if (updates.points !== undefined) payload.points = updates.points;
      if (updates.streaks !== undefined) payload.streaks = updates.streaks;
      if (updates.accountType !== undefined) payload.account_type = updates.accountType;
      if (updates.culturalPassport !== undefined) payload.cultural_passport = updates.culturalPassport;
      if (updates.latitude !== undefined) payload.latitude = updates.latitude;
      if (updates.longitude !== undefined) payload.longitude = updates.longitude;

      await supabase.from('profiles').update(payload).eq('id', id);
    } catch (err) {
      console.warn('Supabase profile update notice:', err);
    }
  },

  async getNearbyProfilesCascading(lat: number, lon: number): Promise<Profile[]> {
    const all = await this.listAll();
    const sorted = all
      .map((p) => {
        const plat = p.latitude ?? 36.7992;
        const plon = p.longitude ?? 10.1695;
        const dist = calculateHaversineDistance(lat, lon, plat, plon);
        return { profile: p, dist };
      })
      .sort((a, b) => a.dist - b.dist);

    const within3km = sorted.filter((item) => item.dist <= 3.0);
    if (within3km.length >= 3) {
      return within3km.map((item) => item.profile);
    }

    const within10km = sorted.filter((item) => item.dist <= 10.0);
    if (within10km.length >= 3) {
      return within10km.map((item) => item.profile);
    }

    const within25km = sorted.filter((item) => item.dist <= 25.0);
    return within25km.map((item) => item.profile);
  },

  async listAll(): Promise<Profile[]> {
    try {
      const { data } = await supabase.from('profiles').select('*').limit(50);
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          handle: d.handle,
          displayName: d.display_name || d.displayName,
          photoUrl: d.photo_url || d.photoUrl,
          points: Number(d.points || 0),
          streaks: Number(d.streaks || 0),
          accountType: d.account_type || d.accountType,
          culturalPassport: d.cultural_passport || d.culturalPassport,
          latitude: d.latitude,
          longitude: d.longitude,
          lastActive: d.last_active || d.lastActive,
          createdAt: d.created_at || d.createdAt,
        }));
      }
    } catch {
      // fallback
    }
    return [...SEED_PROFILES];
  },
};
