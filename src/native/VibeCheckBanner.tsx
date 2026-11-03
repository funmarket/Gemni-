import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VibeCheck } from './vibeCheckService';

interface VibeCheckBannerProps {
  check: VibeCheck;
  challengerUsername: string;
  challengerAvatarUri: string;
  onAccept: (check: VibeCheck) => void;    // opens VibeShotResponse
  onDecline: (check: VibeCheck) => void;   // dismisses without penalty
}

export const VibeCheckBanner: React.FC<VibeCheckBannerProps> = ({
  check,
  challengerUsername,
  challengerAvatarUri,
  onAccept,
  onDecline
}) => {
  const [activeCheck, setActiveCheck] = useState<VibeCheck>(check);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const queueRef = useRef<VibeCheck[]>([]);
  const lastPropIdRef = useRef<string>(check.id);

  // Synchronize banner when prop changes (Queueing mechanism)
  useEffect(() => {
    if (check.id !== lastPropIdRef.current) {
      lastPropIdRef.current = check.id;
      if (isVisible) {
        // Queue secondary incoming checks to avoid clobbering active user timers
        queueRef.current.push(check);
      } else {
        // If banner was invisible, show this new one immediately
        setActiveCheck(check);
        setIsVisible(true);
      }
    }
  }, [check, isVisible]);

  // Handle countdown Timer tick (drift-safe using precise timestamp difference)
  useEffect(() => {
    if (!isVisible || !activeCheck) return;

    const calcTime = () => {
      const now = Date.now();
      const diff = activeCheck.expires_at - now;
      if (diff <= 0) {
        setTimeRemaining(0);
        handleAutoDismiss();
      } else {
        setTimeRemaining(diff);
      }
    };

    calcTime(); // run instantly
    const timer = setInterval(calcTime, 1000);

    return () => clearInterval(timer);
  }, [activeCheck, isVisible]);

  const handleNextInQueue = () => {
    if (queueRef.current.length > 0) {
      const nextCheck = queueRef.current.shift()!;
      setActiveCheck(nextCheck);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const handleAutoDismiss = () => {
    // Graceful slide-out without penalties
    setIsVisible(false);
    setTimeout(() => {
      handleNextInQueue();
    }, 250);
  };

  const handleIgnore = () => {
    onDecline(activeCheck);
    setIsVisible(false);
    setTimeout(() => {
      handleNextInQueue();
    }, 250);
  };

  const handleProveIt = () => {
    onAccept(activeCheck);
    // Don't hide the banner so they can see background details if overlay closes, 
    // but typically clicking triggers full-screen camera coverage.
  };

  if (!isVisible || !activeCheck) {
    return null;
  }

  // Format MM:SS representation
  const totalSeconds = Math.ceil(timeRemaining / 1000);
  const minutes = Math.max(0, Math.floor(totalSeconds / 60));
  const seconds = Math.max(0, totalSeconds % 60);
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          className="fixed top-3 left-0 right-0 z-50 px-3 max-w-md mx-auto select-none"
        >
          <div className="bg-gradient-to-r from-[#7B2FBE] to-[#C650E8] border border-white/20 rounded-2xl p-4 shadow-[0_10px_25px_rgba(123,47,190,0.3)] text-left space-y-3">
            
            {/* Row 1: Profile identity header */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="text-2xl w-8 h-8 rounded-full border border-white bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {challengerAvatarUri || '🔥'}
                </span>
                <span className="absolute -bottom-1 -right-1 text-[10px]">🚨</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white font-bold tracking-tight">
                  @{challengerUsername || 'match'} is checking your vibe 👀
                </p>
                <p className="text-[10px] text-purple-200 uppercase font-bold tracking-wider font-mono">
                  Incoming VibeCheck
                </p>
              </div>
            </div>

            {/* Row 2: Challenge message */}
            <div className="bg-black/20 rounded-lg px-3 py-2 border border-white/5">
              <p className="text-xs text-purple-50,85 italic font-medium">
                &ldquo;{activeCheck.prompt}&rdquo;
              </p>
            </div>

            {/* Row 3: Action strip - Left countdown, right button cluster */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-bold text-white bg-black/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 min-w-[75px] justify-center shadow-inner">
                ⏱️ {formattedCountdown}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleIgnore}
                  className="bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-semibold text-white px-3 py-1.5 rounded-full cursor-pointer transition-all"
                >
                  Ignore
                </button>
                <button
                  type="button"
                  onClick={handleProveIt}
                  className="bg-white hover:bg-zinc-100 active:scale-95 text-xs text-[#7B2FBE] font-bold px-4 py-1.5 rounded-full cursor-pointer transition-all shadow-sm"
                >
                  Prove It 💪
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
