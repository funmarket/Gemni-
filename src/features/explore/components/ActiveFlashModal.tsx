import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Shield, MessageSquare, Image, Ticket, Car, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { safeLocalStorage } from '@/shared/services/storage/safeLocalStorage';

interface ActiveFlashModalProps {
  activeFlashModal: any | null;
  setActiveFlashModal: React.Dispatch<React.SetStateAction<any | null>>;
  coords: { lat: number; lng: number } | null;
  setCoords: React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | null>>;
  profile: any;
  updateProfilePoints?: (pts: number) => Promise<any>;
  setFlashEvents: React.Dispatch<React.SetStateAction<any[]>>;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

const CIRCLE_FRIENDS = ["Elena Vance", "Marcus Brody", "Alex Rivera", "David Chen", "Chloe Frazer"];

export const ActiveFlashModal: React.FC<ActiveFlashModalProps> = ({
  activeFlashModal,
  setActiveFlashModal,
  coords,
  setCoords,
  profile,
  updateProfilePoints,
  setFlashEvents,
  fireHaptic,
}) => {
  if (!activeFlashModal) return null;

  const handleToggleRsvp = (type: 'interested' | 'going') => {
    fireHaptic('medium');
    const currentUser = profile?.displayName || "Sarah J.";
    const eventId = activeFlashModal.id;

    setFlashEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventId) {
          let interested = Array.isArray(event.interestedUsers) ? [...event.interestedUsers] : [];
          let going = Array.isArray(event.goingUsers) ? [...event.goingUsers] : [];

          if (type === 'interested') {
            if (interested.includes(currentUser)) {
              interested = interested.filter(u => u !== currentUser);
            } else {
              interested.push(currentUser);
              going = going.filter(u => u !== currentUser);
            }
          } else if (type === 'going') {
            if (going.includes(currentUser)) {
              going = going.filter(u => u !== currentUser);
            } else {
              going.push(currentUser);
              interested = interested.filter(u => u !== currentUser);
            }
          }
          return { ...event, interestedUsers: interested, goingUsers: going };
        }
        return event;
      });
      try {
        safeLocalStorage.setItem('vq_flash_events', updated);
      } catch (e) {
        console.error("Error setting flash events:", e);
      }
      return updated;
    });

    setActiveFlashModal((prev: any) => {
      if (!prev) return null;
      let interested = Array.isArray(prev.interestedUsers) ? [...prev.interestedUsers] : [];
      let going = Array.isArray(prev.goingUsers) ? [...prev.goingUsers] : [];

      if (type === 'interested') {
        if (interested.includes(currentUser)) {
          interested = interested.filter(u => u !== currentUser);
        } else {
          interested.push(currentUser);
          going = going.filter(u => u !== currentUser);
        }
      } else if (type === 'going') {
        if (going.includes(currentUser)) {
          going = going.filter(u => u !== currentUser);
        } else {
          going.push(currentUser);
          interested = interested.filter(u => u !== currentUser);
        }
      }
      return { ...prev, interestedUsers: interested, goingUsers: going };
    });
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distanceKm = coords 
    ? getDistance(coords.lat, coords.lng, activeFlashModal.targetLat, activeFlashModal.targetLng)
    : 999;
  const distanceMeters = Math.round(distanceKm * 1000);
  const isWithinRange = distanceMeters <= 50;

  const handleClaimReward = async () => {
    if (!coords) {
      alert("We couldn't acquire your hardware GPS. Please enable geolocation.");
      return;
    }

    if (!isWithinRange) {
      alert(`Oops! You are currently ${distanceMeters}m away. You must get within 50m of the secret coordinates to check-in.`);
      return;
    }

    try {
      if (updateProfilePoints) {
        await updateProfilePoints(activeFlashModal.reward);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const ledgerActivities = safeLocalStorage.getItem<any[]>('vq_ledger_activities', []);
      const newTx = {
        id: `tx-flash-${Date.now()}`,
        type: 'quest',
        amount: `+${activeFlashModal.reward} VQ`,
        sender: activeFlashModal.title,
        date: 'Just now'
      };
      safeLocalStorage.setItem('vq_ledger_activities', [newTx, ...ledgerActivities]);
    } catch (e) {
      console.error("Error storing flash to ledger:", e);
    }

    setFlashEvents(prev => prev.map(e => e.id === activeFlashModal.id ? { ...e, claimed: true } : e));
    setActiveFlashModal(prev => prev ? { ...prev, claimed: true } : null);
    
    fireHaptic('heavy');
  };

  const handleCheatMove = () => {
    fireHaptic('medium');
    setCoords({ lat: activeFlashModal.targetLat, lng: activeFlashModal.targetLng });
  };

  const interestedList = Array.isArray(activeFlashModal.interestedUsers) ? activeFlashModal.interestedUsers : [];
  const goingList = Array.isArray(activeFlashModal.goingUsers) ? activeFlashModal.goingUsers : [];
  const goingCount = goingList.length;
  const interestedCount = interestedList.length;
  const currentUser = profile?.displayName || "Sarah J.";
  const isUserInterested = interestedList.includes(currentUser);
  const isUserGoing = goingList.includes(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 overflow-y-auto">
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={() => {
          fireHaptic('light');
          setActiveFlashModal(null);
        }} 
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-[#0f1320] border border-red-500/25 rounded-[28px] p-7 max-w-sm w-full space-y-5 relative shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          type="button"
          onClick={() => {
            fireHaptic('light');
            setActiveFlashModal(null);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent border-none outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto text-5xl animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.65)] py-1 select-none">
          ⚡
        </div>

        {activeFlashModal.claimed ? (
          <div className="space-y-4 py-3 animate-in fade-in zoom-in duration-300 text-center">
            <div className="text-5xl">🎉</div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              REWARD CLAIMED!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
              You successfully traveled to the secret spot, validated the local culture scene, and claimed <strong>{activeFlashModal.reward} VQ</strong> points directly to your Purse!
            </p>
            <button
              type="button"
              onClick={() => {
                fireHaptic('light');
                setActiveFlashModal(null);
              }}
              className="w-full bg-[#ff4e5e] hover:bg-[#ff5f6e] text-white font-bold text-xs py-3.5 rounded-[18px] transition-all outline-none cursor-pointer border-none"
            >
              AWESOME!
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-1 text-center">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">
                Flash Event Detected!
              </h3>
              <h4 className="text-[#ff5f6e] font-bold text-lg">
                {activeFlashModal.title}
              </h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
              {activeFlashModal.description}
            </p>

            {(activeFlashModal.rules || activeFlashModal.comment || activeFlashModal.entryType || activeFlashModal.parking || activeFlashModal.transport || (activeFlashModal.photos && activeFlashModal.photos.length > 0)) && (
              <div className="bg-[#181d2a] border border-zinc-800/60 rounded-2xl p-4 text-left text-xs text-zinc-300 space-y-3.5 max-w-xs mx-auto">
                {activeFlashModal.creator && (
                  <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-800/40 pb-2">
                    <Users className="w-3.5 h-3.5 text-[#ff4e5e]" />
                    <span>Hosted by <strong className="text-white font-semibold">{activeFlashModal.creator}</strong></span>
                  </div>
                )}
                
                {activeFlashModal.rules && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-[#ff4e5e]" />
                      <span>Secret Rules:</span>
                    </div>
                    <p className="text-zinc-300 text-xs italic bg-black/20 px-2.5 py-1.5 rounded-xl border border-red-500/5 leading-relaxed">
                      "{activeFlashModal.rules}"
                    </p>
                  </div>
                )}

                {activeFlashModal.comment && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vibe Comment:</span>
                    </div>
                    <p className="text-zinc-300 text-xs italic bg-black/20 px-2.5 py-1.5 rounded-xl border border-blue-500/5 leading-relaxed">
                      "{activeFlashModal.comment}"
                    </p>
                  </div>
                )}

                {activeFlashModal.photos && activeFlashModal.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <Image className="w-3.5 h-3.5 text-[#ff4e5e]" />
                      <span>Secret Spot Photos:</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      {activeFlashModal.photos.map((src: string, idx: number) => (
                        <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-black/40">
                          <img src={src} alt={`Intel ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-zinc-800/40 text-[11px]">
                  <div className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-zinc-400">Entry:</span>
                    <strong className="text-white font-bold ml-0.5">
                      {activeFlashModal.entryType === 'paid' ? `$${activeFlashModal.price || '0'}` : 'Free'}
                    </strong>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-zinc-400">Parking:</span>
                    <strong className="text-white font-bold ml-0.5">{activeFlashModal.parking ? 'Yes' : 'No'}</strong>
                  </div>
                  
                  <div className="flex items-center gap-1 col-span-2">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-zinc-400">Transit:</span>
                    <strong className="text-white font-bold ml-0.5">{activeFlashModal.transport ? 'Nearby' : 'No direct'}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#121624] border border-zinc-800/80 rounded-2xl p-4 text-left space-y-3 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
                <span className="flex items-center gap-1.5 uppercase tracking-wide text-[10px] text-zinc-400">
                  <Users className="w-3.5 h-3.5 text-[#ff4e5e]" /> RSVP STATUS
                </span>
                <span className="text-[10px] font-mono text-[#ff5f6e]">
                  {goingCount} Going • {interestedCount} Interested
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRsvp('interested')}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer flex items-center justify-center gap-1.5",
                    isUserInterested
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                      : "bg-[#161b2b] border-zinc-800 text-zinc-400 hover:text-white"
                  )}
                >
                  ⭐ {isUserInterested ? 'Interested' : 'Interested?'}
                </button>
                
                <button
                  type="button"
                  onClick={() => handleToggleRsvp('going')}
                  className={cn(
                    "py-2 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer flex items-center justify-center gap-1.5",
                    isUserGoing
                      ? "bg-green-500/15 border-green-500/40 text-green-400"
                      : "bg-[#161b2b] border-zinc-800 text-zinc-400 hover:text-white"
                  )}
                >
                  ✓ {isUserGoing ? 'Going' : 'Going?'}
                </button>
              </div>

              {(goingCount > 0 || interestedCount > 0) && (
                <div className="border-t border-zinc-800/60 pt-2.5 space-y-2 text-[11px] text-zinc-400 leading-normal">
                  {goingCount > 0 && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-300">Going ({goingCount}):</span>
                      <p className="leading-relaxed">
                        {goingList.map((u, i) => {
                          const isSelf = u === currentUser;
                          const isFriend = CIRCLE_FRIENDS.includes(u);
                          const isCreator = currentUser === activeFlashModal.creator;
                          
                          let content;
                          if (isSelf) content = <span className="text-white font-bold">You</span>;
                          else if (isFriend) content = <span className="text-green-400 font-medium">{u} 🟢</span>;
                          else if (isCreator) content = <span className="text-white font-medium">{u} (Attendee)</span>;
                          else content = <span className="text-zinc-500 italic">Secret Explorer</span>;

                          return (
                            <React.Fragment key={i}>
                              {content}{i < goingCount - 1 ? ", " : ""}
                            </React.Fragment>
                          );
                        })}
                      </p>
                    </div>
                  )}
                  
                  {interestedCount > 0 && (
                    <div className="space-y-0.5">
                      <span className="font-semibold text-zinc-300">Interested ({interestedCount}):</span>
                      <p className="leading-relaxed">
                        {interestedList.map((u, i) => {
                          const isSelf = u === currentUser;
                          const isFriend = CIRCLE_FRIENDS.includes(u);
                          const isCreator = currentUser === activeFlashModal.creator;

                          let content;
                          if (isSelf) content = <span className="text-white font-bold">You</span>;
                          else if (isFriend) content = <span className="text-amber-400 font-medium">{u} 🟢</span>;
                          else if (isCreator) content = <span className="text-white font-medium">{u} (Interested)</span>;
                          else content = <span className="text-zinc-500 italic">Secret Explorer</span>;

                          return (
                            <React.Fragment key={i}>
                              {content}{i < interestedCount - 1 ? ", " : ""}
                            </React.Fragment>
                          );
                        })}
                      </p>
                    </div>
                  )}

                  {currentUser === activeFlashModal.creator && (
                    <div className="bg-[#ff4e5e]/5 border border-[#ff4e5e]/20 rounded-xl p-2.5 text-[10px] text-[#ff5f6e] mt-1 text-center font-bold">
                      👑 Creator View: You have complete clearance to see all real attendee names!
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 border border-zinc-800/60 rounded-2xl p-4 text-left font-mono text-[10.5px] text-zinc-400 space-y-2">
                <div className="flex justify-between">
                  <span>🗺️ Target GPS:</span>
                  <span className="text-white font-semibold">
                    {activeFlashModal.targetLat.toFixed(5)}, {activeFlashModal.targetLng.toFixed(5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>📡 Live GPS:</span>
                  <span className={cn("font-semibold", coords ? "text-white" : "text-yellow-500")}>
                    {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Unavailable"}
                  </span>
                </div>
                <div className="border-t border-zinc-800/40 my-1 pt-1.5 flex justify-between items-center">
                  <span>🚧 Current Range:</span>
                  <span className={cn("font-black text-xs", isWithinRange ? "text-green-400" : "text-red-400")}>
                    {coords ? `${distanceMeters}m` : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>🎯 Proximity Gate:</span>
                  <span className={cn("font-black", isWithinRange ? "text-green-400" : "text-red-400")}>
                    {isWithinRange ? "✔️ ACTIVE (< 50m)" : "❌ BLOCKED (>= 50m)"}
                  </span>
                </div>
              </div>

              <div className="bg-[#4a121a]/30 border border-red-500/20 text-red-300 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-mono">
                🎁 Reward: {activeFlashModal.reward} VQ • ⏰ {Math.floor(activeFlashModal.timeLeft / 60)}m left
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleClaimReward}
                  className={cn(
                    "w-full font-black text-xs py-4 rounded-2xl transition-all cursor-pointer outline-none uppercase tracking-widest border-2",
                    isWithinRange
                      ? "bg-green-500 border-green-400 text-black hover:bg-green-600 hover:border-green-500"
                      : "bg-[#1f1a23] border-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}
                >
                  Claim {activeFlashModal.reward} VQ Tokens! ⚡
                </button>

                {!isWithinRange && (
                  <button
                    type="button"
                    onClick={handleCheatMove}
                    className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-[10px] py-2 px-4 rounded-xl border border-orange-500/20 transition-all font-mono uppercase tracking-widest cursor-pointer outline-none"
                  >
                    🚀 Cheat: Teleport within 50m range
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActiveFlashModal;
