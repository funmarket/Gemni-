/**
 * Service: Native VibeCheck Service (Domain 18 Challenges)
 * Authoritative reciprocal challenges with real camera validation.
 */

import { vibePostRepository, VibeCheckRecord } from '../infrastructure/repositories/vibePostRepository';
import { VibeShotResult } from '../types/native';
import { vqLedger } from '@/domains/d20_vq_ledger';

export type VibeCheckStatus = 
  | 'pending'
  | 'responded'
  | 'confirmed'
  | 'ghosted';

export interface VibeCheck {
  id: string;
  challenger_id: string;
  challenged_id: string;
  prompt: string;
  status: VibeCheckStatus;
  created_at: number;
  expires_at: number;
  response_photo_uri: string | null;
  response_front_photo_uri?: string | null;
  response_latitude: number | null;
  response_longitude: number | null;
  response_timestamp: number | null;
  challenger_reaction: 'fire' | 'electric' | 'chill' | 'respect' | 'cap' | 'vibing' | null;
}

export interface RealtimeChannel {
  unsubscribe: () => void;
}

const LOCAL_STORAGE_KEY = 'vq_vibe_checks_native_v2';

const SEED_CHECKS: VibeCheck[] = [
  {
    id: 'vc_init_001',
    challenger_id: 'user_yassine',
    challenged_id: 'current_user',
    prompt: 'Show your current street vibe near the Medina!',
    status: 'pending',
    created_at: Date.now() - 3600000,
    expires_at: Date.now() + 180000,
    response_photo_uri: null,
    response_front_photo_uri: null,
    response_latitude: 36.7995,
    response_longitude: 10.1689,
    response_timestamp: null,
    challenger_reaction: null,
  }
];

function getLocalChecks(): VibeCheck[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...SEED_CHECKS];
}

function saveLocalChecks(checks: VibeCheck[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checks));
  } catch {}
  window.dispatchEvent(new CustomEvent('vq:vibe_check_changed'));
}

export async function fireVibeCheck(
  challengedUserId: string, 
  prompt: string
): Promise<VibeCheck> {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  if (trimmed.length > 60) {
    throw new Error('Prompt exceeds maximum limit of 60 characters');
  }

  const now = Date.now();
  const newCheck: VibeCheck = {
    id: `vc_${now}_${Math.random().toString(36).substring(2, 6)}`,
    challenger_id: 'current_user',
    challenged_id: challengedUserId,
    prompt: trimmed,
    status: 'pending',
    created_at: now,
    expires_at: now + 180000, // 180 seconds window
    response_photo_uri: null,
    response_front_photo_uri: null,
    response_latitude: null,
    response_longitude: null,
    response_timestamp: null,
    challenger_reaction: null,
  };

  const list = getLocalChecks();
  list.unshift(newCheck);
  saveLocalChecks(list);

  return newCheck;
}

export async function respondToVibeCheck(
  vibeCheckId: string, 
  shotResult: VibeShotResult
): Promise<void> {
  const list = getLocalChecks();
  const target = list.find((c) => c.id === vibeCheckId);
  if (!target) return;

  target.status = 'responded';
  target.response_photo_uri = shotResult.backPhotoUri;
  target.response_front_photo_uri = shotResult.frontPhotoUri || null;
  target.response_latitude = shotResult.location?.latitude || null;
  target.response_longitude = shotResult.location?.longitude || null;
  target.response_timestamp = Date.now();

  saveLocalChecks(list);

  // Authoritatively reward user with +30 VQ via D20 Ledger
  vqLedger.credit(
    'current_user',
    30,
    'VIBECHECK_COMPLETED',
    'Completed VibeCheck photo response',
    vibeCheckId
  );
}

export async function reactToVibeCheck(
  vibeCheckId: string, 
  reaction: 'fire' | 'cap' | 'vibing'
): Promise<void> {
  const list = getLocalChecks();
  const target = list.find((c) => c.id === vibeCheckId);
  if (!target) return;

  target.challenger_reaction = reaction;
  target.status = 'confirmed';
  saveLocalChecks(list);
}

export async function markExpiredVibeChecks(): Promise<void> {
  const now = Date.now();
  const list = getLocalChecks();
  let updated = false;

  list.forEach((c) => {
    if (c.status === 'pending' && c.expires_at < now) {
      c.status = 'ghosted';
      updated = true;
    }
  });

  if (updated) {
    saveLocalChecks(list);
  }
}

export function subscribeToVibeChecks(
  userId: string,
  onUpdate: (check: VibeCheck) => void
): RealtimeChannel {
  const handleUpdate = () => {
    const list = getLocalChecks();
    const relevant = list.find((c) => c.challenger_id === userId || c.challenged_id === userId);
    if (relevant) {
      onUpdate(relevant);
    }
  };

  window.addEventListener('vq:vibe_check_changed', handleUpdate);
  window.addEventListener('storage', handleUpdate);

  return {
    unsubscribe: () => {
      window.removeEventListener('vq:vibe_check_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    },
  };
}

export async function fetchMyVibeChecks(userId: string): Promise<VibeCheck[]> {
  const list = getLocalChecks();
  return list
    .filter((c) => c.challenger_id === userId || c.challenged_id === userId)
    .sort((a, b) => b.created_at - a.created_at);
}
