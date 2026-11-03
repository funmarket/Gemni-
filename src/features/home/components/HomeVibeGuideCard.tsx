import React, { useState } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { CommunityHandbookModal } from './CommunityHandbookModal';

interface HomeVibeGuideCardProps {
  onOpenCompass?: () => void;
  triggerHaptic?: (style: 'light' | 'medium' | 'heavy') => void;
  triggerAlert?: (title: string, message: string, type?: string) => void;
  onNavigate?: (tab: string) => void;
}

export const HomeVibeGuideCard: React.FC<HomeVibeGuideCardProps> = ({
  onOpenCompass,
  triggerHaptic = () => {},
  triggerAlert = () => {},
  onNavigate,
}) => {
  const [showHandbookModal, setShowHandbookModal] = useState(false);

  return (
    <>
      <div 
        onClick={() => {
          triggerHaptic('medium');
          setShowHandbookModal(true);
        }}
        className="bg-[#1A181C] border border-white/5 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-500/30 transition-all active:scale-[0.99] select-none text-left shadow-lg group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-white text-sm font-bold group-hover:text-purple-300 transition-colors">VIBE Guide Handbook</h4>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">+15 VQ</span>
            </div>
            <p className="text-[#8E8E93] text-[11px] font-medium mt-0.5">Community principles, slow-restoration culture & Voyager Compass</p>
          </div>
        </div>
        <button 
          type="button" 
          className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 px-3.5 py-1.5 rounded-xl text-purple-300 font-bold tracking-tight text-[11px] outline-none transition-colors"
        >
          OPEN
        </button>
      </div>

      <CommunityHandbookModal
        isOpen={showHandbookModal}
        onClose={() => setShowHandbookModal(false)}
        triggerHaptic={triggerHaptic}
        triggerAlert={triggerAlert}
        onNavigate={onNavigate}
      />
    </>
  );
};
