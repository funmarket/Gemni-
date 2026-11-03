/**
 * Domain 19: Recognition & Reputation (D19)
 * Cultural Passport stamps, Explorer badges, and Guardian reviews.
 * Invariant: Guardian review requires exactly 1 qualifying Handshake,
 * max 111 characters, and exactly one badge: Good Vibe | Chill Vibe | Cool Vibe.
 */

import { handshakeDomain } from '../d22_handshake';

export type ReviewVibeBadge = 'Good Vibe' | 'Chill Vibe' | 'Cool Vibe';

export interface GuardianReview {
  id: string;
  guardianId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerHandle: string;
  handshakeId: string; // Mandatory link to qualifying Handshake
  text: string; // Max 111 characters
  badge: ReviewVibeBadge;
  createdAt: string;
}

export interface ExplorerBadge {
  id: string;
  name: string;
  category: 'Cartographer' | 'Pathfinder' | 'Guardian' | 'Cultural';
  description: string;
  icon: string;
  earnedAt?: string;
}

const REVIEWS_KEY = 'vq_guardian_reviews_v1';
const BADGES_KEY = 'vq_explorer_badges_v1';

class RecognitionDomain {
  private reviews: GuardianReview[] = [];
  private badges: ExplorerBadge[] = [
    { id: 'badge_cartographer', name: 'Master Cartographer', category: 'Cartographer', description: 'Published 3+ verified cultural trail circuits', icon: '🗺️' },
    { id: 'badge_first_handshake', name: 'Trusted Encounter', category: 'Guardian', description: 'Established an in-app mutual agreement handshake', icon: '🤝' },
    { id: 'badge_coastal_scout', name: 'Coastal Scout', category: 'Pathfinder', description: 'Completed coastal circuits in Carthage and Sidi Bou Said', icon: '🌊' }
  ];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      this.reviews = raw ? JSON.parse(raw) : [];
    } catch {
      this.reviews = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(this.reviews));
    } catch {}
  }

  public getReviewsForGuardian(guardianId: string): GuardianReview[] {
    return this.reviews.filter(r => r.guardianId === guardianId);
  }

  /**
   * Submit Guardian review.
   * STRICT INVARIANT: Requires qualifying Handshake, <=111 characters, exactly 1 badge.
   */
  public submitGuardianReview(
    guardianId: string,
    reviewerId: string,
    reviewerName: string,
    reviewerHandle: string,
    text: string,
    badge: ReviewVibeBadge
  ): GuardianReview {
    // 1. Text constraint
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Review text is required.');
    if (trimmed.length > 111) {
      throw new Error(`Review text exceeds maximum allowed 111 characters (length: ${trimmed.length}).`);
    }

    // 2. Handshake constraint
    const handshakes = handshakeDomain.getHandshakesForUser(reviewerId);
    const qualifyingHandshake = handshakes.find(h => 
      h.status === 'APPROVED' && 
      (h.providerId === guardianId || h.clientId === guardianId)
    );

    if (!qualifyingHandshake) {
      throw new Error('Guardian reviews require a qualifying in-app Handshake agreement with this Guardian.');
    }

    const review: GuardianReview = {
      id: `rev_${Date.now()}`,
      guardianId,
      reviewerId,
      reviewerName,
      reviewerHandle,
      handshakeId: qualifyingHandshake.id,
      text: trimmed,
      badge,
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(review);
    this.save();
    this.notify();
    return review;
  }

  public getBadges(): ExplorerBadge[] {
    return this.badges;
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

export const recognitionDomain = new RecognitionDomain();
