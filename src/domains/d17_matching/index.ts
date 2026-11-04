/**
 * Domain 17: Matching & Drift Wavelengths (D17)
 * Owns:
 * - "Pulls": Inbound connection requests with Accept / Pass actions.
 * - "Vibes": Mutual double-opt-in connections unlocking 1:1 DMs.
 * - "Drift": Spontaneous discovery cards across 12 interest/mood wavelengths.
 * - Qualifying reciprocal VibeCheck (D18) establishes confirmed Vibes.
 */

export interface VibePullRequest {
  id: string;
  senderId: string;
  senderHandle: string;
  senderName: string;
  senderAvatar: string;
  compatibilityScore: number;
  matchType: 'ROMANCE' | 'FRIENDSHIP' | 'CULTURAL_EXPLORER';
  reasonText: string;
  status: 'PENDING' | 'ACCEPTED' | 'PASSED';
  createdAt: string;
}

export interface MutualVibeMatch {
  id: string;
  initiatorId: string;
  matchedUserId: string;
  matchedHandle: string;
  matchedName: string;
  matchedAvatar: string;
  compatibilityScore: number;
  matchType: 'ROMANCE' | 'FRIENDSHIP' | 'CULTURAL_EXPLORER' | 'RECIPROCAL_VIBECHECK';
  unlockedAt: string;
}

const STORAGE_KEY = 'vq_matching_v3';

const DEFAULT_PULLS: VibePullRequest[] = [
  {
    id: 'pull_001',
    senderId: 'usr_sarah_carthage',
    senderHandle: 'sarah_carthage',
    senderName: 'Sarah K.',
    senderAvatar: '🌸',
    compatibilityScore: 92,
    matchType: 'CULTURAL_EXPLORER',
    reasonText: 'Both love seaside cafes and contemporary photography in La Marsa.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pull_002',
    senderId: 'guardian_yassine_01',
    senderHandle: 'yassine_medina',
    senderName: 'Yassine B.',
    senderAvatar: '⚡',
    compatibilityScore: 88,
    matchType: 'FRIENDSHIP',
    reasonText: 'High music resonance: Shared interest in sunset electronic vinyl sessions.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

const DEFAULT_MATCHES: MutualVibeMatch[] = [
  {
    id: 'match_001',
    initiatorId: 'current_user',
    matchedUserId: 'usr_sarah_carthage',
    matchedHandle: 'sarah_carthage',
    matchedName: 'Sarah K.',
    matchedAvatar: '🌸',
    compatibilityScore: 95,
    matchType: 'CULTURAL_EXPLORER',
    unlockedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

class MatchingDomain {
  private pulls: VibePullRequest[] = [];
  private matches: MutualVibeMatch[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.pulls = parsed.pulls || DEFAULT_PULLS;
        this.matches = parsed.matches || DEFAULT_MATCHES;
      } else {
        this.pulls = [...DEFAULT_PULLS];
        this.matches = [...DEFAULT_MATCHES];
        this.save();
      }
    } catch {
      this.pulls = [...DEFAULT_PULLS];
      this.matches = [...DEFAULT_MATCHES];
    }
  }

  private save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pulls: this.pulls, matches: this.matches })
      );
    } catch (e) {
      console.warn('Failed to persist matching domain:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getPendingPulls(): VibePullRequest[] {
    return this.pulls.filter((p) => p.status === 'PENDING');
  }

  public getMutualVibes(): MutualVibeMatch[] {
    return [...this.matches];
  }

  public getConfirmedVibes(): MutualVibeMatch[] {
    return [...this.matches];
  }

  public acceptPull(pullId: string): MutualVibeMatch | null {
    const pull = this.pulls.find((p) => p.id === pullId);
    if (!pull || pull.status !== 'PENDING') return null;

    pull.status = 'ACCEPTED';

    const newMatch: MutualVibeMatch = {
      id: `match_${Date.now()}`,
      initiatorId: 'current_user',
      matchedUserId: pull.senderId,
      matchedHandle: pull.senderHandle,
      matchedName: pull.senderName,
      matchedAvatar: pull.senderAvatar,
      compatibilityScore: pull.compatibilityScore,
      matchType: pull.matchType,
      unlockedAt: new Date().toISOString(),
    };

    this.matches.unshift(newMatch);
    this.save();
    return newMatch;
  }

  public passPull(pullId: string): void {
    const pull = this.pulls.find((p) => p.id === pullId);
    if (pull) {
      pull.status = 'PASSED';
      this.save();
    }
  }

  public sendPull(params: {
    targetUserId: string;
    targetHandle: string;
    targetName: string;
    senderId?: string;
    senderHandle?: string;
    senderName?: string;
    senderAvatar?: string;
    reasonText?: string;
  }): VibePullRequest {
    const newPull: VibePullRequest = {
      id: `pull_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: params.senderId || 'current_user',
      senderHandle: params.senderHandle || 'current_user',
      senderName: params.senderName || 'Explorer',
      senderAvatar: params.senderAvatar || '✨',
      compatibilityScore: 90,
      matchType: 'CULTURAL_EXPLORER',
      reasonText: params.reasonText || `Connected via cultural profile @${params.targetHandle}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    (newPull as any).targetUserId = params.targetUserId;
    (newPull as any).targetHandle = params.targetHandle;

    this.pulls.unshift(newPull);
    this.save();
    return newPull;
  }

  public hasSentPull(targetId: string, currentUserId = 'current_user'): boolean {
    const cleanTarget = targetId.toLowerCase().replace(/^@/, '');
    return this.pulls.some((p) => 
      p.status === 'PENDING' && 
      (p.senderId === currentUserId || p.senderHandle === currentUserId) &&
      (((p as any).targetUserId && (p as any).targetUserId.toLowerCase() === cleanTarget) ||
       ((p as any).targetHandle && (p as any).targetHandle.toLowerCase().replace(/^@/, '') === cleanTarget))
    );
  }

  public hasMutualVibe(targetId: string, currentUserId = 'current_user'): boolean {
    const cleanTarget = targetId.toLowerCase().replace(/^@/, '');
    return this.matches.some((m) =>
      (m.initiatorId === currentUserId && (m.matchedUserId.toLowerCase() === cleanTarget || m.matchedHandle.toLowerCase().replace(/^@/, '') === cleanTarget)) ||
      (m.matchedUserId === currentUserId && (m.initiatorId.toLowerCase() === cleanTarget))
    );
  }

  /**
   * Reciprocal VibeCheck Outcome (CH-001, VIBE-006):
   * A completed qualifying reciprocal VibeCheck establishes a confirmed D17 Vibe
   * between previously unconnected eligible participants.
   */
  public confirmVibeFromReciprocalCheck(
    userAId: string,
    userBId: string,
    userBHandle: string,
    userBName: string,
    userBAvatar: string = '✨'
  ): MutualVibeMatch {
    const existing = this.matches.find(m => 
      (m.initiatorId === userAId && m.matchedUserId === userBId) ||
      (m.initiatorId === userBId && m.matchedUserId === userAId)
    );
    if (existing) return existing;

    const newVibe: MutualVibeMatch = {
      id: `vibe_check_match_${Date.now()}`,
      initiatorId: userAId,
      matchedUserId: userBId,
      matchedHandle: userBHandle,
      matchedName: userBName,
      matchedAvatar: userBAvatar,
      compatibilityScore: 100,
      matchType: 'RECIPROCAL_VIBECHECK',
      unlockedAt: new Date().toISOString()
    };

    this.matches.unshift(newVibe);
    this.save();
    return newVibe;
  }

  public getCounts() {
    return {
      pullsCount: this.getPendingPulls().length,
      vibesCount: this.matches.length,
    };
  }

  // Polar Romance & Social Activity Complementarity Matching Algorithms
  public computePolarComplementarity(userA: any, userB: any): {
    score: number;
    dimensions: { planning: string; energy: string; social: string; routine: string };
    whyReport: {
      headline: string;
      description: string;
      growthOpportunities: string[];
      sharedFoundations: string[];
    };
  } {
    const styleA = userA?.personalityStyle || { energy: 'calm', planning: 'structured', social: 'introvert', routine: 'habitual' };
    const styleB = userB?.personalityStyle || { energy: 'high', planning: 'spontaneous', social: 'extrovert', routine: 'adventurous' };

    let score = 50;
    if (styleA.planning !== styleB.planning) score += 20;
    if (styleA.energy !== styleB.energy) score += 20;

    return {
      score: Math.min(99, score),
      dimensions: {
        planning: styleA.planning !== styleB.planning ? 'Complementary (Grounded + Spontaneous)' : 'Shared',
        energy: styleA.energy !== styleB.energy ? 'Dynamic (Centering + High Vibrance)' : 'Aligned',
        social: 'Balanced',
        routine: 'Flexible'
      },
      whyReport: {
        headline: 'Natural Magnetic Complementarity',
        description: `Your rhythm naturally harmonizes with @${userB?.username || 'explorer'}'s perspective.`,
        growthOpportunities: ['Shared sunrise trail runs', 'Weekend coffee discussions'],
        sharedFoundations: ['Cultural curiosity', 'Authentic presence']
      }
    };
  }
}

export const matchingDomain = new MatchingDomain();
export const AdvancedMatchingEngine = {
  computePolarComplementarity: (a: any, b: any) => matchingDomain.computePolarComplementarity(a, b)
};

