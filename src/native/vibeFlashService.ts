import { 
  flashEventRepository, 
  VibeFlash as RepoVibeFlash, 
  VibeFlashStatus as RepoVibeFlashStatus 
} from '../infrastructure/repositories/flashEventRepository';
import { VibeShotResult } from '../types/native';

export type VibeFlashStatus = RepoVibeFlashStatus;
export type VibeFlash = RepoVibeFlash;

export interface RealtimeChannel {
  unsubscribe: () => void;
}

/**
 * Opens a new spontaneous VibeFlash window for the user
 */
export async function openVibeFlashWindow(userId: string): Promise<VibeFlash> {
  const windowStart = Date.now();
  const expiresAt = windowStart + 60000; // 60 seconds strictly (60,000 ms)

  return flashEventRepository.insertFlash({
    user_id: userId,
    window_start: windowStart,
    expires_at: expiresAt,
    status: 'active',
    response_photo_uri: null,
    response_front_photo_uri: null,
    response_latitude: null,
    response_longitude: null,
    response_timestamp: null,
    created_at: windowStart,
  });
}

/**
 * Responds to a pending VibeFlash using verified physical camera result
 */
export async function respondToVibeFlash(
  vibeFlashId: string,
  result: VibeShotResult
): Promise<void> {
  const now = Date.now();
  let targetPhotoUri = result.uri;

  // Retain the genuine captured photo URI without injecting stock imagery
  if (!targetPhotoUri) {
    targetPhotoUri = '';
  }

  const updatePayload = {
    status: 'responded' as VibeFlashStatus,
    response_photo_uri: targetPhotoUri,
    response_front_photo_uri: result.frontUri || null,
    response_latitude: result.latitude,
    response_longitude: result.longitude,
    response_timestamp: result.timestamp || now,
  };

  await flashEventRepository.updateFlash(vibeFlashId, updatePayload);
}

/**
 * Declines or skips a VibeFlash window
 */
export async function denyVibeFlash(vibeFlashId: string): Promise<void> {
  await flashEventRepository.updateFlash(vibeFlashId, { status: 'denied' });
}

/**
 * Automatically marks all expired active vibe flashes as 'expired'
 */
export async function markExpiredVibeFlashes(): Promise<void> {
  const now = Date.now();
  await flashEventRepository.markExpiredFlashes(now);
}

/**
 * Subscribes to real-time additions and updates on vibe_flashes for a user
 */
export function subscribeToVibeFlashes(
  userId: string,
  onUpdate: (flash: VibeFlash) => void
): RealtimeChannel {
  const unsubscribe = flashEventRepository.subscribeToUserFlashes(userId, onUpdate);
  return { unsubscribe };
}

/**
 * Fetches user's active/historical VibeFlashes ordered by created_at DESC
 */
export async function fetchMyVibeFlashes(userId: string): Promise<VibeFlash[]> {
  return flashEventRepository.fetchUserFlashes(userId);
}
