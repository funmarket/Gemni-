import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Zap, Volume2, Shield, Settings, Sliders, AlertTriangle } from 'lucide-react';
import { useSharedGeolocation } from './GeolocationProvider';
import { triggerHaptic } from '../shared/services/device/haptics';

export interface PushNotificationSettings {
  enabled: boolean;
  radiusKm: number; // e.g., 2km radius
  browserNotifications: boolean;
  soundEnabled: boolean;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  distanceKm: number;
  eventData?: any;
}

interface PushNotificationContextType {
  settings: PushNotificationSettings;
  updateSettings: (newSettings: Partial<PushNotificationSettings>) => void;
  permissionStatus: NotificationPermission;
  requestBrowserPermission: () => Promise<boolean>;
  activeNotification: PushNotification | null;
  triggerLocalNotification: (title: string, body: string, eventData?: any) => void;
  notifyNewFlashEvent: (event: any) => void;
  dismissNotification: () => void;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

// Helper to calculate geodesic (Haversine) distance in km
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to play synthesized sci-fi chime via Web Audio API
const playAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    // Tone 1 (High bell sound)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2 (Subtle octave base resonance)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(293.66, now + 0.05); // D4
    osc2.frequency.setValueAtTime(440.00, now + 0.15); // A4
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.5);
    
    osc2.start(now);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn('Could not synthesize notification sound:', e);
  }
};

export const PushNotificationProvider: React.FC<{ children: React.ReactNode; onNavigate?: (tab: string, search?: string, category?: string) => void }> = ({ children, onNavigate }) => {
  const { coords } = useSharedGeolocation();
  const [activeNotification, setActiveNotification] = useState<PushNotification | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  
  // Handled event IDs to avoid duplicate alerts
  const processedEventIds = useRef<Set<string>>(new Set());

  // Load settings from localStorage or default
  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('vq_push_notification_settings');
      if (saved) {
        return {
          enabled: true,
          radiusKm: 2,
          browserNotifications: false,
          soundEnabled: true,
          ...JSON.parse(saved)
        };
      }
    } catch (e) {
      console.error('Failed to load notification settings:', e);
    }
    return {
      enabled: true,
      radiusKm: 2,
      browserNotifications: false,
      soundEnabled: true
    };
  });

  // Keep track of permission status on load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('vq_push_notification_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<PushNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    triggerHaptic('light');
  };

  const requestBrowserPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Your browser does not support browser-level HTML5 Notifications.');
      return false;
    }

    try {
      triggerHaptic('medium');
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        updateSettings({ browserNotifications: true });
        // Send welcoming notification
        new Notification('✨ Alerts Activated!', {
          body: `VibeQuest will now alert you to Flash Events within ${settings.radiusKm}km.`,
          icon: '/favicon.ico'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const triggerLocalNotification = (title: string, body: string, eventData?: any) => {
    if (!settings.enabled) return;

    let distance = 0;
    if (eventData && coords && eventData.targetLat && eventData.targetLng) {
      distance = getHaversineDistance(coords.lat, coords.lng, eventData.targetLat, eventData.targetLng);
    }

    const notificationId = `local_notif_${Date.now()}`;
    const newNotif: PushNotification = {
      id: notificationId,
      title,
      body,
      distanceKm: Number(distance.toFixed(2)),
      eventData
    };

    setActiveNotification(newNotif);

    // Audio synthesis chime
    if (settings.soundEnabled) {
      playAlertSound();
    }

    // Heavy haptic blast
    triggerHaptic('heavy');

    // Browser Notification API
    if (settings.browserNotifications && permissionStatus === 'granted') {
      try {
        new Notification(title, {
          body: `${body} (Distance: ${distance.toFixed(1)}km away)`,
          tag: 'vibe_flash_alert'
        });
      } catch (err) {
        console.warn('Browser native notification dispatch failed:', err);
      }
    }

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setActiveNotification(prev => prev?.id === notificationId ? null : prev);
    }, 10000);
  };

  const notifyNewFlashEvent = (event: any) => {
    if (!event || !event.id) return;
    
    // Avoid double alerting the same ID
    if (processedEventIds.current.has(event.id)) {
      return;
    }
    processedEventIds.current.add(event.id);

    // Check if the event is claimed
    if (event.claimed) return;

    // Proximity check
    const userLat = coords?.lat ?? 36.8065;
    const userLng = coords?.lng ?? 10.1815;

    const eventLat = event.targetLat ?? userLat;
    const eventLng = event.targetLng ?? userLng;

    const distance = getHaversineDistance(userLat, userLng, eventLat, eventLng);

    // Filter by user's specified radius proximity threshold
    if (distance <= settings.radiusKm) {
      triggerLocalNotification(
        `⚡ New Secret Spot Nearby!`,
        `"${event.title}" just opened up ${distance.toFixed(1)}km away in your grid. Claim VQ points!`,
        event
      );
    } else {
      console.log(`[Proximity Gate] Ignored event "${event.title}" because it is ${distance.toFixed(1)}km away (limit: ${settings.radiusKm}km)`);
    }
  };

  const dismissNotification = () => {
    triggerHaptic('light');
    setActiveNotification(null);
  };

  // Custom Dispatch Listener (listening to local creations/spawns in code)
  useEffect(() => {
    const handleCustomCreatedEvent = (e: Event) => {
      const customEv = e as CustomEvent;
      const event = customEv.detail;
      if (event) {
        notifyNewFlashEvent(event);
      }
    };

    window.addEventListener('vq_flash_event_created', handleCustomCreatedEvent);
    return () => window.removeEventListener('vq_flash_event_created', handleCustomCreatedEvent);
  }, [coords, settings]);

  // Sync listener across windows/tabs to notify on database additions in background
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vq_flash_events' && e.newValue) {
        try {
          const events = JSON.parse(e.newValue);
          if (Array.isArray(events) && events.length > 0) {
            const oldEvents = e.oldValue ? JSON.parse(e.oldValue) : [];
            const oldIds = new Set(oldEvents.map((ev: any) => ev.id));
            const newEvents = events.filter((ev: any) => !oldIds.has(ev.id));
            
            newEvents.forEach((ev: any) => {
              notifyNewFlashEvent(ev);
            });
          }
        } catch (err) {
          console.warn('Storage sync notification error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [coords, settings]);

  const handleBannerClick = () => {
    if (!activeNotification) return;
    triggerHaptic('medium');
    
    // Redirect to Explore page if it is configured
    if (onNavigate) {
      onNavigate('explore');
    }
    
    // Try to open the event in active screen modal context
    if (activeNotification.eventData) {
      // Dispatch custom notification tap event so screens can open details
      const tapEv = new CustomEvent('vq_flash_event_tap', { detail: activeNotification.eventData });
      window.dispatchEvent(tapEv);
    }
    
    setActiveNotification(null);
  };

  return (
    <PushNotificationContext.Provider
      value={{
        settings,
        updateSettings,
        permissionStatus,
        requestBrowserPermission,
        activeNotification,
        triggerLocalNotification,
        notifyNewFlashEvent,
        dismissNotification
      }}
    >
      {children}

      {/* Slide-Down OS-Style Push Notification Banner */}
      <AnimatePresence>
        {activeNotification && (
          <div className="fixed top-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none">
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 15, stiffness: 180 }}
              onClick={handleBannerClick}
              className="pointer-events-auto bg-[#0b132a]/95 backdrop-blur-md border-2 border-[#ff4e5e]/40 hover:border-[#ff4e5e]/80 rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.65)] p-4 max-w-sm w-full cursor-pointer flex gap-3 relative overflow-hidden select-none active:scale-[0.98] transition-all"
            >
              {/* Pulsing red accent dot */}
              <div className="absolute top-3 left-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4e5e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff4e5e]"></span>
              </div>

              {/* Icon Container */}
              <div className="w-10 h-10 rounded-full bg-[#ff4e5e]/15 flex items-center justify-center shrink-0 border border-[#ff4e5e]/30 text-[#ff4e5e]">
                <Zap className="w-5 h-5 fill-current animate-pulse" />
              </div>

              {/* Text Area */}
              <div className="flex-1 min-w-0 space-y-0.5 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-white font-extrabold text-[13px] tracking-tight truncate">
                    {activeNotification.title}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono font-bold shrink-0">
                    now
                  </span>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2">
                  {activeNotification.body}
                </p>
                {activeNotification.distanceKm > 0 && (
                  <span className="inline-block text-[10px] bg-red-500/10 border border-red-500/20 text-[#ff5f6e] font-bold px-2 py-0.5 rounded-full mt-1">
                    🧭 {activeNotification.distanceKm}km away
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification();
                }}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-all bg-transparent border-none shrink-0 self-start"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
};

// Global helper to dispatch event creations across any file
export const dispatchFlashEventCreated = (event: any) => {
  if (typeof window !== 'undefined') {
    const customEv = new CustomEvent('vq_flash_event_created', { detail: event });
    window.dispatchEvent(customEv);
  }
};
