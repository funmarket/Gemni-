import notifee, { 
  TimestampTrigger, 
  TriggerType, 
  AndroidImportance, 
  AndroidNotificationSetting 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hour constants
const MIN_DELAY_MS = 60 * 60 * 1000;         // 60 minutes
const MAX_DELAY_MS = 8 * 60 * 60 * 1000;       // 8 hours
const INTERVAL_THRESHOLD_MS = 20 * 60 * 60 * 1000; // 20 hours

/**
 * Helper to generate random delay between 60 minutes and 8 hours.
 */
function getRandomVibeFlashDelay(): number {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

export async function initializeVibeFlashScheduler(): Promise<void> {
  try {
    // 1. Initial Permission Gating
    await notifee.requestPermission();

    // 2. Resolve last scheduled epoch
    const lastScheduledStr = await AsyncStorage.getItem('vf_last_scheduled');
    const now = Date.now();

    let shouldSchedule = false;

    if (!lastScheduledStr) {
      shouldSchedule = true;
    } else {
      const lastScheduledEpoch = parseInt(lastScheduledStr, 10);
      // If no valid value OR last scheduled was was > 20 hours ago, reset schedule slot
      if (isNaN(lastScheduledEpoch) || (now - lastScheduledEpoch) > INTERVAL_THRESHOLD_MS) {
        shouldSchedule = true;
      }
    }

    if (shouldSchedule) {
      await scheduleNextVibeFlash();
    }
  } catch (err) {
    console.error("VibeFlash Scheduler initialization failure:", err);
  }
}

/**
 * Creates trigger notification on the device without utilizing drift-prone timeouts.
 */
export async function scheduleNextVibeFlash(): Promise<void> {
  try {
    const delayMs = getRandomVibeFlashDelay();
    const scheduledFireTime = Date.now() + delayMs;

    // Create device notification channel for Android (importance HIGH)
    const channelId = await notifee.createChannel({
      id: 'vibeflash',
      name: 'VibeQuest Moment Alert Channel',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });

    // Create timestamp triggers
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledFireTime,
      alarmManager: {
        allowWhileIdle: true,
      }
    };

    const notificationId = `vf-${scheduledFireTime}`;

    // Store scheduled fire time in AsyncStorage as 'vf_last_scheduled'
    await AsyncStorage.setItem('vf_last_scheduled', String(scheduledFireTime));

    // Register with native notification engine
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: "✨ VibeFlash",
        body: "What's your vibe right now? You have 60 seconds.",
        android: {
          channelId: channelId,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'open_vibeflash',
            launchActivity: 'default',
          },
        },
        ios: {
          interruptionLevel: 'time-sensitive',
          sound: 'default',
        },
        data: {
          type: 'vibeflash',
          windowStart: String(scheduledFireTime),
        },
      },
      trigger
    );

    console.info(`[Scheduler] VibeFlash programmed successfully inside background thread. Fires at: ${new Date(scheduledFireTime).toISOString()}`);
  } catch (error) {
    console.error("Failed to program trigger notification with Notifee:", error);
  }
}

/**
 * Foreground event listener connector. 
 * Invoked when notifications deliver active responses.
 */
export function registerVibeFlashNotificationListeners() {
  // Return unregister handle
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    try {
      // Look for vibeFlash triggers when notification is shown or clicked
      if (detail.notification?.data?.type === 'vibeflash') {
        const windowStart = detail.notification.data.windowStart;
        if (windowStart) {
          await AsyncStorage.setItem('vf_window_start', String(windowStart));
        }

        // Program NEXT trigger notification immediately after the current one fires
        // Ensure we don't double schedule by checking last scheduled time threshold
        const delayMs = getRandomVibeFlashDelay();
        await AsyncStorage.setItem('vf_last_scheduled', String(Date.now() + delayMs));
      }
    } catch (e) {
      console.warn("Foreground Event Handler notification error:", e);
    }
  });
}
