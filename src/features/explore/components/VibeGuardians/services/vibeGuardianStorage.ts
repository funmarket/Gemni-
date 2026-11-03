/**
 * Canonical Guardian Storage & Backend Adapter
 * Bridges UI components with:
 * - Supabase tables: profiles, place_reviews, handshakes, vq_ledger
 * - Canonical Domains: D07 Guardians, D08 Tours, D19 Recognition, D22 Handshakes, D14 Messaging, D20 Ledger
 * - Zero mock data in React components; baseline catalog lives in canonical Domain 07
 */

import { VibeGuardian, GuardianReview, GuardianChatMessage, GuardianTrailItem, TourReservation } from '../types';
import { DEFAULT_VIBE_GUARDIANS } from '../data/defaultGuardians';
import { toursDomain } from '@/domains/d08_tours';
import { handshakeDomain } from '@/domains/d22_handshake';
import { messagingDomain } from '@/domains/d14_messaging';
import { vqLedger } from '@/domains/d20_vq_ledger';
import { notificationsDomain } from '@/domains/d23_notifications';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

const GUARDIANS_STORAGE_KEY = 'vq_vibe_guardians_directory_v2';
const CHATS_PREFIX = 'vq_vibe_guardian_chat_';

export const SELFIE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

export function isSelfieExpired(guardian: VibeGuardian): boolean {
  if (!guardian.selfieCapturedAt) return true;
  const capturedTime = new Date(guardian.selfieCapturedAt).getTime();
  if (isNaN(capturedTime)) return true;
  return Date.now() - capturedTime > SELFIE_EXPIRATION_MS;
}

export function getDaysRemaining(guardian: VibeGuardian): number {
  if (!guardian.selfieCapturedAt) return 0;
  const capturedTime = new Date(guardian.selfieCapturedAt).getTime();
  if (isNaN(capturedTime)) return 0;
  const diffMs = (capturedTime + SELFIE_EXPIRATION_MS) - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export function loadGuardians(): VibeGuardian[] {
  try {
    const raw = localStorage.getItem(GUARDIANS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GUARDIANS_STORAGE_KEY, JSON.stringify(DEFAULT_VIBE_GUARDIANS));
      triggerSupabaseSync();
      return DEFAULT_VIBE_GUARDIANS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(GUARDIANS_STORAGE_KEY, JSON.stringify(DEFAULT_VIBE_GUARDIANS));
      triggerSupabaseSync();
      return DEFAULT_VIBE_GUARDIANS;
    }
    triggerSupabaseSync();
    return parsed.map((g: any) => ({
      ...g,
      trails: g.trails || (g.favoriteTrails ? g.favoriteTrails.map((title: string, i: number) => ({ id: `t-${i}`, title })) : []),
      handshakes: g.handshakes || []
    }));
  } catch (err) {
    console.error('Error loading Vibe Guardians:', err);
    return DEFAULT_VIBE_GUARDIANS;
  }
}

let isSyncing = false;
async function triggerSupabaseSync() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    // 1. Fetch live handshakes from Supabase
    const { data: dbHandshakes } = await supabase
      .from('handshakes')
      .select('guardian_id, user_id, status')
      .eq('status', 'active');

    // 2. Fetch live reviews from Supabase place_reviews
    const { data: dbReviews } = await supabase
      .from('place_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if ((dbHandshakes && dbHandshakes.length > 0) || (dbReviews && dbReviews.length > 0)) {
      const raw = localStorage.getItem(GUARDIANS_STORAGE_KEY);
      const list: VibeGuardian[] = raw ? JSON.parse(raw) : [...DEFAULT_VIBE_GUARDIANS];

      let changed = false;
      const updated = list.map((g) => {
        let gChanged = false;
        // Merge handshakes
        const currentHs = new Set(g.handshakes || []);
        if (dbHandshakes) {
          dbHandshakes
            .filter((h: any) => h.guardian_id === g.id)
            .forEach((h: any) => {
              if (!currentHs.has(h.user_id)) {
                currentHs.add(h.user_id);
                gChanged = true;
              }
            });
        }

        // Merge reviews
        const currentReviews = [...(g.reviews || [])];
        if (dbReviews) {
          dbReviews
            .filter((r: any) => r.place_id === g.id)
            .forEach((r: any) => {
              if (!currentReviews.some(ex => ex.id === r.id)) {
                currentReviews.unshift({
                  id: r.id,
                  author: r.author_name || 'Verified Explorer',
                  authorHandle: `@${r.author_id.replace(/^usr_/, '')}`,
                  badge: (r.comment?.includes('Chill') ? 'Chill Vibe' : r.comment?.includes('Cool') ? 'Cool Vibe' : 'Good Vibe') as any,
                  note: r.comment || 'Authentic Vibe Encounter',
                  createdAt: new Date(r.created_at).toLocaleDateString()
                });
                gChanged = true;
              }
            });
        }

        if (gChanged) {
          changed = true;
          return {
            ...g,
            handshakes: Array.from(currentHs),
            reviews: currentReviews
          };
        }
        return g;
      });

      if (changed) {
        localStorage.setItem(GUARDIANS_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      }
    }
  } catch (err) {
    console.warn('Supabase guardian sync notice:', err);
  } finally {
    isSyncing = false;
  }
}

export function saveGuardians(guardians: VibeGuardian[]): void {
  try {
    localStorage.setItem(GUARDIANS_STORAGE_KEY, JSON.stringify(guardians));
  } catch (err) {
    console.error('Error saving Vibe Guardians:', err);
  }
}

// -------------------------------------------------------------
// 1. HANDSHAKE PROOF SYSTEM (Delegates to D22 Handshake Domain & Supabase)
// -------------------------------------------------------------
export function hasUserHandshake(guardianId: string, userKey: string): boolean {
  if (!userKey) return false;
  // 1. Check canonical D22 Handshake Domain
  if (handshakeDomain.hasHandshakeWithGuardian(userKey, guardianId)) return true;

  // 2. Check guardian object embedded handshakes
  const guardians = loadGuardians();
  const g = guardians.find(x => x.id === guardianId);
  return Boolean(g?.handshakes && g.handshakes.includes(userKey));
}

export function recordHandshake(guardianId: string, userKey: string): VibeGuardian[] {
  if (!userKey) return loadGuardians();

  const list = loadGuardians();
  let targetGuardian = list.find(g => g.id === guardianId);
  const targetGuardianName = targetGuardian?.name || 'Guardian';
  const targetGuardianType = (targetGuardian?.type || 'pro') as 'pro' | 'local';

  // 1. Authoritative Handshake creation in D22
  handshakeDomain.recordHandshake(
    userKey,
    userKey.replace(/^usr_/, ''),
    userKey,
    guardianId,
    targetGuardian?.handle || guardianId,
    targetGuardianName,
    targetGuardianType,
    `Encounter with ${targetGuardianName}`,
    'Mutual discovery via VibeQuest app'
  );

  // 2. Persist to Supabase handshakes table
  try {
    supabase.from('handshakes').upsert({
      id: `hs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: userKey,
      guardian_id: guardianId,
      action_type: targetGuardianType === 'pro' ? 'hire' : 'meet',
      status: 'active',
      issued_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000 * 7).toISOString()
    }).then(() => {}).catch(console.warn);
  } catch {}

  // 3. Update guardian embedded handshakes array
  const updated = list.map((g) => {
    if (g.id !== guardianId) return g;
    const existing = g.handshakes || [];
    return {
      ...g,
      handshakes: existing.includes(userKey) ? existing : [...existing, userKey],
      hiresCount: g.type === 'pro' ? g.hiresCount + 1 : g.hiresCount
    };
  });
  saveGuardians(updated);

  // 4. Credit user purse (+75 VQ) and notify
  vqLedger.credit(
    userKey,
    75,
    'HANDSHAKE_APPROVED',
    `Approved in-app Handshake with ${targetGuardianName}`,
    guardianId
  );
  notificationsDomain.addNotification({
    title: 'Handshake Approved! 🤝',
    body: `You completed an in-app Handshake with ${targetGuardianName}. +75 VQ credited to your Purse!`,
    category: 'handshake',
    actionUrl: 'crypto'
  });

  return updated;
}

// -------------------------------------------------------------
// 2. REVIEWS & BADGES (Delegates to D19 Recognition & Supabase)
// -------------------------------------------------------------
export function addReviewToGuardian(
  guardianId: string, 
  review: Omit<GuardianReview, 'id' | 'createdAt'>,
  userKey: string
): { success: boolean; guardians: VibeGuardian[]; error?: string } {
  // Invariant 1: Handshake proof required
  if (!hasUserHandshake(guardianId, userKey)) {
    return {
      success: false,
      guardians: loadGuardians(),
      error: 'Handshake proof required: You must hire (for Pro) or vibe with (for Local) this guardian before leaving a review.'
    };
  }

  // Invariant 2: Max 111 characters
  const cleanNote = (review.note || '').trim();
  if (cleanNote.length > 111) {
    return {
      success: false,
      guardians: loadGuardians(),
      error: `Review exceeds maximum allowed 111 characters (current: ${cleanNote.length}).`
    };
  }

  const list = loadGuardians();
  const targetGuardian = list.find(g => g.id === guardianId);

  const newRev: GuardianReview = {
    ...review,
    note: cleanNote,
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: 'Just now'
  };

  // 1. Authoritative insert to Supabase place_reviews table
  try {
    supabase.from('place_reviews').upsert({
      id: newRev.id,
      place_id: guardianId,
      place_name: `Guardian: ${targetGuardian?.name || guardianId}`,
      rating: 5,
      comment: cleanNote || review.badge,
      author_id: userKey,
      author_name: review.author || userKey,
      created_at: new Date().toISOString()
    }).then(() => {}).catch(console.warn);
  } catch {}

  // 2. Update local guardian state
  const updated = list.map((g) => {
    if (g.id !== guardianId) return g;
    const badges = [...g.earnedBadges];
    const existingBadgeIndex = badges.findIndex(b => b.badge === review.badge);
    if (existingBadgeIndex >= 0) {
      badges[existingBadgeIndex].count += 1;
    } else {
      badges.push({ badge: review.badge, count: 1 });
    }

    return {
      ...g,
      reviews: [newRev, ...g.reviews],
      earnedBadges: badges
    };
  });
  saveGuardians(updated);
  return { success: true, guardians: updated };
}

// -------------------------------------------------------------
// 3. VIBE TRAILS MANAGEMENT (MAX 5 TRAILS PER CARD)
// -------------------------------------------------------------
export function addTrailToGuardian(
  guardianId: string, 
  trail: GuardianTrailItem
): { success: boolean; error?: string; guardian?: VibeGuardian } {
  const list = loadGuardians();
  const g = list.find(x => x.id === guardianId);
  if (!g) return { success: false, error: 'Guardian not found' };

  if (g.trails && g.trails.length >= 5) {
    return { success: false, error: 'Maximum limit of 5 trails reached for this card.' };
  }

  const updatedTrails = [...(g.trails || []), trail];
  const updatedList = list.map(item => item.id === guardianId ? { ...item, trails: updatedTrails } : item);
  saveGuardians(updatedList);
  return { success: true, guardian: updatedList.find(x => x.id === guardianId) };
}

// -------------------------------------------------------------
// 4. PRE-MADE TOURS & RESERVATION CALENDAR SYSTEM (Delegates to D08 Tours & Supabase)
// -------------------------------------------------------------
export function loadReservations(): TourReservation[] {
  try {
    const raw = localStorage.getItem('vq_guardian_tour_reservations_v2');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReservations(res: TourReservation[]): void {
  try {
    localStorage.setItem('vq_guardian_tour_reservations_v2', JSON.stringify(res));
  } catch (e) {
    console.error('Error saving reservations:', e);
  }
}

export function requestTourReservation(
  reservationData: Omit<TourReservation, 'id' | 'createdAt' | 'status'>
): TourReservation {
  const current = loadReservations();
  const newReservation: TourReservation = {
    ...reservationData,
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    status: 'accepted',
    createdAt: new Date().toISOString()
  };

  const updated = [newReservation, ...current];
  saveReservations(updated);

  // Automatically record and issue real Handshake proof
  recordHandshake(reservationData.guardianId, reservationData.userId);

  return newReservation;
}

// -------------------------------------------------------------
// 5. DIRECT MESSAGING (Delegates to D14 Messaging Domain)
// -------------------------------------------------------------
export function loadGuardianChat(guardianId: string): GuardianChatMessage[] {
  try {
    const raw = localStorage.getItem(`${CHATS_PREFIX}${guardianId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function sendGuardianChatMessage(
  guardianId: string, 
  message: Omit<GuardianChatMessage, 'id' | 'timestamp'>
): GuardianChatMessage[] {
  const current = loadGuardianChat(guardianId);
  const newMsg: GuardianChatMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  const updated = [...current, newMsg];
  try {
    localStorage.setItem(`${CHATS_PREFIX}${guardianId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving guardian chat message:', err);
  }

  // Also log to D14 Messaging Domain
  try {
    messagingDomain.sendMessage(
      `conv_guardian_${guardianId}`,
      message.sender === 'user' ? 'current_user' : guardianId,
      message.sender === 'user' ? 'hannibal' : 'guardian',
      message.sender === 'user' ? 'Hannibal' : 'Guardian',
      message.text || 'Shared a trail'
    );
  } catch {}

  return updated;
}

export function updateOrRegisterGuardian(guardian: VibeGuardian): VibeGuardian[] {
  const list = loadGuardians();
  const index = list.findIndex(g => g.id === guardian.id || (guardian.isCurrentUser && g.isCurrentUser));
  let updated: VibeGuardian[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = { ...updated[index], ...guardian };
  } else {
    updated = [guardian, ...list];
  }
  saveGuardians(updated);
  return updated;
}

export function isUserProGuardian(userKeyOrId?: string, handle?: string): boolean {
  const list = loadGuardians();
  const cleanHandle = handle ? handle.replace(/^@/, '').toLowerCase().trim() : '';
  const cleanKey = userKeyOrId ? userKeyOrId.toLowerCase().trim() : '';
  return list.some(g => 
    g.type === 'pro' && 
    (
      g.isCurrentUser ||
      (cleanKey && (g.id.toLowerCase().includes(cleanKey) || g.name.toLowerCase().includes(cleanKey))) ||
      (cleanHandle && g.handle.toLowerCase().replace(/^@/, '') === cleanHandle)
    )
  );
}

export function getCurrentUserProGuardian(userKeyOrId?: string, handle?: string): VibeGuardian | undefined {
  const list = loadGuardians();
  const cleanHandle = handle ? handle.replace(/^@/, '').toLowerCase().trim() : '';
  const cleanKey = userKeyOrId ? userKeyOrId.toLowerCase().trim() : '';
  return list.find(g => 
    g.type === 'pro' && 
    (
      g.isCurrentUser ||
      (cleanKey && (g.id.toLowerCase().includes(cleanKey) || g.name.toLowerCase().includes(cleanKey))) ||
      (cleanHandle && g.handle.toLowerCase().replace(/^@/, '') === cleanHandle)
    )
  );
}
