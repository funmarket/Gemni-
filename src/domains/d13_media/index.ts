/**
 * Domain 13: Global Media & Lifecycle (D13)
 * Media asset verification, persistent Place/profile photos,
 * and 24-hour expiration for personal chat, Gossip media, VibeCheck, and VibeFlash.
 */

export interface MediaAsset {
  id: string;
  uploaderId: string;
  ownerDomain: 'd02_profile' | 'd05_place' | 'd09_business' | 'd12_gossip' | 'd14_chat' | 'd18_challenge';
  url: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video' | 'audio';
  isEphemeral: boolean; // True for chat, gossip, vibecheck, vibeflash (24h TTL)
  expiresAt: string | null; // ISO timestamp or null if persistent
  isDeleted: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'vq_global_media_v1';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

class MediaDomain {
  private assets: MediaAsset[] = [];

  constructor() {
    this.load();
    this.runCleanup();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.assets = raw ? JSON.parse(raw) : [];
    } catch {
      this.assets = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assets));
    } catch {}
  }

  /**
   * Register a new media asset, enforcing 24h expiration on ephemerals
   */
  public registerAsset(
    uploaderId: string,
    ownerDomain: MediaAsset['ownerDomain'],
    url: string,
    mediaType: MediaAsset['mediaType'] = 'image'
  ): MediaAsset {
    const isEphemeral = ['d12_gossip', 'd14_chat', 'd18_challenge'].includes(ownerDomain);
    const expiresAt = isEphemeral 
      ? new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString() 
      : null;

    const asset: MediaAsset = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uploaderId,
      ownerDomain,
      url,
      mediaType,
      isEphemeral,
      expiresAt,
      isDeleted: false,
      createdAt: new Date().toISOString()
    };

    this.assets.push(asset);
    this.save();
    return asset;
  }

  /**
   * Check if a media asset is still accessible or has expired
   */
  public isAccessible(assetId: string): boolean {
    const asset = this.assets.find(a => a.id === assetId);
    if (!asset || asset.isDeleted) return false;
    if (asset.expiresAt && new Date(asset.expiresAt).getTime() <= Date.now()) {
      return false; // Expired 24h window
    }
    return true;
  }

  /**
   * Durable worker: prunes expired or deleted media bytes
   */
  public runCleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    this.assets.forEach(a => {
      if (a.expiresAt && new Date(a.expiresAt).getTime() <= now && !a.isDeleted) {
        a.isDeleted = true;
        cleaned += 1;
      }
    });
    if (cleaned > 0) {
      this.save();
    }
    return cleaned;
  }
}

export const mediaDomain = new MediaDomain();
