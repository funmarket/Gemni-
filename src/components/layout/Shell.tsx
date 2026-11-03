import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Home, Compass, Heart, Users, Bitcoin, MapPin, Bell, User, Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ProfileSidebar } from '../profile/ProfileSidebar';
import { useGeolocation } from '../../hooks/useGeolocation';
import { MessageModal } from '@/features/profile/messages/MessageModal';
import { NotificationCenterModal } from '@/components/notifications/NotificationCenterModal';
import { useAppNotifications } from '@/hooks/useAppNotifications';
import { useTheme } from '@/lib/theme';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Shell: React.FC<ShellProps> = ({ children, activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { cityName } = useGeolocation();
  const { unreadCount } = useAppNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bottomBarVisible, setBottomBarVisible] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Safe robust haptic utility
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    try {
      if (typeof window !== "undefined") {
        const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
        if (haptic) {
          if (type === 'light') haptic.impactOccurred('light');
          else if (type === 'medium') haptic.impactOccurred('medium');
          else haptic.impactOccurred('heavy');
        }
      }
    } catch (e) {
      console.warn('Haptic not available', e);
    }
  };

  // Direct messaging & Notifications coordinators
  useEffect(() => {
    const handleOpenDMs = () => {
      setShowMessageModal(true);
    };
    const handleOpenNotifs = () => {
      setShowNotificationsModal(true);
    };
    window.addEventListener('open-direct-messages', handleOpenDMs);
    window.addEventListener('open-notifications-center', handleOpenNotifs);
    return () => {
      window.removeEventListener('open-direct-messages', handleOpenDMs);
      window.removeEventListener('open-notifications-center', handleOpenNotifs);
    };
  }, []);
  
  // Track scroll position for Facebook-style auto-hide
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-hide scroll direction detection with 20px threshold
  const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    const difference = currentScrollTop - lastScrollTop;

    // Edge case: if we are at the very top, always show navbar
    if (currentScrollTop < 10) {
      setBottomBarVisible(true);
      setLastScrollTop(currentScrollTop);
      return;
    }

    // Checking if scroll exceeds 20px threshold to avoid jittery state changes
    if (Math.abs(difference) > 20) {
      if (difference > 0) {
        // Scrolling down: hide bottom bar smoothly
        setBottomBarVisible(false);
      } else {
        // Scrolling up: show bottom bar smoothly
        setBottomBarVisible(true);
      }
      setLastScrollTop(currentScrollTop);
    }
  };

  // Ensure scroll listener binds robustly
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = 0;
    }
    // Set bar visible on tab change
    setBottomBarVisible(true);
  }, [activeTab]);

  // Reduced bottom tab listings to exactly 5 items (profile is now inside the upper sidebar)
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, activeColor: 'bg-[#f97316]/95 text-white ring-2 ring-orange-500/30' },
    { id: 'explore', label: 'Explore', icon: Compass, activeColor: 'bg-[#3b82f6]/95 text-white ring-2 ring-blue-500/30' },
    { id: 'share', label: 'Share', icon: Heart, activeColor: 'bg-[#f43f5e] text-white ring-4 ring-[#f43f5e]/25 scale-110 z-10' },
    { id: 'vibe', label: 'Vibe', icon: Users, activeColor: 'bg-[#a855f7]/95 text-white ring-2 ring-purple-500/30' },
    { id: 'crypto', label: 'Purse', icon: Bitcoin, activeColor: 'bg-[#f97316]/95 text-white ring-2 ring-orange-500/30' }
  ];

  return (
    <div className="w-full max-w-md mx-auto h-[100vh] bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col selection:bg-orange-500/30 relative border-x border-[var(--app-border)] overflow-hidden shadow-2xl">
      
      {/* Background Matrix Ambient Glows constrained inside parent */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-[#ec4899]/3 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#f97316]/3 blur-[100px] rounded-full pointer-events-none" />

      {/* 1. TOP PERSISTENT HEADER (X/Twitter Redesign) */}
      <header className="relative z-40 bg-[var(--app-bg)]/95 border-b border-[var(--app-border)] px-4 h-14 flex items-center justify-between select-none shrink-0 w-full">
        
        {/* Cybernetic Smiley Brand Flag */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2 cursor-pointer hover:scale-102 transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full border border-vibe-primary bg-surface flex items-center justify-center text-md shrink-0 shadow-[0_0_10px_rgba(255,109,0,0.3)] select-none">
            🤪
          </div>
          <div className="flex flex-col text-left font-display">
            <span className="text-xs font-black tracking-widest text-[var(--app-text)] leading-none">
              VIBE<span className="text-vibe-primary">QUEST</span>
            </span>
            <span className="text-[7px] text-secondary font-bold uppercase tracking-[0.25em] leading-[1.25]">
              Gather & Discover
            </span>
          </div>
        </div>

        {/* Map Pin Indicator */}
        <div 
          onClick={() => onTabChange('explore')}
          className="hidden xs:flex items-center gap-1 px-2.5 py-1 bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-full cursor-pointer hover:border-zinc-300 dark:hover:border-white/15 transition-colors"
        >
          <MapPin className="w-3 h-3 text-vibe-primary fill-vibe-primary" />
          <span className="text-[8px] font-bold font-mono tracking-wider text-[var(--app-subtext)]">{cityName || 'TUNIS, TUNISIA'}</span>
        </div>

        {/* Right Header: Profile triggers */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notification Bell Trigger */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowNotificationsModal(true);
            }}
            className="p-2 transition-all cursor-pointer active:scale-90 select-none relative text-zinc-400 hover:text-white flex items-center justify-center"
            title="Notifications"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-red-600 text-white text-[9px] font-black font-mono rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.7)] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile Avatar Console panel trigger - Plain icon, no circle */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 transition-all cursor-pointer active:scale-95 select-none relative text-zinc-450 hover:text-white flex items-center justify-center"
            title="Open Console Menu"
          >
            <User className="w-5.5 h-5.5" />
            {/* Red Alert Notification dot if unread triggers exists (DMs/Drives) */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-black animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTAINER VIEWPORT */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleMainScroll}
        className={cn(
          "flex-1 w-full flex flex-col",
          activeTab === 'vibe' 
            ? "overflow-hidden" 
            : "px-4 pt-4 pb-20 overflow-y-auto"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. PERSISTENT NAVIGATION (Facebook Style Hiding) */}
      <AnimatePresence>
        {bottomBarVisible && (
          <motion.nav 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-[var(--app-bg)]/95 border-t border-[var(--app-border)] p-2 h-[56px] flex items-center justify-center select-none"
          >
            <div className="w-full flex justify-between items-center px-1">
              {navigationItems.map((item) => {
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center flex-1 h-10 px-1 py-0.5 rounded-xl focus:outline-none transition-all duration-200 cursor-pointer",
                      isActive 
                        ? cn(item.activeColor, "shadow-sm bg-white/5") 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <item.icon className="w-4.5 h-4.5 relative z-10" />
                    
                    <span className={cn(
                      "text-[8px] font-extrabold uppercase tracking-wider mt-0.5 leading-none transition-colors",
                      isActive ? "text-white" : "text-zinc-500"
                    )}>
                      {t(`navigation.${item.id === 'crypto' ? 'purse' : item.id}`)}
                    </span>

                    {/* Miniature Active indicator glowing ring */}
                    {isActive && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-current rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* 4. twitter sliding right panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <ProfileSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            onNavigateToTab={(tabId) => {
              onTabChange(tabId);
            }} 
          />
        )}
      </AnimatePresence>

      {/* 5. Direct Messages overlay portal */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
            >
              <MessageModal onClose={() => setShowMessageModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. In-App Notification Center overlay portal */}
      <AnimatePresence>
        {showNotificationsModal && (
          <NotificationCenterModal
            isOpen={showNotificationsModal}
            onClose={() => setShowNotificationsModal(false)}
            onNavigateTab={(tab) => {
              onTabChange(tab);
            }}
            onOpenMessages={() => {
              setShowMessageModal(true);
            }}
          />
        )}
      </AnimatePresence>



    </div>
  );
};
export default Shell;
