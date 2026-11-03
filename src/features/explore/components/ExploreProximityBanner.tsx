import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Venue } from '../types';
import { getVenueVibe } from '../utils/exploreHelpers';

interface ExploreProximityBannerProps {
  closestVenue: Venue | null;
  isDismissed: boolean;
  onValidate: (venue: Venue) => void;
  onDismiss: (venueId: string) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ExploreProximityBanner: React.FC<ExploreProximityBannerProps> = ({
  closestVenue,
  isDismissed,
  onValidate,
  onDismiss,
  fireHaptic
}) => {
  if (!closestVenue || isDismissed || closestVenue.distance > 0.20) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 text-left select-none relative z-40"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 animate-bounce text-lg">
            📍
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-amber-300 tracking-widest uppercase block animate-pulse">
              PROXIMITY DETECTED (WAZE-STYLE)
            </span>
            <p className="text-xs text-white font-extrabold truncate">
              You're near {closestVenue.name}!
            </p>
            <p className="text-[10.5px] text-zinc-300 font-medium">
              Confirm if the {getVenueVibe(closestVenue)} vibe is still matching.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            type="button"
            onClick={() => {
              fireHaptic('medium');
              onValidate(closestVenue);
            }}
            className="bg-[#d5ead6]/20 hover:bg-[#d5ead6]/35 text-[#d5ead6] border border-[#d5ead6]/30 active:scale-95 font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer outline-none"
          >
            Validate
          </button>
          <button
            type="button"
            onClick={() => {
              fireHaptic('light');
              onDismiss(closestVenue.id);
            }}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer border-none outline-none bg-transparent"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
