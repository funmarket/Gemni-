import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, X, Check, Trash2, Heart, Zap, MessageSquare, Flame, 
  Compass, ExternalLink, Sparkles, Filter, Volume2, ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { AppNotification, NotificationType } from '@/services/notificationService';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/shared/services/device/haptics';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenMessages?: (handle?: string) => void;
}

type FilterCategory = 'all' | 'unread' | 'matches' | 'alerts' | 'messages';

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenMessages
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification
  } = useAppNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'matches') {
      return notif.type === 'match_polar' || notif.type === 'match_activity';
    }
    if (activeFilter === 'alerts') {
      return notif.type === 'flash_event' || notif.type === 'system';
    }
    if (activeFilter === 'messages') {
      return notif.type === 'message';
    }
    return true; // 'all'
  });

  const handleActionClick = (notif: AppNotification) => {
    triggerHaptic('light');
    markAsRead(notif.id);

    if (notif.actionModal === 'messages') {
      onClose();
      if (onOpenMessages) {
        onOpenMessages(notif.actionPayload?.handle);
      } else {
        window.dispatchEvent(new CustomEvent('open-direct-messages'));
      }
      return;
    }

    if (notif.actionTab && onNavigateTab) {
      onClose();
      onNavigateTab(notif.actionTab);
      return;
    }

    onClose();
  };

  const handleSendTestNotification = () => {
    triggerHaptic('medium');
    const testTypes: Array<{
      type: NotificationType;
      title: string;
      body: string;
      actionLabel: string;
      actionTab?: string;
      actionModal?: 'messages' | 'flash_events' | 'drift' | 'gossip';
    }> = [
      {
        type: 'match_polar',
        title: '🧲 New Polar Match Alert!',
        body: 'A complementary Wanderer in your sector resonates with your energy. Opposite traits, high growth potential!',
        actionLabel: 'View Match',
        actionTab: 'vibe'
      },
      {
        type: 'flash_event',
        title: '⚡ Secret Spot Awakened!',
        body: 'Harbor Lighthouse node is pulsing right now (+200 VQ Points). 30 minutes left to claim!',
        actionLabel: 'View on Map',
        actionTab: 'explore'
      },
      {
        type: 'message',
        title: '💬 Direct Transmission Received',
        body: 'cyber_voyager: "Are you heading to the rooftop vibe check tonight?"',
        actionLabel: 'Open Chat',
        actionModal: 'messages'
      }
    ];

    const pick = testTypes[Math.floor(Math.random() * testTypes.length)];
    addNotification({
      type: pick.type,
      title: pick.title,
      body: pick.body,
      actionLabel: pick.actionLabel,
      actionTab: pick.actionTab,
      actionModal: pick.actionModal,
      avatar: pick.type === 'match_polar' ? '🧲' : pick.type === 'flash_event' ? '⚡' : '💬'
    });
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'match_polar':
        return (
          <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="w-4.5 h-4.5 fill-pink-500/30" />
          </div>
        );
      case 'match_activity':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        );
      case 'flash_event':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-4.5 h-4.5 fill-amber-500/20" />
          </div>
        );
      case 'message':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4.5 h-4.5" />
          </div>
        );
      case 'gossip':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Compass className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md max-h-[90vh] bg-zinc-950 border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-left"
      >
        {/* 1. Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[15px] uppercase tracking-wider text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full font-mono animate-pulse">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Live Vibe Alerts & Matches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-amber-500/5 transition-all cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read All
              </button>
            )}
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Category Filter Pills */}
        <div className="px-4 py-2.5 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none bg-zinc-950/70 shrink-0">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { 
              id: 'matches', 
              label: 'Matches', 
              count: notifications.filter((n) => n.type === 'match_polar' || n.type === 'match_activity').length 
            },
            { 
              id: 'alerts', 
              label: 'Alerts', 
              count: notifications.filter((n) => n.type === 'flash_event' || n.type === 'system').length 
            },
            { 
              id: 'messages', 
              label: 'DMs', 
              count: notifications.filter((n) => n.type === 'message').length 
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveFilter(tab.id as FilterCategory);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                activeFilter === tab.id
                  ? "bg-white text-black shadow-sm"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5"
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded-full font-mono",
                  activeFilter === tab.id ? "bg-black/15 text-black" : "bg-white/10 text-zinc-300"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3. Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {filteredNotifications.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-center text-zinc-400">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-[13px] font-bold text-zinc-400">No notifications in this view</p>
              <p className="text-[11px] text-zinc-600 max-w-[240px]">
                You are all caught up! When new matches, secret spots, or messages arrive, they will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id);
                }}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all relative overflow-hidden flex gap-3 text-left group cursor-pointer",
                  notif.read
                    ? "bg-zinc-900/30 border-white/5 opacity-80 hover:opacity-100"
                    : "bg-zinc-900/80 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.06)]"
                )}
              >
                {/* Visual Unread Glow Bar on Left */}
                {!notif.read && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-400" />
                )}

                {/* Notification Icon */}
                {getIconForType(notif.type)}

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <h4 className={cn(
                      "text-[13px] font-bold tracking-tight truncate",
                      notif.read ? "text-zinc-300" : "text-white"
                    )}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap shrink-0">
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                    {notif.body}
                  </p>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    {notif.actionLabel ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(notif);
                        }}
                        className="text-[11px] font-black uppercase tracking-wider text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{notif.actionLabel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ) : <div />}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. Footer Utilities */}
        <div className="p-3 border-t border-white/10 bg-zinc-950 flex items-center justify-between shrink-0">
          <button
            onClick={handleSendTestNotification}
            className="text-[11px] font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-zinc-900 transition-all cursor-pointer flex items-center gap-1.5"
            title="Simulate incoming notification"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Send Test Alert</span>
          </button>

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all notifications?')) {
                  clearAll();
                }
              }}
              className="text-[11px] font-mono text-zinc-500 hover:text-red-400 px-2 py-1 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
