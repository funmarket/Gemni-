/**
 * Domain 07: Guardians & Local Legends (D07)
 * Qualification state, 7-day front-camera selfie freshness,
 * optional max_clients capacity engine, service offers, and reviews.
 */

export interface GuardianOffer {
  id: string;
  guardianId: string;
  handle: string;
  name: string;
  avatarUrl: string;
  selfieUrl: string;
  selfieCapturedAt: string; // Must be within last 7 days (7 * 86400000 ms)
  type: 'local' | 'pro'; // Local Legend (free) vs Pro Guardian (commercial)
  city: string;
  districts: string[];
  languages: string[];
  bio: string;
  pricing: {
    mode: 'free' | 'hourly' | 'flat';
    amountInLocalCurrency: number;
    currency: string;
  };
  maxClients: number | null; // NULL = unlimited; positive integer = capacity cap
  activeClientsCount: number; // Currently accepted and active commitments
  linkedTrailIds: string[]; // Up to 5 featured trails
  handshakeCount: number;
  badges: string[];
  sellerPolicy: {
    cancellationNoticeHours: number;
    refundTerms: string;
    contactNote: string;
  };
}

const STORAGE_KEY = 'vq_guardians_offers_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_GUARDIANS: GuardianOffer[] = [
  {
    id: 'guardian_yassine_01',
    guardianId: 'usr_yassine_medina',
    handle: 'yassine_medina',
    name: 'Yassine B.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    selfieCapturedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days old (fresh)
    type: 'pro',
    city: 'Tunis',
    districts: ['Medina', 'Bab Bhar', 'La Goulette'],
    languages: ['Arabic', 'French', 'English', 'Italian'],
    bio: 'Professional architectural historian & Medina insider. 8 years leading private cultural delegations.',
    pricing: {
      mode: 'hourly',
      amountInLocalCurrency: 45,
      currency: 'TND'
    },
    maxClients: 5,
    activeClientsCount: 2,
    linkedTrailIds: ['trail_tunis_medina_01'],
    handshakeCount: 28,
    badges: ['Top Guide', 'Historian', 'Verified Pro'],
    sellerPolicy: {
      cancellationNoticeHours: 24,
      refundTerms: 'Full refund or free reschedule with 24h advance notice.',
      contactNote: 'Direct message in-app or cellular call upon confirmation.'
    }
  },
  {
    id: 'guardian_sarah_02',
    guardianId: 'usr_sarah_carthage',
    handle: 'sarah_carthage',
    name: 'Sarah K.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    selfieUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    selfieCapturedAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days old (fresh)
    type: 'local',
    city: 'Tunis',
    districts: ['Carthage', 'Sidi Bou Said', 'La Marsa'],
    languages: ['Arabic', 'French', 'English'],
    bio: 'Archaeology student and sunset trail scout. Local Legend sharing hidden sea lookouts for free.',
    pricing: {
      mode: 'free',
      amountInLocalCurrency: 0,
      currency: 'TND'
    },
    maxClients: 8,
    activeClientsCount: 1,
    linkedTrailIds: [],
    handshakeCount: 19,
    badges: ['Local Legend', 'Coast Scout', 'Community First'],
    sellerPolicy: {
      cancellationNoticeHours: 2,
      refundTerms: 'Free community meetup. No payment or cancellation fee.',
      contactNote: 'Coordinate via VibeQuest chat.'
    }
  }
];

class GuardiansDomain {
  private guardians: GuardianOffer[] = [];
  private listeners: Set<(guardians: GuardianOffer[]) => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.guardians = raw ? JSON.parse(raw) : [...DEFAULT_GUARDIANS];
      if (!raw) this.save();
    } catch {
      this.guardians = [...DEFAULT_GUARDIANS];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.guardians));
    } catch {
      // Storage unavailable
    }
  }

  public getGuardians(): GuardianOffer[] {
    return this.guardians;
  }

  public getGuardianById(id: string): GuardianOffer | null {
    return this.guardians.find(g => g.id === id || g.guardianId === id) || null;
  }

  /**
   * Check if the Guardian's live front-camera selfie is fresh (<= 7 days old)
   */
  public isSelfieFresh(guardian: GuardianOffer): boolean {
    const age = Date.now() - new Date(guardian.selfieCapturedAt).getTime();
    return age <= SEVEN_DAYS_MS;
  }

  /**
   * Check if capacity permits a new client booking (green/available vs red/disabled)
   */
  public hasAvailableCapacity(guardian: GuardianOffer): boolean {
    if (guardian.maxClients === null) return true; // Unlimited
    return guardian.activeClientsCount < guardian.maxClients;
  }

  public refreshSelfie(guardianId: string, selfieDataUrl: string): GuardianOffer {
    const guardian = this.getGuardianById(guardianId);
    if (!guardian) throw new Error('Guardian not found');
    guardian.selfieUrl = selfieDataUrl;
    guardian.selfieCapturedAt = new Date().toISOString();
    this.save();
    this.notify();
    return guardian;
  }

  public registerGuardian(offer: Omit<GuardianOffer, 'id' | 'handshakeCount' | 'activeClientsCount'>): GuardianOffer {
    const newOffer: GuardianOffer = {
      ...offer,
      id: `guardian_${Date.now()}`,
      handshakeCount: 0,
      activeClientsCount: 0
    };
    this.guardians.push(newOffer);
    this.save();
    this.notify();
    return newOffer;
  }

  public subscribe(cb: (guardians: GuardianOffer[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.guardians);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.guardians));
  }
}

export const guardiansDomain = new GuardiansDomain();
