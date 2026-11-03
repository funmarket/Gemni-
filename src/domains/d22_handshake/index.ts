/**
 * Domain 22: Encounter Verification & In-App Handshake
 * Mutual agreement state machine:
 * Client taps "Hire" / "Meet" -> Status: PENDING
 * Provider taps "Accept" in-app -> Status: APPROVED (awards +75 VQ to both via D20 Ledger)
 * No physical GPS chasing outside the app.
 * Platform is non-custodial: refunds follow Seller Policy.
 */

import { vqLedger } from '../d20_vq_ledger';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

export type HandshakeStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELLED';

export interface HandshakeAgreement {
  id: string;
  clientId: string;
  clientHandle: string;
  clientName: string;
  providerId: string;
  providerHandle: string;
  providerName: string;
  providerType: 'pro' | 'local';
  serviceTitle: string;
  proposedMeetingNote?: string;
  status: HandshakeStatus;
  rewardVqAmount: number;
  sellerPolicy: {
    cancellationNoticeHours: number;
    refundTerms: string;
    contactNote: string;
  };
  createdAt: string;
  approvedAt?: string;
  declinedAt?: string;
}

const STORAGE_KEY = 'vq_handshakes_v2';

const DEFAULT_INITIAL_HANDSHAKES: HandshakeAgreement[] = [
  {
    id: 'hs_init_001',
    clientId: 'current_user',
    clientHandle: 'hannibal',
    clientName: 'Hannibal',
    providerId: 'guardian_yassine_01',
    providerHandle: 'yassine_medina',
    providerName: 'Yassine B.',
    providerType: 'pro',
    serviceTitle: 'Secret Rooftops & Artisan Leather Tour',
    proposedMeetingNote: 'Meet near Bab Bhar entrance at 4:00 PM',
    status: 'APPROVED',
    rewardVqAmount: 75,
    sellerPolicy: {
      cancellationNoticeHours: 24,
      refundTerms: 'Full direct refund if cancelled with 24h notice. Rescheduling free.',
      contactNote: 'Direct message in VibeQuest or phone exchange once approved.',
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'hs_init_002',
    clientId: 'current_user',
    clientHandle: 'hannibal',
    clientName: 'Hannibal',
    providerId: 'guardian_sarah_02',
    providerHandle: 'sarah_carthage',
    providerName: 'Sarah K.',
    providerType: 'local',
    serviceTitle: 'Carthage Hidden Ruins & Sunset Espresso',
    proposedMeetingNote: 'Espresso near Byrsa Hill museum terrace',
    status: 'PENDING',
    rewardVqAmount: 75,
    sellerPolicy: {
      cancellationNoticeHours: 2,
      refundTerms: 'Free hangout / Local Legend community culture. No fee.',
      contactNote: 'Message inside VibeQuest chat.',
    },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

class HandshakeDomain {
  private handshakes: HandshakeAgreement[] = [];
  private listeners: Set<(handshakes: HandshakeAgreement[]) => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.handshakes = JSON.parse(raw);
      } else {
        this.handshakes = [...DEFAULT_INITIAL_HANDSHAKES];
        this.save();
      }
    } catch {
      this.handshakes = [...DEFAULT_INITIAL_HANDSHAKES];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.handshakes));
    } catch (e) {
      console.warn('Failed to persist handshakes:', e);
    }
    this.listeners.forEach((cb) => cb(this.getAll()));
  }

  public subscribe(listener: (handshakes: HandshakeAgreement[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  public getAll(): HandshakeAgreement[] {
    return [...this.handshakes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPendingForUser(userId: string = 'current_user'): HandshakeAgreement[] {
    return this.handshakes.filter(
      (h) => (h.providerId === userId || h.clientId === userId) && h.status === 'PENDING'
    );
  }

  public getApprovedCount(userId: string = 'current_user'): number {
    return this.handshakes.filter(
      (h) => (h.providerId === userId || h.clientId === userId) && h.status === 'APPROVED'
    ).length;
  }

  /**
   * Client initiates a Handshake (Hire or Meet)
   */
  public requestHandshake(params: {
    clientId: string;
    clientHandle: string;
    clientName: string;
    providerId: string;
    providerHandle: string;
    providerName: string;
    providerType: 'pro' | 'local';
    serviceTitle: string;
    proposedMeetingNote?: string;
    sellerPolicy?: {
      cancellationNoticeHours: number;
      refundTerms: string;
      contactNote: string;
    };
  }): HandshakeAgreement {
    const agreement: HandshakeAgreement = {
      id: `hs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientId: params.clientId,
      clientHandle: params.clientHandle,
      clientName: params.clientName,
      providerId: params.providerId,
      providerHandle: params.providerHandle,
      providerName: params.providerName,
      providerType: params.providerType,
      serviceTitle: params.serviceTitle,
      proposedMeetingNote: params.proposedMeetingNote || 'Mutual discovery via VibeQuest',
      status: 'PENDING',
      sellerPolicy: params.sellerPolicy || {
        cancellationNoticeHours: 24,
        refundTerms: 'Direct agreement between client and provider. No platform intermediary fee.',
        contactNote: 'Direct message in VibeQuest.',
      },
      createdAt: new Date().toISOString(),
    };

    this.handshakes.unshift(agreement);
    this.save();

    // Persist to Supabase
    try {
      supabase.from('handshakes').upsert({
        id: agreement.id,
        user_id: agreement.clientId,
        guardian_id: agreement.providerId,
        action_type: agreement.providerType === 'pro' ? 'hire' : 'meet',
        status: agreement.status.toLowerCase(),
        issued_at: agreement.createdAt,
        expires_at: new Date(Date.now() + 86400000 * 7).toISOString()
      }).then(() => {}).catch(console.warn);
    } catch {}

    return agreement;
  }

  /**
   * Positional parameter overload for recordHandshake (called from Tours & Guardians)
   */
  public recordHandshake(
    clientId: string,
    clientHandle: string,
    clientName: string,
    providerId: string,
    providerHandle: string,
    providerName: string,
    providerType: 'pro' | 'local',
    serviceTitle: string,
    proposedMeetingNote?: string
  ): HandshakeAgreement {
    return this.requestHandshake({
      clientId,
      clientHandle,
      clientName,
      providerId,
      providerHandle,
      providerName,
      providerType,
      serviceTitle,
      proposedMeetingNote
    });
  }

  public getHandshakesForUser(userId: string = 'current_user'): HandshakeAgreement[] {
    return this.handshakes.filter(
      (h) => h.clientId === userId || h.providerId === userId
    );
  }

  public hasHandshakeWithGuardian(userId: string, guardianId: string): boolean {
    return this.handshakes.some(
      (h) => (h.clientId === userId || h.providerId === userId) && 
             (h.providerId === guardianId || h.clientId === guardianId) &&
             h.status === 'APPROVED'
    );
  }

  /**
   * Provider accepts the in-app Handshake -> Status becomes APPROVED
   * Triggers automatic +75 VQ ledger reward credit
   */
  public approveHandshake(handshakeId: string): HandshakeAgreement {
    const index = this.handshakes.findIndex((h) => h.id === handshakeId);
    if (index === -1) throw new Error('Handshake agreement not found');

    const hs = this.handshakes[index];
    if (hs.status === 'APPROVED') return hs;

    hs.status = 'APPROVED';
    hs.approvedAt = new Date().toISOString();

    this.handshakes[index] = hs;
    this.save();

    // Persist updated status to Supabase
    try {
      supabase.from('handshakes').update({
        status: 'active'
      }).eq('id', hs.id).then(() => {}).catch(console.warn);
    } catch {}

    // Reward client with +75 VQ
    vqLedger.credit(
      hs.clientId,
      hs.rewardVqAmount,
      'HANDSHAKE_APPROVED',
      `Approved in-app Handshake with ${hs.providerName}`,
      hs.id
    );

    return hs;
  }

  /**
   * Decline or cancel
   */
  public declineHandshake(handshakeId: string): HandshakeAgreement {
    const index = this.handshakes.findIndex((h) => h.id === handshakeId);
    if (index === -1) throw new Error('Handshake agreement not found');

    const hs = this.handshakes[index];
    hs.status = 'DECLINED';
    hs.declinedAt = new Date().toISOString();

    this.handshakes[index] = hs;
    this.save();
    return hs;
  }
}

export const handshakeDomain = new HandshakeDomain();

