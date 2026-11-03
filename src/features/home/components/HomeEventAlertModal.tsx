import React from 'react';
import { motion } from 'motion/react';
import { X, Users, Shield, MessageSquare, Image, Ticket, Car, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDistance } from '@/features/home/utils/coordinateHelpers';

interface HomeEventAlertModalProps {
  showEventAlertModal: any;
  setShowEventAlertModal: (val: any) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  triggerAlert: (title: string, desc: string) => void;
  profile: any;
  latitude: number | null;
  longitude: number | null;
  setManualLocation: (cityName: string, coords: { lat: number; lng: number }) => void;
  handleToggleRsvp: (type: 'interested' | 'going') => void;
  handleClaimFlashReward: (event: any) => void;
  onNavigate?: (tab: string, search?: string, category?: string) => void;
}

export const HomeEventAlertModal: React.FC<HomeEventAlertModalProps> = ({
  showEventAlertModal,
  setShowEventAlertModal,
  triggerHaptic,
  triggerAlert,
  profile,
  latitude,
  longitude,
  setManualLocation,
  handleToggleRsvp,
  handleClaimFlashReward,
  onNavigate,
}) => {
  const CIRCLE_FRIENDS = ["Elena Vance", "Marcus Brody", "Alex Rivera", "David Chen", "Chloe Frazer"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[5px] p-4 overflow-y-auto">
      {/* Backdrop Dismiss */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={() => {
          triggerHaptic('light');
          setShowEventAlertModal(null);
        }} 
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 10 }}
        className="bg-[#0f1320] border border-red-500/25 rounded-[28px] p-7 max-w-sm w-full space-y-5 relative shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none text-center max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Absolute Close (X) button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setShowEventAlertModal(null);
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent border-none outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lightning Bolt Symbol */}
        <div className="mx-auto text-5xl animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.65)] py-1 select-none">
          ⚡
        </div>

        {showEventAlertModal.claimed ? (
          <div className="space-y-4 py-3 animate-in fade-in zoom-in duration-300 text-center">
            <div className="text-5xl">🎉</div>
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              REWARD CLAIMED!
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
              You successfully verified your location, checked into the scene, and claimed <strong>{showEventAlertModal.reward} VIBE</strong> points directly to your Purse!
            </p>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowEventAlertModal(null);
              }}
              className="w-full bg-[#ff4e5e] hover:bg-[#ff5f6e] text-white font-bold text-xs py-3.5 rounded-[18px] transition-all outline-none cursor-pointer border-none"
            >
              AWESOME!
            </button>
          </div>
        ) : showEventAlertModal.step === 'detect' ? (
          /* SCREEN 1: DETECTED ALERT */
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">
                Flash Event Detected!
              </h3>
              <h4 className="text-[#ff5f6e] font-bold text-lg">
                {showEventAlertModal.title}
              </h4>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
              {showEventAlertModal.description}
            </p>

            {/* Custom Event Info Grid (Rules, Comment, Parking, Transit, Price, Photos) */}
            {(showEventAlertModal.rules || showEventAlertModal.comment || showEventAlertModal.entryType || showEventAlertModal.parking || showEventAlertModal.transport || (showEventAlertModal.photos && showEventAlertModal.photos.length > 0)) && (
              <div className="bg-[#181d2a] border border-zinc-800/60 rounded-2xl p-4 text-left text-xs text-zinc-300 space-y-3.5 max-w-xs mx-auto">
                {showEventAlertModal.creator && (
                  <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-800/40 pb-2">
                    <Users className="w-3.5 h-3.5 text-[#ff4e5e]" />
                    <span>Hosted by <strong className="text-white font-semibold">{showEventAlertModal.creator}</strong></span>
                  </div>
                )}
                
                {showEventAlertModal.rules && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <Shield className="w-3.5 h-3.5 text-[#ff4e5e]" />
                      <span>Secret Rules:</span>
                    </div>
                    <p className="text-zinc-300 text-xs italic bg-black/20 px-2.5 py-1.5 rounded-xl border border-red-500/5 leading-relaxed text-left">
                      "{showEventAlertModal.rules}"
                    </p>
                  </div>
                )}

                {showEventAlertModal.comment && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vibe Comment:</span>
                    </div>
                    <p className="text-zinc-300 text-xs italic bg-black/20 px-2.5 py-1.5 rounded-xl border border-blue-500/5 leading-relaxed text-left">
                      "{showEventAlertModal.comment}"
                    </p>
                  </div>
                )}

                {/* Secret Spot Photos Horizontal Slider */}
                {showEventAlertModal.photos && showEventAlertModal.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider">
                      <Image className="w-3.5 h-3.5 text-[#ff4e5e]" />
                      <span>Secret Spot Photos:</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                      {showEventAlertModal.photos.map((src: string, idx: number) => (
                        <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-black/40">
                          <img src={src} alt={`Intel ${idx + 1}`} className="w-full h-full object-cover" />
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
                      {showEventAlertModal.entryType === 'paid' ? `$${showEventAlertModal.price || '0'}` : 'Free'}
                    </strong>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-zinc-400">Parking:</span>
                    <strong className="text-white font-bold ml-0.5">{showEventAlertModal.parking ? 'Yes' : 'No'}</strong>
                  </div>
                  
                  <div className="flex items-center gap-1 col-span-2">
                    <Compass className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-zinc-400">Transit:</span>
                    <strong className="text-white font-bold ml-0.5">{showEventAlertModal.transport ? 'Nearby' : 'No direct'}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* RSVP status & Interactivity Block */}
            {(() => {
              const interestedList = Array.isArray(showEventAlertModal.interestedUsers) ? showEventAlertModal.interestedUsers : [];
              const goingList = Array.isArray(showEventAlertModal.goingUsers) ? showEventAlertModal.goingUsers : [];
              const goingCount = goingList.length;
              const interestedCount = interestedList.length;
              const currentUser = profile?.displayName || "Sarah J.";
              const isUserInterested = interestedList.includes(currentUser);
              const isUserGoing = goingList.includes(currentUser);

              return (
                <div className="bg-[#121624] border border-zinc-800/80 rounded-2xl p-4 text-left space-y-3 max-w-xs mx-auto">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-bold">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide text-[10px] text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-[#ff4e5e]" /> RSVP STATUS
                    </span>
                    <span className="text-[10px] font-mono text-[#ff5f6e]">
                      {goingCount} Going • {interestedCount} Interested
                    </span>
                  </div>

                  {/* Going / Interested Toggle Buttons */}
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

                  {/* RSVP Lists */}
                  {(goingCount > 0 || interestedCount > 0) && (
                    <div className="border-t border-zinc-800/60 pt-2.5 space-y-2 text-[11px] text-zinc-400 leading-normal">
                      {goingCount > 0 && (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-zinc-300">Going ({goingCount}):</span>
                          <p className="leading-relaxed">
                            {goingList.map((u, i) => {
                              const isSelf = u === currentUser;
                              const isFriend = CIRCLE_FRIENDS.includes(u);
                              const isCreator = currentUser === showEventAlertModal.creator;
                              
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
                              const isCreator = currentUser === showEventAlertModal.creator;

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

                      {currentUser === showEventAlertModal.creator && (
                        <div className="bg-[#ff4e5e]/5 border border-[#ff4e5e]/20 rounded-xl p-2.5 text-[10px] text-[#ff5f6e] mt-1 text-center font-bold">
                          👑 Creator View: You have complete clearance to see all real attendee names!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Time Left Container */}
            <div className="bg-[#2d1217] border border-red-500/10 rounded-[18px] py-4 px-4 text-center max-w-xs mx-auto space-y-0.5">
              <div className="text-[12px] text-red-300 font-semibold">
                ⏰ Time Left: {Math.floor(showEventAlertModal.timeLeft / 60)}m remaining
              </div>
              <div className="text-sm text-white font-bold">
                Reward: <span className="text-[#facc15] font-extrabold">{showEventAlertModal.reward} VIBE Points</span>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowEventAlertModal(null);
                }}
                className="w-full bg-[#1e2330] hover:bg-[#252c3c] text-white font-bold text-xs py-3.5 rounded-[18px] transition-all cursor-pointer border-none outline-none"
              >
                Later
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setShowEventAlertModal(prev => ({ ...prev, step: 'checkin' }));
                }}
                className="w-full bg-gradient-to-r from-[#ff4e3a] to-[#ff7324] hover:brightness-110 text-white font-extrabold text-xs py-3.5 rounded-[18px] transition-all shadow-md active:scale-95 cursor-pointer outline-none border-none flex items-center justify-center gap-1"
              >
                Hunt Now! 🏃
              </button>
            </div>
          </div>
        ) : (
          /* SCREEN 2: GPS ACCURACY CHECK-IN GATE & TELEPORT */
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-[19px] text-white tracking-tight">
                Proximity Verification
              </h3>
              <h4 className="text-[#ff5f6e] font-bold text-xs">
                {showEventAlertModal.title}
              </h4>
            </div>

            {(() => {
              const devCoords = latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 36.8065, lng: 10.1815 };
              const distanceKm = getDistance(devCoords.lat, devCoords.lng, showEventAlertModal.targetLat, showEventAlertModal.targetLng);
              const distanceMeters = Math.round(distanceKm * 1000);
              const isWithinRange = distanceMeters <= 50;

              return (
                <div className="space-y-4 text-left">
                  <div className="bg-[#181d2a] border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">🎯 Target Venue:</span>
                      <span className="text-white font-bold font-mono">
                        {showEventAlertModal.targetLat.toFixed(4)}, {showEventAlertModal.targetLng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">📡 Your Location:</span>
                      <span className="text-white font-bold font-mono">
                        {devCoords.lat.toFixed(4)}, {devCoords.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="border-t border-zinc-800/80 my-1 pt-2 flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">🚧 Live Distance:</span>
                      <span className={cn("font-bold text-sm", isWithinRange ? "text-green-400" : "text-[#ff5f5f]")}>
                        {distanceMeters}m
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400 font-medium">🔒 Proximity Check:</span>
                      <span className={cn("font-bold", isWithinRange ? "text-green-400" : "text-[#ff5f5f]")}>
                        {isWithinRange ? "Within Range (< 50m)" : "Too Far (>= 50m)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isWithinRange) {
                          triggerAlert("⚠️ Too Far", `You are currently ${distanceMeters}m away from the target coordinates. Please simulate proximity or walk within range to claim your reward.`);
                          return;
                        }
                        handleClaimFlashReward(showEventAlertModal);
                      }}
                      className={cn(
                        "w-full font-extrabold text-xs py-3.5 rounded-[18px] transition-all cursor-pointer outline-none uppercase tracking-wider flex items-center justify-center gap-1.5",
                        isWithinRange
                          ? "bg-green-500 hover:bg-green-400 text-black border-none"
                          : "bg-[#1d2230] border border-zinc-800 text-zinc-500 cursor-not-allowed"
                      )}
                    >
                      Claim {showEventAlertModal.reward} VIBE Points! ⚡
                    </button>

                    {!isWithinRange && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setManualLocation("Simulated Event Area", { lat: showEventAlertModal.targetLat, lng: showEventAlertModal.targetLng });
                          triggerAlert("🚀 Location Updated!", "Simulator location set to match target venue! You are now within range to claim.");
                        }}
                        className="w-full bg-[#ff5f6e]/10 hover:bg-[#ff5f6e]/20 text-[#ff5f6e] font-bold text-[11px] py-2.5 px-4 rounded-[14px] border border-[#ff5f6e]/15 transition-all cursor-pointer outline-none"
                      >
                        🚀 Cheat: Simulate Location (Teleport)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowEventAlertModal(null);
                        onNavigate?.('explore');
                      }}
                      className="w-full text-zinc-400 hover:text-white font-semibold text-xs py-1.5 transition-all cursor-pointer flex items-center justify-center gap-1 border-none bg-transparent"
                    >
                      🧭 View Venue on Live Map
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default HomeEventAlertModal;
