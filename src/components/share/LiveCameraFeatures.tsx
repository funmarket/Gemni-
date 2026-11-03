import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Zap, Clock, Sparkles, X, Send } from 'lucide-react';
import { useVibeCheck } from '../../native/useVibeCheck';
import { useVibeFlashWindow } from '../../native/useVibeFlashWindow';

interface LiveCameraFeaturesProps {
  onLiveVibeShotPress?: () => void;
}

export const LiveCameraFeatures: React.FC<LiveCameraFeaturesProps> = ({
  onLiveVibeShotPress = () => {},
}) => {
  const { outgoingPending, fireCheck } = useVibeCheck();
  const { 
    isWindowOpen, 
    triggerVibeFlash, 
    denyVibeFlash, 
    secondsRemaining 
  } = useVibeFlashWindow();
  
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [promptText, setPromptText] = useState("Show us your current view 👀");

  // Haptic feedback utility
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
      console.warn('Haptic feedback not available');
    }
  };

  const formatSecondsToMMSS = (totalSecs: number | null): string => {
    if (totalSecs === null || totalSecs < 0) return "03:00";
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFireVibeCheck = async () => {
    triggerHaptic('heavy');
    try {
      // Challenging 'demo_neon_fox_id' (representing @demo_neon_fox)
      await fireCheck('demo_neon_fox_id', promptText);
      setShowChallengeModal(false);
    } catch (error) {
      console.error("Failed to fire VibeCheck challenge:", error);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Three Feature Cards Row */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Card 1: Live Vibe Shot */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            onLiveVibeShotPress();
          }}
          className="flex flex-col items-start p-3 bg-zinc-950/40 hover:bg-zinc-900 border border-zinc-900 rounded-[18px] text-left transition-all active:scale-97 cursor-pointer min-h-[96px] justify-between"
        >
          <div className="w-6 h-6 bg-rose-500/10 rounded-lg flex items-center justify-center border border-rose-500/15">
            <Camera className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold text-white tracking-tight">Live Vibe Shot</h4>
            <p className="text-[8px] text-zinc-500 mt-0.5 leading-tight">Camera only — no uploads</p>
          </div>
        </button>

        {/* Card 2: VibeCheck */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setShowChallengeModal((prev) => !prev);
          }}
          className="flex flex-col items-start p-3 bg-zinc-950/40 hover:bg-zinc-900 border border-zinc-900 rounded-[18px] text-left transition-all active:scale-97 cursor-pointer min-h-[96px] justify-between"
        >
          <div className="w-6 h-6 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/15">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold text-white tracking-tight">VibeCheck</h4>
            <p className="text-[8px] text-zinc-500 mt-0.5 leading-tight">5-min live response</p>
          </div>
        </button>

        {/* Card 3: Vibe Flash */}
        <button
          onClick={async () => {
            triggerHaptic('medium');
            if (isWindowOpen) {
              onLiveVibeShotPress();
            } else {
              try {
                await triggerVibeFlash();
              } catch (e) {
                console.error("Failed to trigger spontaneous flash:", e);
              }
            }
          }}
          className={`flex flex-col items-start p-3 border rounded-[18px] text-left transition-all active:scale-97 cursor-pointer min-h-[96px] justify-between ${
            isWindowOpen 
              ? 'bg-amber-500/15 border-amber-500/30 animate-pulse' 
              : 'bg-zinc-950/40 hover:bg-zinc-900 border-zinc-900'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
            isWindowOpen 
              ? 'bg-amber-500/20 border-amber-500/40' 
              : 'bg-amber-500/10 border-amber-500/15'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${isWindowOpen ? 'text-amber-300' : 'text-amber-400'}`} />
          </div>
          <div>
            <h4 className="text-[11px] font-extrabold text-white tracking-tight">
              {isWindowOpen ? 'Flash Active!' : 'Vibe Flash'}
            </h4>
            <p className="text-[8px] mt-0.5 leading-tight text-amber-500/80 font-semibold">
              {isWindowOpen ? `${formatSecondsToMMSS(secondsRemaining)} left` : '3-min window'}
            </p>
          </div>
        </button>
      </div>

      {/* Vibe Flash Active Inline Card */}
      <AnimatePresence>
        {isWindowOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            className="w-full bg-[#1c1308] border border-amber-500/20 rounded-[28px] p-5 relative text-center space-y-4 shadow-xl select-none overflow-hidden"
          >
            <div className="text-center pt-0.5">
              <span className="text-amber-400 font-bold text-[11px] uppercase tracking-widest block font-sans">
                ⚡ Active VibeFlash Window
              </span>
            </div>

            <h3 className="text-2xl font-black text-white italic tracking-tight font-mono">
              ⏱️ {formatSecondsToMMSS(secondsRemaining)}
            </h3>

            <p className="text-[11px] text-zinc-400 max-w-[260px] mx-auto leading-relaxed">
              Capture your environment and selfie reaction right now to share your presence.
            </p>

            <div className="flex gap-3 pt-0.5 px-1">
              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  if (typeof onLiveVibeShotPress === 'function') {
                    onLiveVibeShotPress();
                  }
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-sans font-extrabold h-11 rounded-full text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-97 transition-all shadow-md cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-black" />
                <span>Capture Now</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('medium');
                  denyVibeFlash();
                }}
                className="flex-1 bg-transparent hover:bg-white/5 border border-zinc-700 text-zinc-200 font-sans font-bold h-11 rounded-full text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-97 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-zinc-400" />
                <span>Not Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VibeCheck Challenge Inline Container */}
      <AnimatePresence>
        {showChallengeModal && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full bg-[#12131a] border border-zinc-900 rounded-[28px] p-5 relative text-center space-y-4 shadow-xl select-none"
          >
            {/* Close button inside card (X) */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowChallengeModal(false);
              }}
              className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Centered "VibeCheck Challenge" with lavender color */}
            <div className="text-center pt-0.5">
              <span className="text-purple-300 font-bold text-[11px] uppercase tracking-widest block font-sans">
                VibeCheck Challenge
              </span>
            </div>

            {/* Centered Prompt Display Title */}
            <h3 className="text-lg font-bold text-zinc-100 tracking-tight text-center font-sans">
              {promptText}
            </h3>

            {/* Customizable Prompt Input Box */}
            <div className="w-full px-1">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                maxLength={60}
                className="w-full bg-[#08090d] border border-zinc-900 rounded-[14px] py-3.5 px-4 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-purple-500/40 transition-all font-sans text-center"
              />
            </div>

            {/* Status dynamic line with handle + outgoing pending count */}
            <div className="text-[11px] text-zinc-500 font-sans tracking-wide">
              Fire to <span className="text-[#a855f7]/70 font-semibold">@demo_neon_fox</span> —{' '}
              <span className="text-zinc-400 font-bold">{outgoingPending.length} outgoing pending</span>
            </div>

            {/* Big side-by-side action pills */}
            <div className="flex gap-3 pt-0.5 px-1">
              <button
                onClick={handleFireVibeCheck}
                disabled={promptText.trim().length === 0}
                className="flex-1 bg-[#00b87c] hover:bg-[#00a36c] disabled:opacity-40 text-black font-sans font-extrabold h-11 rounded-full text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-97 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-black transform rotate-[-30deg]" />
                <span>Fire VibeCheck</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('medium');
                  setShowChallengeModal(false);
                  onLiveVibeShotPress();
                }}
                className="flex-1 bg-[#202735] hover:bg-[#2a3447] text-zinc-200 font-sans font-bold h-11 rounded-full text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-97 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Self Capture</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
