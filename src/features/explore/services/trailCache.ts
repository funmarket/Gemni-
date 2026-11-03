import { VibeTrail } from '../types';

const OFFLINE_TRAILS_STORAGE_KEY = 'vibequest_offline_trails_cache_v1';

export const trailCacheService = {
  /**
   * Save a VibeTrail with all its stops and metadata to local offline storage.
   */
  cacheTrail(trail: VibeTrail): void {
    try {
      const existing = this.getCachedTrails();
      const filtered = existing.filter((t) => t.id !== trail.id);
      const updated = [trail, ...filtered];
      localStorage.setItem(OFFLINE_TRAILS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not cache trail offline:', err);
    }
  },

  /**
   * Remove a trail from offline cache.
   */
  uncacheTrail(trailId: string): void {
    try {
      const existing = this.getCachedTrails();
      const updated = existing.filter((t) => t.id !== trailId);
      localStorage.setItem(OFFLINE_TRAILS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not remove cached trail:', err);
    }
  },

  /**
   * Check if a trail is cached for offline access.
   */
  isTrailCached(trailId: string): boolean {
    try {
      const existing = this.getCachedTrails();
      return existing.some((t) => t.id === trailId);
    } catch {
      return false;
    }
  },

  /**
   * Retrieve all cached trails.
   */
  getCachedTrails(): VibeTrail[] {
    try {
      const raw = localStorage.getItem(OFFLINE_TRAILS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as VibeTrail[];
    } catch (err) {
      console.warn('Error reading offline trail cache:', err);
      return [];
    }
  }
};
