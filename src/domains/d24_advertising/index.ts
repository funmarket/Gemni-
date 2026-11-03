/**
 * Domain 24: Advertising & Cultural Sponsorship (D24)
 * Governs ethical local sponsorship campaigns, banner placements,
 * cultural event highlights, and impression accounting per Structure.md D24.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface AdCampaign {
  id: string;
  sponsorId: string;
  sponsorName: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetUrl?: string;
  cityScope: string;
  placement: 'home_top_banner' | 'explore_curated_slot' | 'community_spotlight';
  status: 'active' | 'paused' | 'completed';
  impressionsCount: number;
  clicksCount: number;
  startsAt: string;
  endsAt: string;
}

const STORAGE_KEY = 'vq_ad_campaigns_v1';

const DEFAULT_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'camp_medina_artisan_festival',
    sponsorId: 'biz_medina_artisans',
    sponsorName: 'Tunis Medina Artisan Guild',
    title: 'Autumn Chechia & Copper Crafts Showcase',
    subtitle: 'Meet master artisans in Souk des Chéchias. Heritage tours daily.',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    cityScope: 'Tunis',
    placement: 'home_top_banner',
    status: 'active',
    impressionsCount: 240,
    clicksCount: 38,
    startsAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 14).toISOString()
  }
];

class AdvertisingDomain {
  private campaigns: AdCampaign[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.campaigns = raw ? JSON.parse(raw) : [...DEFAULT_CAMPAIGNS];
    } catch {
      this.campaigns = [...DEFAULT_CAMPAIGNS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.campaigns));
    } catch {}
  }

  public getActivePlacement(placement: AdCampaign['placement'], city?: string): AdCampaign | undefined {
    return this.campaigns.find(c => {
      if (c.status !== 'active') return false;
      if (c.placement !== placement) return false;
      if (city && c.cityScope !== 'all' && !city.toLowerCase().includes(c.cityScope.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  public recordImpression(campaignId: string): void {
    const c = this.campaigns.find(item => item.id === campaignId);
    if (!c) return;
    c.impressionsCount += 1;
    this.save();
  }

  public recordClick(campaignId: string): void {
    const c = this.campaigns.find(item => item.id === campaignId);
    if (!c) return;
    c.clicksCount += 1;
    this.save();
  }

  public createCampaign(data: Omit<AdCampaign, 'id' | 'impressionsCount' | 'clicksCount'>): AdCampaign {
    const newCamp: AdCampaign = {
      ...data,
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      impressionsCount: 0,
      clicksCount: 0
    };
    this.campaigns.unshift(newCamp);
    this.save();
    return newCamp;
  }
}

export const advertisingDomain = new AdvertisingDomain();
