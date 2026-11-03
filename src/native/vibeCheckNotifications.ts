import { VibeCheck } from './vibeCheckService';

export interface VibeCheckNotificationData {
  type: 'vibecheck';
  vibeCheckId: string;
  challengerUsername: string;
  challengerAvatarUri: string;
  prompt: string;
  expiresAt: number;
}

/**
 * Sends a real push notification via Expo Push Services to the challenged Match's device
 */
export async function sendVibeCheckNotification(
  check: VibeCheck,
  challengerUsername: string,
  challengerAvatarUri: string,
  devicePushToken: string // Expo push token
): Promise<void> {
  const dataPayload: VibeCheckNotificationData = {
    type: 'vibecheck',
    vibeCheckId: check.id,
    challengerUsername,
    challengerAvatarUri,
    prompt: check.prompt,
    expiresAt: check.expires_at,
  };

  const payload = {
    to: devicePushToken,
    title: `👀 VibeCheck from @${challengerUsername}`,
    body: `"${check.prompt}" — Prove it in 33s 💪`,
    data: dataPayload,
    sound: 'default',
    priority: 'high',
  };

  // Run in a non-blocking background fire-and-forget task as specified
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP status error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Successfully dispatched VibeCheck push notification:', data);
    })
    .catch((err) => {
      // Rule compliance: Do NOT crash or bubble to user, log console only
      console.warn('VibeCheck push notification failed silently:', err);
    });
}

/**
 * Handles action routing when a user triggers an active push notification block
 */
export function handleVibeCheckNotificationTap(
  data: VibeCheckNotificationData,
  navigate: (screen: string, params?: object) => void
): void {
  const now = Date.now();
  if (now < data.expiresAt) {
    // If within 33 second active window, launch direct verified response camera
    navigate('VibeShotResponse', { vibeCheckId: data.vibeCheckId });
  } else {
    // Otherwise, route them directly to the history logs hub
    navigate('VibeCheckHistory');
  }
}
