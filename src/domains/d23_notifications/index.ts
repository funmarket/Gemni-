/**
 * Domain 23: Notifications (D23)
 * Authoritative single owner of all in-app notifications, delivery attempts,
 * unread badges, and deep-link action triggers per Structure.md D23.
 */

import { triggerHaptic } from '@/shared/services/device/haptics';

export type NotificationType = 
  | 'message' 
  | 'flash_event' 
  | 'vibe_check' 
  | 'match_polar' 
  | 'match_activity' 
  | 'gossip' 
  | 'handshake'
  | 'reward'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
  actionLabel?: string;
  actionTab?: string; // 'explore' | 'vibe' | 'share' | 'profile' | 'crypto' | 'home'
  actionModal?: 'messages' | 'flash_events' | 'drift' | 'gossip';
  actionPayload?: any;
  avatar?: string;
}

// Backward-compatible alias for existing components
export type SystemNotification = AppNotification & {
  userId?: string;
  category?: 'handshake' | 'vibe' | 'reward' | 'system';
  isRead?: boolean;
  actionUrl?: string;
  createdAt?: string;
};

const STORAGE_KEY = 'vq_inapp_notifications';

const INITIAL_SEEDS: AppNotification[] = [
  {
    id: 'notif-polar-match',
    type: 'match_polar',
    title: '🧲 New Polar Romance Match!',
    body: 'Elena (Spontaneous Explorer) complements your Analytical Planner vibe. Tap to review your quarterly compatibility report.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    actionLabel: 'View Match',
    actionTab: 'vibe',
    actionModal: 'drift',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'notif-secret-spot',
    type: 'flash_event',
    title: '⚡ Secret Spot Active Nearby!',
    body: '"Sunset Terrace at Carthage Node" is vibrating right now. Check in within 45m to earn +150 VQ Points.',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    read: false,
    actionLabel: 'Explore Spot',
    actionTab: 'explore',
    avatar: '⚡'
  },
  {
    id: 'notif-activity-match',
    type: 'match_activity',
    title: '⚽ Sports & Social Partner Found',
    body: 'Karim shares your passion for Trail Running and Specialty Cafés. Active 1.2km away in El Menzah.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false,
    actionLabel: 'Connect',
    actionTab: 'vibe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'notif-streak-bonus',
    type: 'reward',
    title: 'Daily Streak Bonus Active 🔥',
    body: 'Daily presence verified! +25 VQ points credited to your Purse.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    actionLabel: 'View Wallet',
    actionTab: 'crypto'
  }
];

class NotificationsDomain {
  private notifications: AppNotification[] = [];
  private listeners: Set<(list: AppNotification[]) => void> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.notifications = JSON.parse(raw);
      } else {
        this.notifications = [...INITIAL_SEEDS];
        this.save();
      }
    } catch {
      this.notifications = [...INITIAL_SEEDS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch {}
    this.notify();
  }

  private notify(): void {
    const list = this.getNotifications();
    this.listeners.forEach(cb => cb(list));
    try {
      window.dispatchEvent(new CustomEvent('vq:notifications_changed', { detail: list }));
    } catch {}
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Backward compatibility alias
  public getAll(): SystemNotification[] {
    return this.getNotifications().map(n => ({
      ...n,
      userId: 'current_user',
      category: (n.type === 'handshake' || n.type === 'reward' || n.type === 'system') ? n.type : 'vibe',
      isRead: n.read,
      actionUrl: n.actionTab,
      createdAt: n.timestamp
    }));
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(id: string): void {
    let changed = false;
    this.notifications = this.notifications.map(n => {
      if (n.id === id && !n.read) {
        changed = true;
        return { ...n, read: true };
      }
      return n;
    });
    if (changed) {
      this.save();
      triggerHaptic('light');
    }
  }

  public markAllAsRead(): void {
    const hasUnread = this.notifications.some(n => !n.read);
    if (!hasUnread) return;

    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.save();
    triggerHaptic('medium');
  }

  public clearAll(): void {
    this.notifications = [];
    this.save();
    triggerHaptic('medium');
  }

  public addNotification(notification: {
    type?: NotificationType;
    category?: 'handshake' | 'vibe' | 'reward' | 'system';
    title: string;
    body: string;
    actionLabel?: string;
    actionTab?: string;
    actionUrl?: string;
    actionModal?: 'messages' | 'flash_events' | 'drift' | 'gossip';
    actionPayload?: any;
    avatar?: string;
  }): AppNotification {
    const assignedType: NotificationType = notification.type || (notification.category as NotificationType) || 'system';
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: assignedType,
      title: notification.title,
      body: notification.body,
      timestamp: new Date().toISOString(),
      read: false,
      actionLabel: notification.actionLabel || (notification.actionTab ? 'Open' : undefined),
      actionTab: notification.actionTab || notification.actionUrl,
      actionModal: notification.actionModal,
      actionPayload: notification.actionPayload,
      avatar: notification.avatar || '⚡'
    };

    this.notifications.unshift(newNotif);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.save();
    triggerHaptic('selection');
    return newNotif;
  }

  public subscribe(cb: (list: AppNotification[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.getNotifications());
    return () => this.listeners.delete(cb);
  }
}

export const notificationsDomain = new NotificationsDomain();
export const notificationService = notificationsDomain;
