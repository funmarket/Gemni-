import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VenetianMask } from 'lucide-react';
import { FlashEvent } from '../types';

interface ExploreSecretsBannerProps {
  flashEvents?: FlashEvent[];
  onOpenFlashList?: () => void;
  onSpawnFlash?: () => void;
  fireHaptic?: (style: 'light' | 'medium' | 'heavy') => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const ExploreSecretsBanner: React.FC<ExploreSecretsBannerProps> = ({
  flashEvents = [],
  onOpenFlashList = () => {},
  onSpawnFlash = () => {},
  fireHaptic = () => {},
}) => {
  const unclaimedEvents = (flashEvents || []).filter(ev => !ev?.claimed);

  return (
    <AnimatePresence>
      {unclaimedEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e0f14]/40 border border-[#ff4e5e]/10 rounded-[22px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full text-left"
        >
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-emerald-400">
              <VenetianMask className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-extrabold text-[15px] tracking-tight">
                Flash Event Alert!
              </span>
            </div>
            <p className="text-xs text-zinc-400 text-left">
              No active secrets board alerts right now. Try spawning a random alert to start your hunt!
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              fireHaptic('heavy');
              onSpawnFlash();
            }}
            className="border border-[#00ff00]/20 hover:bg-[#00ff00]/10 text-[#00ff00] font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 bg-transparent self-start sm:self-auto"
          >
            ⚡ Spawn Flash
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          className="bg-[#1e0f14] border border-[#ff4e5e]/15 rounded-[22px] p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(239,68,68,0.03)] text-left w-full"
        >
          <div className="space-y-2 text-left max-w-xl">
            <div className="flex items-center gap-2">
              <VenetianMask className="w-4 h-4 text-[#d5ead6] shrink-0" />
              <span className="text-white font-extrabold text-[15px] tracking-tight">
                Live Secrets Board ({unclaimedEvents.length} Active)
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal text-left">
              Exclusive underground sets, poker sessions, and pop-up events reported by local explorers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#ff5f6e] font-semibold">
              <span>⚡ Tap to hunt and claim VIBE point rewards</span>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            <button
              type="button"
              onClick={() => {
                fireHaptic('medium');
                onOpenFlashList();
              }}
              className="bg-[#d5ead6]/20 hover:bg-[#d5ead6]/35 text-[#d5ead6] border border-[#d5ead6]/30 font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-1 border-none outline-none"
            >
              Hunt Now! 🏃
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
