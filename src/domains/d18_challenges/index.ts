/**
 * Domain 18: Challenges & Live Vibes (D18)
 * Owns:
 * - 180s VibeCheck countdown window & reciprocal Vibe creation
 * - 33s VibeFlash spontaneous prompt
 * - Dual-camera / selfie captures
 * - VQ reward attribution (+30 VQ for 180s VibeCheck)
 */

import { vqLedger } from '../d20_vq_ledger';
import { matchingDomain } from '../d17_matching';
import { notificationsDomain } from '../d23_notifications';

export interface VibeCheckSession {
  id: string;
  promptTitle: string;
  promptDescription: string;
  durationSeconds: number;
  secondsRemaining: number;
  status: 'IDLE' | 'ACTIVE' | 'CAPTURED' | 'EXPIRED';
  rewardVq: number;
  challenger?: {
    id: string;
    handle: string;
    name: string;
    avatar?: string;
  };
  capturedPhotoUrl?: string;
  startedAt?: string;
  completedAt?: string;
}

class ChallengesDomain {
  private activeSession: VibeCheckSession | null = null;
  private timerId: any = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.resetSession();
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getSession(): VibeCheckSession {
    if (!this.activeSession) {
      this.resetSession();
    }
    return { ...this.activeSession! };
  }

  public resetSession() {
    if (this.timerId) clearInterval(this.timerId);
    this.activeSession = {
      id: `vc_${Date.now()}`,
      promptTitle: 'Show Your Current Street Vibe',
      promptDescription: 'Snap your surroundings within 180 seconds to claim proof-of-presence!',
      durationSeconds: 180,
      secondsRemaining: 180,
      status: 'IDLE',
      rewardVq: 30,
      challenger: {
        id: 'usr_sarah_carthage',
        handle: 'sarah_carthage',
        name: 'Sarah K.',
        avatar: '🌸'
      }
    };
    this.notify();
  }

  public startVibeCheck(promptText?: string, challenger?: VibeCheckSession['challenger']) {
    if (!this.activeSession || this.activeSession.status === 'ACTIVE') return;

    this.activeSession.status = 'ACTIVE';
    this.activeSession.startedAt = new Date().toISOString();
    if (promptText) {
      this.activeSession.promptTitle = promptText.substring(0, 60); // 1-60 chars bound
    }
    if (challenger) {
      this.activeSession.challenger = challenger;
    }
    this.notify();

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.activeSession || this.activeSession.status !== 'ACTIVE') {
        clearInterval(this.timerId);
        return;
      }

      if (this.activeSession.secondsRemaining <= 1) {
        this.activeSession.secondsRemaining = 0;
        this.activeSession.status = 'EXPIRED';
        clearInterval(this.timerId);
        this.notify();
      } else {
        this.activeSession.secondsRemaining -= 1;
        this.notify();
      }
    }, 1000);
  }

  public completeVibeCheck(capturedPhotoUrl: string): { success: boolean; vqEarned: number } {
    if (!this.activeSession || this.activeSession.status !== 'ACTIVE') {
      return { success: false, vqEarned: 0 };
    }

    if (this.timerId) clearInterval(this.timerId);

    this.activeSession.status = 'CAPTURED';
    this.activeSession.capturedPhotoUrl = capturedPhotoUrl;
    this.activeSession.completedAt = new Date().toISOString();
    this.notify();

    // Reward user with +30 VQ via D20 Ledger
    vqLedger.recordVibeCheck('current_user', this.activeSession.id);

    // Reciprocal VibeCheck Outcome (CH-001, VIBE-006):
    // Establishes confirmed D17 Vibe with challenger!
    if (this.activeSession.challenger) {
      const c = this.activeSession.challenger;
      matchingDomain.confirmVibeFromReciprocalCheck(
        'current_user',
        c.id,
        c.handle,
        c.name,
        c.avatar || '✨'
      );

      notificationsDomain.notify({
        userId: 'current_user',
        title: 'Reciprocal Vibe Confirmed! ⚡',
        message: `Both you and @${c.handle} completed the VibeCheck. You are now confirmed Vibes! (1:1 DMs unlocked)`,
        type: 'VIBE_CONFIRMED'
      });
    }

    return { success: true, vqEarned: this.activeSession.rewardVq };
  }

  // Multi-user VibeCheck Request coordination
  public async getRequests(userId: string = 'current_user'): Promise<any[]> {
    return [
      {
        id: 'req-cyber',
        challenger_id: 'usr_sarah_carthage',
        challenged_id: userId,
        prompt: 'Show your current sunset spot in Carthage or Medina!',
        status: 'pending',
        created_at: Date.now() - 120000,
        expires_at: Date.now() + 600000,
      }
    ];
  }

  public async sendRequest(challengerId: string, challengedId: string, prompt: string): Promise<any> {
    const req = {
      id: `req-${Date.now()}`,
      challenger_id: challengerId,
      challenged_id: challengedId,
      prompt,
      status: 'pending',
      created_at: Date.now(),
      expires_at: Date.now() + 180000,
    };
    this.startVibeCheck(prompt);
    return req;
  }

  public async acceptRequest(requestId: string): Promise<void> {
    this.startVibeCheck();
  }

  public async ignoreRequest(requestId: string): Promise<void> {
    this.resetSession();
  }

  public async refuseChallenge(id: string): Promise<void> {
    this.resetSession();
  }
}

export const challengesDomain = new ChallengesDomain();
export const vibeCheckService = challengesDomain;
export const vibeChallengeService = challengesDomain;

