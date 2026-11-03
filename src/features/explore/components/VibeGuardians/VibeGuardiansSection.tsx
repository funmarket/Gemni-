import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { VibeGuardian } from './types';
import { 
  loadGuardians, isSelfieExpired, saveGuardians, recordHandshake 
} from './services/vibeGuardianStorage';
import { GuardianCard } from './GuardianCard';
import { GuardianDetailModal } from './GuardianDetailModal';
import { GuardianChatModal } from './GuardianChatModal';
import { InAppSelfieModal } from './InAppSelfieModal';
import { GuardiansHeroBanner } from './section/GuardiansHeroBanner';
import { ExpiredGuardiansInspector } from './section/ExpiredGuardiansInspector';

interface VibeGuardiansSectionProps {
  currentUserProfile?: any;
  fireHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
  onOpenTrail?: (trailTitleOrId: string) => void;
}

export const VibeGuardiansSection: React.FC<VibeGuardiansSectionProps> = ({
  currentUserProfile,
  fireHaptic = () => {},
  onOpenTrail,
}) => {
  const [activeTab, setActiveTab] = useState<'top' | 'pro' | 'local' | 'suggested'>('top');
  const [guardians, setGuardians] = useState<VibeGuardian[]>([]);
  const [selectedGuardian, setSelectedGuardian] = useState<VibeGuardian | null>(null);
  const [chatGuardian, setChatGuardian] = useState<VibeGuardian | null>(null);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [showExpirationInspector, setShowExpirationInspector] = useState(false);
  const [handshakeToast, setHandshakeToast] = useState<{ name: string; type: string } | null>(null);

  const userKey = currentUserProfile?.handle || currentUserProfile?.displayName || 'explorer_guest';

  const refreshList = () => {
    const list = loadGuardians();
    setGuardians(list);
  };

  useEffect(() => {
    refreshList();

    const handleHireEvent = (e: any) => {
      const { guardian, prompt } = e.detail || {};
      if (guardian) {
        setChatGuardian(guardian);
        if (prompt) setChatInitialPrompt(prompt);
      }
    };

    window.addEventListener('vq:hireGuardian', handleHireEvent);
    return () => window.removeEventListener('vq:hireGuardian', handleHireEvent);
  }, []);

  const handleHandshake = (guardian: VibeGuardian, actionType: 'hire' | 'vibe') => {
    fireHaptic('heavy');
    recordHandshake(guardian.id, userKey);
    refreshList();
    setHandshakeToast({ name: guardian.name, type: actionType === 'hire' ? 'Hire' : 'Vibe' });
    setTimeout(() => setHandshakeToast(null), 4000);
  };

  const handleExploreTrail = (trailTitleOrId: string) => {
    fireHaptic('medium');
    if (onOpenTrail) {
      onOpenTrail(trailTitleOrId);
    } else {
      window.dispatchEvent(new CustomEvent('vq:openTrail', { detail: { trailTitleOrId } }));
    }
  };

  const getVisibleGuardians = () => {
    const activeUnexpired = guardians.filter((g) => !isSelfieExpired(g));

    if (activeTab === 'top') {
      return activeUnexpired
        .filter((g) => g.type === 'pro' && g.hasActiveProSubscription)
        .sort((a, b) => b.hiresCount - a.hiresCount);
    }
    if (activeTab === 'pro') {
      return activeUnexpired.filter((g) => g.type === 'pro' && g.hasActiveProSubscription);
    }
    if (activeTab === 'local') {
      return activeUnexpired.filter((g) => g.type === 'local');
    }
    return activeUnexpired;
  };

  const visibleList = getVisibleGuardians();
  const expiredGuardians = guardians.filter((g) => isSelfieExpired(g));

  const handleRenewSelfie = (id: string) => {
    fireHaptic('medium');
    const updated = guardians.map((g) => {
      if (g.id !== id) return g;
      return { ...g, selfieCapturedAt: new Date().toISOString() };
    });
    saveGuardians(updated);
    setGuardians(updated);
  };

  return (
    <div className="space-y-4 select-none text-left relative">
      {handshakeToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-black/95 border-2 border-emerald-500/50 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 text-xs text-white fixed top-16 right-4 left-4 z-50 max-w-md mx-auto"
        >
          <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center text-lg shrink-0">
            🤝
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-extrabold text-emerald-400 block font-mono text-[11px] uppercase tracking-wide">
              Handshake Proof Established!
            </span>
            <p className="text-[11px] text-zinc-300 font-sans leading-tight">
              Official interaction proof recorded with <strong>{handshakeToast.name}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHandshakeToast(null)}
            className="text-zinc-500 hover:text-white"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Hero Banner */}
      <GuardiansHeroBanner
        onOpenSelfieModal={() => setIsSelfieModalOpen(true)}
        expiredCount={expiredGuardians.length}
        showExpirationInspector={showExpirationInspector}
        onToggleExpirationInspector={() => setShowExpirationInspector(!showExpirationInspector)}
      />

      {/* 7-Day Expiration Inspector */}
      {showExpirationInspector && (
        <ExpiredGuardiansInspector
          expiredGuardians={expiredGuardians}
          onRenewSelfie={handleRenewSelfie}
        />
      )}

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {(['top', 'pro', 'local'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              fireHaptic('light');
              setActiveTab(tab);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {tab === 'top' ? '⚡ Top Vibes' : tab === 'pro' ? '🛡️ Pro Guides' : '✨ Local Legends'}
          </button>
        ))}
      </div>

      {/* Cards Row */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 pt-1 w-full"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {visibleList.map((guardian) => (
          <GuardianCard
            key={guardian.id}
            guardian={guardian}
            tab={activeTab}
            onSelect={() => setSelectedGuardian(guardian)}
            onHandshake={(g, action) => handleHandshake(g, action)}
            onMessage={(g) => {
              setChatGuardian(g);
              setChatInitialPrompt('');
            }}
            onExploreTrail={(t) => handleExploreTrail(t)}
            fireHaptic={fireHaptic}
            currentUserProfile={currentUserProfile}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedGuardian && (
        <GuardianDetailModal
          guardian={selectedGuardian}
          onClose={() => setSelectedGuardian(null)}
          onMessage={(g) => {
            setSelectedGuardian(null);
            setChatGuardian(g);
          }}
          onExploreTrail={(t) => handleExploreTrail(t)}
          onReviewsUpdated={refreshList}
          currentUserProfile={currentUserProfile}
        />
      )}

      {chatGuardian && (
        <GuardianChatModal
          guardian={chatGuardian}
          onClose={() => setChatGuardian(null)}
          currentUserProfile={currentUserProfile}
          initialPrompt={chatInitialPrompt}
        />
      )}

      {isSelfieModalOpen && (
        <InAppSelfieModal
          isOpen={isSelfieModalOpen}
          onClose={() => setIsSelfieModalOpen(false)}
          currentUserProfile={currentUserProfile}
          onGuardianSaved={() => {
            refreshList();
            setIsSelfieModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
export default VibeGuardiansSection;
