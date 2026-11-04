/**
 * Domain 06: Vibe Trails (D06)
 * Ordered stops, publication, remix tree lineage, attribution, and offline manifests.
 * Persisted using Supabase with local-first resilient fallback.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface TrailStop {
  id: string;
  name: string;
  placeId?: string; // Optional canonical D05 Place reference
  address: string;
  vibeNote: string;
  imageUrl?: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Sunset' | 'Night' | 'Flexible';
  durationMinutes: number;
}

export interface VibeTrailRecord {
  id: string;
  name: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  city: string;
  story: string;
  category: string;
  vibeTags: string[];
  imageUrl: string;
  latitude: number;
  longitude: number;
  stops: TrailStop[];
  totalEstimatedMinutes: number;
  savesCount: number;
  forkedFromTrailId?: string;
  forkedFromAuthorName?: string;
  isTour?: boolean; // When flagged as commercial tour by an eligible Pro Guardian
  isOfflineCached?: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'vq_trails_records_v1';

const DEFAULT_TRAILS: VibeTrailRecord[] = [
  {
    id: 'trail_tunis_medina_01',
    name: 'Secret Medina Rooftops & Artisan Cafés',
    authorId: 'usr_hannibal_1337',
    authorName: 'hannibal',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    city: 'Tunis',
    story: 'Navigate winding 10th-century alleys to uncover secluded rooftop panoramas and artisanal jasmine tea.',
    category: 'Culture',
    vibeTags: ['Historic', 'Rooftop', 'Artisan', 'Tea'],
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    latitude: 36.7992,
    longitude: 10.1706,
    totalEstimatedMinutes: 120,
    savesCount: 42,
    stops: [
      {
        id: 'stop_1',
        name: 'Bab El Bhar Historic Gateway',
        address: 'Place de la Victoire, Medina of Tunis',
        vibeNote: 'The French gate bordering the old and modern capital. Start your walk here.',
        timeOfDay: 'Morning',
        durationMinutes: 20
      },
      {
        id: 'stop_2',
        name: 'Café Panorama Medina Rooftop',
        placeId: 'place_medina_tunis',
        address: 'Rue Souk el Chaouchia',
        vibeNote: 'Unrivaled 360-degree overlook above the minarets with pine-nut mint tea.',
        timeOfDay: 'Sunset',
        durationMinutes: 45
      },
      {
        id: 'stop_3',
        name: 'Dar Ben Achour Cultural Library',
        address: 'Rue du Pacha',
        vibeNote: 'Andalusian arches and peaceful reading courtyard away from bazaar bustle.',
        timeOfDay: 'Afternoon',
        durationMinutes: 55
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

class TrailsDomain {
  private trails: VibeTrailRecord[] = [];
  private listeners: Set<(trails: VibeTrailRecord[]) => void> = new Set();

  constructor() {
    this.load();
    this.syncFromSupabase();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.trails = raw ? JSON.parse(raw) : [...DEFAULT_TRAILS];
      if (!raw) this.save();
    } catch {
      this.trails = [...DEFAULT_TRAILS];
    }
  }

  private async syncFromSupabase() {
    try {
      const [{ data, error }, { data: profilesData }] = await Promise.all([
        supabase.from('vibe_trails').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, handle, display_name, photo_url')
      ]);

      const profileMap = new Map<string, any>();
      if (profilesData) {
        profilesData.forEach((p: any) => {
          if (p.id) profileMap.set(p.id, p);
          if (p.handle) profileMap.set(p.handle, p);
          const rawId = p.id?.replace(/^usr_/, '');
          if (rawId) profileMap.set(rawId, p);
        });
      }

      if (!error && data && data.length > 0) {
        const supabaseTrails: VibeTrailRecord[] = data.map((d: any) => {
          const authorId = d.author_id || d.authorId || '';
          const profile = profileMap.get(authorId) || profileMap.get(authorId.replace(/^usr_/, ''));
          const authorName = profile?.display_name || d.author_name || d.authorName || 'Explorer';
          const authorAvatarUrl = profile?.photo_url || d.author_avatar_url || d.authorAvatarUrl;

          return {
            id: d.id,
            name: d.name,
            story: d.story,
            authorId: profile?.id || authorId,
            authorName,
            authorAvatarUrl,
            city: d.city || 'Tunis',
            category: d.category || 'General',
            vibeTags: d.vibe_tags || d.vibeTags || [],
            imageUrl: d.image_url || d.imageUrl || '',
            latitude: d.latitude || 36.7992,
            longitude: d.longitude || 10.1706,
            stops: d.stops || [],
            totalEstimatedMinutes: d.total_estimated_minutes || d.totalEstimatedMinutes || 60,
            savesCount: d.saves_count || d.savesCount || 0,
            forkedFromTrailId: d.forked_from_trail_id || d.forkedFromTrailId,
            forkedFromAuthorName: d.forked_from_author_name || d.forkedFromAuthorName,
            isTour: Boolean(d.is_tour || d.isTour),
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
            updatedAt: d.updated_at || d.updatedAt || new Date().toISOString(),
          };
        });

        this.trails = supabaseTrails;
        this.save();
        this.notify();
      }
    } catch (e) {
      console.warn('Initial Supabase trails sync notice:', e);
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trails));
    } catch {
      // Storage unavailable
    }
  }

  private async persistTrailToSupabase(trail: VibeTrailRecord) {
    try {
      await supabase.from('vibe_trails').upsert({
        id: trail.id,
        name: trail.name,
        story: trail.story,
        city: trail.city || 'Tunis, Tunisia',
        vibe_tags: trail.vibeTags || [],
        author_id: trail.authorId || 'current_user',
        author_name: trail.authorName || 'Explorer',
        image_url: trail.imageUrl,
        latitude: trail.latitude,
        longitude: trail.longitude,
        stops: trail.stops || [],
        total_estimated_minutes: trail.totalEstimatedMinutes || 60,
        created_at: trail.createdAt,
        updated_at: trail.updatedAt,
      });
    } catch (e) {
      console.warn('Supabase vibe_trails write notice:', e);
    }
  }

  public getTrails(): VibeTrailRecord[] {
    return this.trails;
  }

  public getTrailById(id: string): VibeTrailRecord | null {
    return this.trails.find(t => t.id === id) || null;
  }

  public createTrail(data: Omit<VibeTrailRecord, 'id' | 'savesCount' | 'createdAt' | 'updatedAt' | 'totalEstimatedMinutes'>): VibeTrailRecord {
    const totalMins = data.stops.reduce((sum, s) => sum + (s.durationMinutes || 30), 0);
    const newTrail: VibeTrailRecord = {
      ...data,
      id: `trail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      savesCount: 0,
      totalEstimatedMinutes: totalMins,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.trails.unshift(newTrail);
    this.save();
    this.persistTrailToSupabase(newTrail);
    this.notify();
    return newTrail;
  }

  public adoptAndRemix(parentTrailId: string, authorId: string, authorName: string, name: string): VibeTrailRecord {
    const parent = this.getTrailById(parentTrailId);
    if (!parent) throw new Error('Parent trail not found');

    const remixed: VibeTrailRecord = {
      ...parent,
      id: `trail_remix_${Date.now()}`,
      name,
      authorId,
      authorName,
      forkedFromTrailId: parent.id,
      forkedFromAuthorName: parent.authorName,
      savesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.trails.unshift(remixed);
    this.save();
    this.persistTrailToSupabase(remixed);
    this.notify();
    return remixed;
  }

  public toggleOfflineCache(trailId: string): boolean {
    const trail = this.getTrailById(trailId);
    if (!trail) return false;
    trail.isOfflineCached = !trail.isOfflineCached;
    this.save();
    this.notify();
    return Boolean(trail.isOfflineCached);
  }

  public subscribe(cb: (trails: VibeTrailRecord[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.trails);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.trails));
  }
}

export const trailsDomain = new TrailsDomain();
