import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Shell } from '@/components/layout/Shell';
import { PushNotificationProvider } from '@/lib/pushNotifications';

import { HomeScreen } from '@/screens/HomeScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { ShareGoodVibesScreen } from '@/screens/ShareGoodVibesScreen';
import { VibeScreen } from '@/screens/VibeScreen';
import { CryptoScreen } from '@/screens/CryptoScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Admin screen kept lazy as it is only accessed in special admin mode
const AdminScreen = React.lazy(() => import('@/screens/AdminScreen'));

const ScreenFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center text-white space-y-4">
    <div className="w-10 h-10 relative">
      <div className="absolute inset-0 rounded-full border-2 border-rose-500/20" />
      <div className="absolute inset-0 rounded-full border-2 border-t-rose-500 animate-spin" />
    </div>
    <p className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
      Resonating local vibes...
    </p>
  </div>
);

export function ScreenRouter() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreCategory, setExploreCategory] = useState('');

  const handleNavigate = (tab: string, search?: string, category?: string) => {
    setExploreSearch(search || '');
    setExploreCategory(category || '');
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-2 border-vibe-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-vibe-primary animate-spin" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
          Finding warm local vibes near you...
        </p>
      </div>
    );
  }


  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'explore':
        return <ExploreScreen initialSearch={exploreSearch} initialCategory={exploreCategory} />;
      case 'share':
        return <ShareGoodVibesScreen />;
      case 'vibe':
        return <VibeScreen />;
      case 'crypto':
        return <CryptoScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'admin':
        return (
          <React.Suspense fallback={<ScreenFallback />}>
            <AdminScreen />
          </React.Suspense>
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <PushNotificationProvider onNavigate={handleNavigate}>
      <Shell
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab !== 'explore') {
            setExploreSearch('');
            setExploreCategory('');
          }
          setActiveTab(tab);
        }}
      >
        <ErrorBoundary>
          {renderScreen()}
        </ErrorBoundary>
      </Shell>
    </PushNotificationProvider>
  );
}
