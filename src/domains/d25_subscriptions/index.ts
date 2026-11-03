/**
 * Domain 25: Subscriptions & Entitlements (D25)
 * Governs member tiers (Free Explorer, Pro Guardian, Business Partner),
 * feature access entitlements, and plan lifecycles per Structure.md D25.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export type SubscriptionTier = 'free_explorer' | 'pro_guardian' | 'business_partner';

export interface PlanEntitlements {
  canPublishCommercialTours: boolean;
  canReceiveTips: boolean;
  maxActiveTrails: number;
  priorityDiscoveryRadius: boolean;
  businessBadgeCertified: boolean;
  commissionFeePercent: number;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'grace_period' | 'canceled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  entitlements: PlanEntitlements;
}

const TIER_ENTITLEMENTS: Record<SubscriptionTier, PlanEntitlements> = {
  free_explorer: {
    canPublishCommercialTours: false,
    canReceiveTips: true,
    maxActiveTrails: 5,
    priorityDiscoveryRadius: false,
    businessBadgeCertified: false,
    commissionFeePercent: 10
  },
  pro_guardian: {
    canPublishCommercialTours: true,
    canReceiveTips: true,
    maxActiveTrails: 50,
    priorityDiscoveryRadius: true,
    businessBadgeCertified: false,
    commissionFeePercent: 5
  },
  business_partner: {
    canPublishCommercialTours: true,
    canReceiveTips: true,
    maxActiveTrails: 100,
    priorityDiscoveryRadius: true,
    businessBadgeCertified: true,
    commissionFeePercent: 3
  }
};

const STORAGE_KEY = 'vq_user_subscriptions_v1';

class SubscriptionsDomain {
  private subscriptions: Record<string, UserSubscription> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.subscriptions = raw ? JSON.parse(raw) : {};
    } catch {
      this.subscriptions = {};
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.subscriptions));
    } catch {}
  }

  public getSubscription(userId: string = 'current_user'): UserSubscription {
    if (!this.subscriptions[userId]) {
      this.subscriptions[userId] = {
        userId,
        tier: 'free_explorer',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 86400000 * 365).toISOString(),
        entitlements: TIER_ENTITLEMENTS.free_explorer
      };
      this.save();
    }
    return this.subscriptions[userId];
  }

  public getEntitlements(userId: string = 'current_user'): PlanEntitlements {
    const sub = this.getSubscription(userId);
    return sub.entitlements;
  }

  public upgradeTier(userId: string, newTier: SubscriptionTier): UserSubscription {
    const updated: UserSubscription = {
      userId,
      tier: newTier,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString(),
      entitlements: TIER_ENTITLEMENTS[newTier]
    };

    this.subscriptions[userId] = updated;
    this.save();

    // Update Supabase profiles table account_type
    try {
      supabase
        .from('profiles')
        .update({ account_type: newTier === 'pro_guardian' ? 'pro' : newTier === 'business_partner' ? 'business' : 'vibe' })
        .eq('id', userId)
        .then(() => {})
        .catch(console.warn);
    } catch {}

    return updated;
  }
}

export const subscriptionsDomain = new SubscriptionsDomain();
