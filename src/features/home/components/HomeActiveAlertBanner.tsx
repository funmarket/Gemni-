import React from 'react';
import { motion } from 'motion/react';
import { VenetianMask, Clock, Plus } from 'lucide-react';

interface HomeActiveAlertBannerProps {
  flashEvents: any[];
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  setShowFlashListModal: (val: boolean) => void;
  setShowCreateFlashModal: (val: boolean) => void;
}

export const HomeActiveAlertBanner: React.FC<HomeActiveAlertBannerProps> = ({
  flashEvents,
  triggerHaptic,
  setShowFlashListModal,
  setShowCreateFlashModal,
}) => {
  const activeEvent = flashEvents.find(e => !e.claimed);

  if (!activeEvent) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="vibe-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
      >
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2 text-primary font-display">
            <VenetianMask className="w-4 h-4 text-vibe-primary" />
            <span className="font-extrabold text-[15px] tracking-tight">
              Flash Event Alert!
            </span>
          </div>
          <p className="text-xs text-secondary break-words whitespace-normal text-left">
            All local secrets have been claimed. Got an after-hours spot, poker game, or secret party to share?
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setShowCreateFlashModal(true);
          }}
          className="vibe-pill-btn-secondary gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Create Flash
        </button>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="vibe-card p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 text-left"
    >
      <div className="space-y-2.5 text-left max-w-xl">
        {/* Header Row */}
        <div className="flex items-center gap-2 font-display">
          <VenetianMask className="w-4 h-4 text-vibe-primary shrink-0" />
          <span className="text-primary font-extrabold text-[15px] tracking-tight">
            Flash Event Alert!
          </span>
        </div>
        
        {/* Description */}
        <p className="text-xs text-secondary font-normal leading-relaxed break-words whitespace-normal text-left">
          <span className="font-semibold text-primary">{activeEvent.title}</span> – {activeEvent.description}
        </p>
        
        {/* Reward & Countdown info */}
        <div className="flex items-center gap-3 text-xs font-semibold text-vibe-secondary">
          <span>
            Reward: {activeEvent.reward} VIBE Points
          </span>
          <span className="text-secondary font-normal">•</span>
          <span className="text-secondary font-normal flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-vibe-secondary/85" /> {Math.floor(activeEvent.timeLeft / 60)}m left
          </span>
        </div>
      </div>

      {/* CTA Hunt Pill Button and Create Button below it */}
      <div className="shrink-0 flex flex-col items-stretch md:items-end justify-center gap-2 min-w-[130px]">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setShowFlashListModal(true);
          }}
          className="vibe-pill-btn-primary gap-1"
        >
          Hunt Now! 🏃
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setShowCreateFlashModal(true);
          }}
          className="vibe-pill-btn-secondary gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Create Flash
        </button>
      </div>
    </motion.div>
  );
};
export default HomeActiveAlertBanner;
