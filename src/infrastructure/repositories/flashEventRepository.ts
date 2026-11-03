/**
 * Repository: FlashEvent Repository
 * Authoritative Supabase persistence for VibeFlash 33s Spontaneous Windows.
 */

import { supabase } from '../supabase/supabaseClient';

export type VibeFlashStatus = 
  | 'active'
  | 'responded'
  | 'denied'
  | 'expired'
  | 'ghosted';

export interface VibeFlash {
  id: string;
  user_id: string;
  window_start: number;
  expires_at: number;
  status: VibeFlashStatus;
  response_photo_uri: string | null;
  response_front_photo_uri?: string | null;
  response_latitude: number | null;
  response_longitude: number | null;
  response_timestamp: number | null;
  created_at: number;
}

const SEED_FLASHES: VibeFlash[] = [
  {
    id: 'flash_001',
    user_id: 'current_user',
    window_start: Date.now() - 10000,
    expires_at: Date.now() + 23000, // 33s flash window
    status: 'active',
    response_photo_uri: null,
    response_latitude: 36.7992,
    response_longitude: 10.1695,
    response_timestamp: null,
    created_at: Date.now() - 10000,
  }
];

export const flashEventRepository = {
  async insertFlash(flash: Omit<VibeFlash, 'id'> & { id?: string }): Promise<VibeFlash> {
    const id = flash.id || `flash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newFlash: VibeFlash = {
      ...flash,
      id,
    };

    try {
      await supabase.from('vibe_flashes').upsert({
        id,
        user_id: newFlash.user_id,
        window_start: newFlash.window_start,
        expires_at: newFlash.expires_at,
        status: newFlash.status,
        response_photo_uri: newFlash.response_photo_uri,
        response_front_photo_uri: newFlash.response_front_photo_uri,
        response_latitude: newFlash.response_latitude,
        response_longitude: newFlash.response_longitude,
        response_timestamp: newFlash.response_timestamp,
        created_at: newFlash.created_at,
      });
    } catch (err) {
      console.warn('Supabase vibe_flashes insert notice:', err);
    }
    return newFlash;
  },

  async updateFlash(id: string, updates: Partial<VibeFlash>): Promise<void> {
    try {
      await supabase.from('vibe_flashes').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase vibe_flashes update notice:', err);
    }
  },

  async markExpiredFlashes(now: number): Promise<void> {
    try {
      await supabase
        .from('vibe_flashes')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now);
    } catch {}
  },

  async fetchUserFlashes(userId: string): Promise<VibeFlash[]> {
    try {
      const { data, error } = await supabase
        .from('vibe_flashes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as VibeFlash[];
      }
    } catch {}
    return [...SEED_FLASHES];
  },

  subscribeToUserFlashes(
    userId: string,
    onUpdate: (flash: VibeFlash) => void
  ): () => void {
    const handleUpdate = () => {
      this.fetchUserFlashes(userId).then(list => {
        const item = list.find(f => f.user_id === userId);
        if (item) onUpdate(item);
      });
    };

    window.addEventListener('vq:vibe_flash_changed', handleUpdate);
    return () => {
      window.removeEventListener('vq:vibe_flash_changed', handleUpdate);
    };
  },
};
