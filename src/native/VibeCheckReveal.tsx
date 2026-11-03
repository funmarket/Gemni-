import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { VibeCheck } from './vibeCheckService';
import { useVibeCheck } from './useVibeCheck';

interface VibeCheckRevealProps {
  check: VibeCheck; // must have status === 'responded'
  challengedUsername: string;
  onReacted: () => void;
}

export const VibeCheckReveal: React.FC<VibeCheckRevealProps> = ({
  check,
  challengedUsername,
  onReacted
}) => {
  const { reactToCheck } = useVibeCheck();
  const [cityName, setCityName] = useState<string>("Resolving location...");
  const [selectedReaction, setSelectedReaction] = useState<'fire' | 'cap' | 'vibing' | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Drag and drop front selfie positional states
  const [frontPos, setFrontPos] = useState({ x: 16, y: 16 });
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0 });
  const posStartRef = React.useRef({ x: 16, y: 16 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingFront(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...frontPos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingFront) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(8, Math.min(220, posStartRef.current.x + dx));
    const nextY = Math.max(8, Math.min(180, posStartRef.current.y + dy));
    setFrontPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingFront(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Reverse geocoding for Match's verification location
  useEffect(() => {
    if (check.response_latitude === null || check.response_longitude === null) {
      setCityName("Discovered Area");
      return;
    }

    const reverseGeocode = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${check.response_latitude}&lon=${check.response_longitude}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'VibeQuest/1.0.0 (MobileReview; funmarketmn@gmail.com)'
          }
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (data && data.address) {
          const cityVal = data.address.city || 
                          data.address.town || 
                          data.address.village || 
                          data.address.suburb || 
                          data.address.county || 
                          "Discovered Area";
          setCityName(cityVal);
        } else {
          setCityName("Discovered Area");
        }
      } catch (err) {
        setCityName("Local Grid Coordinates");
      }
    };

    reverseGeocode();
  }, [check]);

  // Convert raw millisecond timestamp to highly descriptive elapse
  const formatElapsedTime = (timestamp: number | null): string => {
    if (!timestamp) return "Just now";
    const diffSecs = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSecs < 60) return "Just now";

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const handleReactionPress = async (reaction: 'fire' | 'cap' | 'vibing') => {
    if (selectedReaction) return; // prevent duplicate clicks
    setSelectedReaction(reaction);
    setErrorText(null);

    // Exact 600ms user verification delay to observe styling transition
    setTimeout(async () => {
      try {
        await reactToCheck(check.id, reaction);
        onReacted();
      } catch (err) {
        console.error('Failed to register challenge reaction:', err);
        setSelectedReaction(null);
        setErrorText("Couldn't save reaction. Please try again.");
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm select-none">
      {/* Background backing shield */}
      <div className="absolute inset-0" />

      {/* Sheet Content Box */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-md bg-[#1A1A2E] rounded-t-[28px] border-t border-white/10 px-5 pt-6 pb-9 flex flex-col gap-5 z-10 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] text-left"
      >
        {/* Top Centered Header */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-white tracking-tight">
            @{challengedUsername} proved their vibe 💪
          </h3>
          <p className="text-xs text-zinc-500 mt-1 italic">
            &ldquo;{check.prompt}&rdquo;
          </p>
        </div>

         {/* HIGH-FIDELITY PHOTO VIEW */}
         <div className="relative w-full aspect-[4/3] rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden shadow-inner flex items-center justify-center">
           {check.response_photo_uri ? (
             <img
               src={check.response_photo_uri}
               alt="Verification Response Video Snapshot"
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
           ) : (
             <div className="text-center p-6 text-zinc-600">
               <span className="text-3xl block mb-2">📸</span>
               <p className="text-xs">Loading Capture Stream Elements...</p>
             </div>
           )}

           {check.response_front_photo_uri && (
             <div 
               onPointerDown={handlePointerDown}
               onPointerMove={handlePointerMove}
               onPointerUp={handlePointerUp}
               style={{ left: `${frontPos.x}px`, top: `${frontPos.y}px` }}
               className="absolute w-18 h-24 rounded-xl border-2 border-rose-500/50 shadow-md overflow-hidden bg-black z-30 cursor-grab active:cursor-grabbing touch-none select-none"
             >
               <img 
                 src={check.response_front_photo_uri} 
                 alt="Response Reaction Selfie" 
                 referrerPolicy="no-referrer"
                 className="w-full h-full object-cover pointer-events-none"
               />
             </div>
           )}

          {/* Absolute info banner inside photo */}
          <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 border border-white/5 flex items-center justify-between text-white text-[11px] font-medium leading-none">
            <span className="text-[#8E8E93]">📍 {cityName}</span>
            <span className="text-zinc-400">🕒 {formatElapsedTime(check.response_timestamp)}</span>
          </div>
        </div>

        {/* THREE REACTION BUTTONS ROW */}
        <div className="flex gap-2.5 items-center justify-between">
          
          {/* Reaction 1: 🔥 Fire */}
          <button
            type="button"
            onClick={() => handleReactionPress('fire')}
            className={`flex-1 rounded-xl py-3.5 text-center font-bold text-sm tracking-wide transition-all border ${
              selectedReaction === 'fire'
                ? 'bg-[#FF453A] border-[#FF453A] text-black shadow-[0_4px_15px_rgba(255,69,58,0.3)] scale-[1.03]'
                : selectedReaction !== null
                ? 'opacity-30 border-white/5 bg-[#252540] text-zinc-500'
                : 'bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 border-[#FF453A]/30 text-[#FF453A] cursor-pointer'
            }`}
          >
            🔥 Fire
          </button>

          {/* Reaction 2: 🧢 Cap */}
          <button
            type="button"
            onClick={() => handleReactionPress('cap')}
            className={`flex-1 rounded-xl py-3.5 text-center font-bold text-sm tracking-wide transition-all border ${
              selectedReaction === 'cap'
                ? 'bg-[#FF9F0A] border-[#FF9F0A] text-white shadow-[0_4px_15px_rgba(255,159,10,0.3)] scale-[1.03]'
                : selectedReaction !== null
                ? 'opacity-30 border-white/5 bg-[#252540] text-zinc-500'
                : 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border-[#FF9F0A]/30 text-[#FF9F0A] cursor-pointer'
            }`}
          >
            🧢 Cap
          </button>

          {/* Reaction 3: ✨ Vibing */}
          <button
            type="button"
            onClick={() => handleReactionPress('vibing')}
            className={`flex-1 rounded-xl py-3.5 text-center font-bold text-sm tracking-wide transition-all border ${
              selectedReaction === 'vibing'
                ? 'bg-[#d5ead6] border-[#d5ead6] text-black shadow-[0_4px_15px_rgba(213,234,214,0.3)] scale-[1.03]'
                : selectedReaction !== null
                ? 'opacity-30 border-white/5 bg-[#252540] text-zinc-500'
                : 'bg-[#d5ead6]/10 hover:bg-[#d5ead6]/20 active:scale-95 border-[#d5ead6]/30 text-[#d5ead6] cursor-pointer'
            }`}
          >
            ✨ Vibing
          </button>

        </div>

        {/* CAP DESCRIPTION ALWAYS VISIBLE */}
        <p className="text-[11px] text-[#636366] text-center font-medium tracking-tight">
          🧢 Cap = calling BS on their vibe
        </p>

        {/* Error strip displays */}
        {errorText && (
          <p className="text-xs text-rose-500 font-semibold text-center mt-1">
            ⚠️ {errorText}
          </p>
        )}

      </motion.div>
    </div>
  );
};
