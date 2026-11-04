import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Venue } from '../types';
import { getVenuePhoto, getVenueConfidence, getRawConfirmations, getVenueVibe, getVenueMatchInfo } from '../utils/exploreHelpers';
import { getVenueMayor, getUserBadges, getCheckInStreak } from '@/features/share-good-vibes/utils/gamification';
import { venueCheckInStore } from '@/services/venueCheckInStore';
import { vibeGatheringStore } from '@/services/vibeGatheringStore';

interface VenueDetailSheetProps {
  selectedVenue: Venue;
  handleSelectVenue: (v: Venue | null) => void;
  coords: { lat: number; lng: number } | null;
  scannedVenues: Record<string, boolean>;
  handleVerifyVenue: (v: Venue) => void;
  canValidateVenue: (v: Venue) => boolean;
  setValidatingVenue: (v: Venue | null) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  profile: any;
  getScrollHideStyles: () => React.CSSProperties;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

export const VenueDetailSheet: React.FC<VenueDetailSheetProps> = ({
  selectedVenue,
  handleSelectVenue,
  coords,
  scannedVenues,
  handleVerifyVenue,
  canValidateVenue,
  setValidatingVenue,
  fireHaptic,
  profile,
  getScrollHideStyles,
  modalRef,
}) => {
  // Localize tabs and meetup form states
  const [detailTab, setDetailTab] = useState<'info' | 'mayor' | 'gatherings'>('info');
  const [showGatheringForm, setShowGatheringForm] = useState(false);
  const [gatheringTitle, setGatheringTitle] = useState('');
  const [gatheringDesc, setGatheringDesc] = useState('');
  const [gatheringTime, setGatheringTime] = useState('Starting in 30m');
  const [, setRefreshTrigger] = useState(0);

  const forceUpdate = () => setRefreshTrigger((prev) => prev + 1);

  const currentUserId = profile?.id || 'current_user';
  const currentUserName = `@${profile?.handle || 'me'}`;
  const currentUserAvatar = profile?.avatar || '🎒';
  const gatherings = vibeGatheringStore.getGatheringsForVenue(selectedVenue.id);

  const handleCreateGathering = () => {
    if (!gatheringTitle.trim() || !gatheringDesc.trim()) return;
    vibeGatheringStore.addGathering({
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      title: gatheringTitle.trim(),
      description: gatheringDesc.trim(),
      hostId: currentUserId,
      hostName: currentUserName,
      hostAvatar: currentUserAvatar,
      timeLabel: gatheringTime || 'Starting in 30m',
      capacity: 10,
      rsvps: [{ userId: currentUserId, userName: currentUserName, userAvatar: currentUserAvatar }]
    });
    fireHaptic('heavy');
    setShowGatheringForm(false);
    setGatheringTitle('');
    setGatheringDesc('');
    forceUpdate();
  };

  const handleRsvpToggle = (gatheringId: string) => {
    const userObj = { userId: currentUserId, userName: currentUserName, userAvatar: currentUserAvatar };
    const success = vibeGatheringStore.toggleRsvp(gatheringId, userObj);
    if (success) {
      fireHaptic('medium');
      forceUpdate();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[4px] p-4 transition-all duration-300"
      style={getScrollHideStyles()}
    >
      {/* Dismiss on click outside */}
      <div className="absolute inset-0 -z-10" onClick={() => handleSelectVenue(null)} />

      <div 
        ref={modalRef as any}
        className="bg-[#101625] border border-blue-900/40 w-full max-w-md rounded-[28px] shadow-2xl relative overflow-hidden"
        style={{ 
          borderTop: `4px solid ${
            selectedVenue.rarity === 'LEGENDARY' ? '#fbbf24' : selectedVenue.rarity === 'RARE' ? '#8b5cf6' : '#3b82f6'
          }`,
          paddingBottom: 'env(safe-area-inset-bottom, 24px)'
        }}
      >
        {/* Dynamic Wide Hero Photo Banner inside the detail sheet */}
        <div className="h-44 w-full relative overflow-hidden bg-black/40 border-b border-blue-500/10">
          <img 
            src={getVenuePhoto(selectedVenue.name, selectedVenue.category)} 
            alt={selectedVenue.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101625] via-transparent to-black/25" />
          
          {/* Category Floated on Banner */}
          <span className="absolute bottom-3.5 left-4 text-[10.5px] font-black bg-emerald-500 text-black rounded-lg px-2.5 py-1 uppercase tracking-wider shadow-md">
            {selectedVenue.category}
          </span>

          <button 
            type="button"
            onClick={() => handleSelectVenue(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all border-none outline-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-left max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Header Element detailing name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 select-none">
              <span className="text-2xl">{selectedVenue.emoji}</span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black uppercase rounded-[6px] px-2 py-0.5 tracking-wider">
                {selectedVenue.rarity} SPOT
              </span>
            </div>
            <h3 className="font-extrabold text-[22px] text-white leading-tight break-words">
              {selectedVenue.name}
            </h3>
          </div>

          {/* Custom Swarm & Meetup Sub-Tab Bar */}
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-white/5 text-[11px] font-black select-none">
            <button
              type="button"
              onClick={() => { fireHaptic('light'); setDetailTab('info'); }}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer",
                detailTab === 'info' 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              ℹ️ Info
            </button>
            <button
              type="button"
              onClick={() => { fireHaptic('light'); setDetailTab('mayor'); }}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1",
                detailTab === 'mayor' 
                  ? "bg-purple-600 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              👑 Mayor & Badges
            </button>
            <button
              type="button"
              onClick={() => { fireHaptic('light'); setDetailTab('gatherings'); }}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1",
                detailTab === 'gatherings' 
                  ? "bg-emerald-600 text-white shadow-sm" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              👥 Meetups ({gatherings.length})
            </button>
          </div>

          {/* TAB CONTENT: INFO */}
          {detailTab === 'info' && (
            <div className="space-y-2 text-[14px] text-zinc-300 leading-relaxed">
              <div className="flex items-center gap-1 text-[#FFD60A] font-extrabold text-base select-none">
                <Star className="w-5 h-5 fill-[#FFD60A]" />
                <span>{selectedVenue.rating} Out of 5.0</span>
                <span className="text-zinc-500 text-[13px] font-semibold pl-1">({selectedVenue.visitors} check-ins)</span>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-300 font-semibold text-[13px] pt-1 select-none">
                <span className="text-[#a78bfa]">🛡️</span>
                <span>Vibe Confidence:</span>
                <span className={cn(
                  getVenueConfidence(selectedVenue) >= 80 ? "text-emerald-400" : getVenueConfidence(selectedVenue) >= 50 ? "text-amber-400" : "text-rose-400",
                  "font-extrabold font-mono"
                )}>
                  {getVenueConfidence(selectedVenue)}% ({getRawConfirmations(selectedVenue)} confirmations)
                </span>
              </div>
              
              <p className="font-bold text-white flex items-center gap-1.5 pt-1">
                <span>📍</span> {selectedVenue.address || "Main Street Coordinate Cluster"}
              </p>

              <p className="text-zinc-400 font-medium text-xs">
                This location has been mapped on OpenStreetMap. You are currently located {selectedVenue.distance} km away from this spot. Verified by VibeQuest community nodes.
              </p>

              {/* Fallback AI Vibe Match Score Card */}
              {(() => {
                const matchInfo = getVenueMatchInfo(selectedVenue, profile);
                return (
                  <div className="mt-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <span className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">AI Vibe Match Score</span>
                      </div>
                      <span className="text-lg font-black font-mono text-fuchsia-400">{matchInfo.score}% Match</span>
                    </div>
                    
                    {/* Progress bar matching */}
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${matchInfo.score}%` }}
                      />
                    </div>

                    {/* Breakdown factors */}
                    <div className="space-y-1.5 pt-1 text-left">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider block">Match Relevance Breakdown:</span>
                      {matchInfo.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-zinc-400">
                          <span className="flex items-center gap-1">
                            <span className="text-fuchsia-500 text-[9px]">●</span> {item.label}
                          </span>
                          <span className="text-zinc-500 font-mono">+{item.value}%</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10.5px] text-zinc-500 leading-relaxed italic border-t border-white/5 pt-1.5 text-left">
                      Based on interests, active community circles, recent check-ins, and local lifestyle sync. Offline-resilient engine active.
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB CONTENT: MAYOR & BADGES */}
          {detailTab === 'mayor' && (() => {
            const checkIns = venueCheckInStore.getCheckIns();
            const mayor = getVenueMayor(selectedVenue.id, currentUserId, checkIns);
            const userBadges = getUserBadges(currentUserId, checkIns, scannedVenues);
            const streak = getCheckInStreak(venueCheckInStore.getCheckInsForUser(currentUserId));

            return (
              <div className="space-y-4 text-zinc-300 text-left">
                {/* Mayor card */}
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9.5px] font-black text-purple-300 tracking-wider uppercase block">
                        🏆 VENUE MAYOR OF THE SPOT
                      </span>
                      <h4 className="font-black text-white text-[15px] flex items-center gap-1.5">
                        <span className="text-lg">{mayor.userAvatar}</span>
                        <span>{mayor.userName}</span>
                        {mayor.isCurrentUser && (
                          <span className="text-[9px] bg-purple-500/35 text-purple-200 border border-purple-500/20 px-1.5 py-0.5 rounded font-black tracking-wider">
                            YOU!
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl block">👑</span>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">{mayor.checkInCount} check-ins</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-zinc-400 leading-normal font-semibold">
                    {mayor.isCurrentUser 
                      ? "You sovereignly rule this spot! Check in more to secure your throne." 
                      : "Claim the throne! Be the node with the highest check-ins to crown yourself Mayor."}
                  </p>
                </div>

                {/* Streaks & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black text-zinc-400 tracking-wider uppercase">
                      🎖️ STREAKS & VIBE BADGES
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-0.5">
                      ⚡ {streak} Day Streak
                    </span>
                  </div>

                  <div className="max-h-44 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
                    {userBadges.map(badge => (
                      <div key={badge.id} className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all",
                        badge.unlocked 
                          ? "bg-amber-500/5 border-amber-500/20" 
                          : "bg-zinc-900/40 border-zinc-900/50"
                      )}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl shrink-0">{badge.unlocked ? badge.emoji : '🔒'}</span>
                          <div className="space-y-0.5">
                            <p className={cn("text-xs font-black", badge.unlocked ? "text-amber-300" : "text-zinc-500")}>
                              {badge.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 leading-normal">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold text-zinc-500 font-mono">
                            {badge.progress}/{badge.totalNeeded}
                          </p>
                          {badge.unlocked && (
                            <span className="text-[8.5px] text-emerald-400 font-black uppercase tracking-wider block">
                              Unlocked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB CONTENT: GATHERINGS */}
          {detailTab === 'gatherings' && (
            <div className="space-y-3.5 text-zinc-300 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black text-zinc-400 tracking-wider uppercase">
                  👥 POP-UP GATHERINGS (MEETUPS)
                </span>
                {!showGatheringForm && (
                  <button
                    type="button"
                    onClick={() => { fireHaptic('light'); setShowGatheringForm(true); }}
                    className="text-[9.5px] bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-[#3DDC6C] font-black rounded-lg px-2.5 py-1 uppercase tracking-wider cursor-pointer active:scale-95 transition-all outline-none"
                  >
                    + Launch Pop-up
                  </button>
                )}
              </div>

              {showGatheringForm ? (
                <div className="bg-zinc-950/40 border border-zinc-800 p-4 rounded-2xl space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Meeting Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Chatting about music / side-projects"
                      value={gatheringTitle}
                      onChange={(e) => setGatheringTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800/80 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-zinc-700 font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Gathering Description</label>
                    <textarea
                      placeholder="e.g. Sitting by the front desk with a green laptop bag. Let's talk tech & design!"
                      value={gatheringDesc}
                      onChange={(e) => setGatheringDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800/80 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-zinc-700 font-semibold resize-none text-left"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">When?</label>
                      <select
                        value={gatheringTime}
                        onChange={(e) => setGatheringTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800/80 text-xs text-white rounded-xl px-2 py-2.5 outline-none focus:border-zinc-700 font-semibold"
                      >
                        <option value="Starting in 15m">Starting in 15m</option>
                        <option value="Starting in 30m">Starting in 30m</option>
                        <option value="Starting in 1h">Starting in 1h</option>
                        <option value="Live Now ⚡">Live Now ⚡</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowGatheringForm(false)}
                        className="px-3 py-2 rounded-xl text-[10px] font-extrabold text-zinc-400 bg-zinc-800/40 border border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!gatheringTitle.trim() || !gatheringDesc.trim()}
                        onClick={handleCreateGathering}
                        className="px-3.5 py-2 rounded-xl text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/20 disabled:opacity-40 cursor-pointer transition-all active:scale-95"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              ) : gatherings.length === 0 ? (
                <div className="py-7 px-4 bg-zinc-900/10 border border-zinc-900/40 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center">
                  <span className="text-2xl animate-pulse">👥</span>
                  <p className="text-xs font-bold text-zinc-400">No active pop-ups at this spot yet</p>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-[240px]">
                    Host a 2-hour Pop-up Vibe Gathering right now so others checking in can RSVP and meet you!
                  </p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800 text-left">
                  {gatherings.map(g => {
                    const isUserJoined = g.rsvps.some(r => r.userId === currentUserId);
                    return (
                      <div key={g.id} className="bg-zinc-900/30 border border-zinc-900/70 rounded-2xl p-3.5 space-y-3 text-left relative overflow-hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <h5 className="text-[12.5px] font-black text-white leading-snug">
                              {g.title}
                            </h5>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                              {g.description}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 shrink-0 uppercase tracking-wide">
                            {g.timeLabel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-zinc-800/40 pt-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl shrink-0" title={`Hosted by ${g.hostName}`}>{g.hostAvatar}</span>
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">HOST</p>
                              <p className="text-[10.5px] font-extrabold text-zinc-300">{g.hostName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Facepile of RSVPs */}
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {(g.rsvps || []).slice(0, 3).map((r, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center text-[10px] select-none" title={r.userName}>
                                  {r.userAvatar}
                                </div>
                              ))}
                              {(g.rsvps?.length || 0) > 3 && (
                                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-950 flex items-center justify-center text-[8px] text-zinc-400 font-black">
                                  +{(g.rsvps?.length || 0) - 3}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRsvpToggle(g.id)}
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider h-6 px-2.5 rounded-lg border cursor-pointer active:scale-95 transition-all flex items-center justify-center",
                                isUserJoined
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300"
                                  : "bg-emerald-500 text-black border-none hover:brightness-110"
                              )}
                            >
                              {isUserJoined ? "Leave" : "Join"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Checkin / verification trigger */}
          <div className="pt-2 space-y-2 select-none">
            {scannedVenues[selectedVenue.id] ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-[#3DDC6C] font-semibold py-3 px-4 rounded-full text-center text-[14px] flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-[#3DDC6C]" /> Checked-in & points allocated successfully!
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => handleVerifyVenue(selectedVenue)}
                className="w-full bg-emerald-500/10 text-[#3DDC6C] border border-emerald-500/20 hover:bg-emerald-500/15 active:scale-[0.98] py-3.5 text-center text-[14px] font-bold rounded-full transition-all cursor-pointer outline-none flex items-center justify-center gap-1.5 bg-transparent"
              >
                Check-in to Gain +{selectedVenue.pts} PTS
              </button>
            )}
            
            <button 
              type="button"
              onClick={() => {
                if (!canValidateVenue(selectedVenue)) return;
                fireHaptic('medium');
                setValidatingVenue(selectedVenue);
              }}
              className={cn(
                canValidateVenue(selectedVenue)
                  ? "bg-purple-500/20 hover:bg-purple-500/30 text-[#a78bfa] border border-purple-500/30 hover:border-purple-500/50 cursor-pointer"
                  : "bg-zinc-800/60 text-zinc-500 border border-zinc-700/30 opacity-50 cursor-not-allowed",
                "w-full active:scale-[0.98] py-3 text-center text-[14px] font-bold rounded-full transition-all outline-none flex items-center justify-center gap-1.5"
              )}
              disabled={!canValidateVenue(selectedVenue)}
            >
              {canValidateVenue(selectedVenue) ? "🛡️ Vibe Validate Spot (Waze-style)" : "🔒 Vibe Validate (Locked - Check-in or be within 200m)"}
            </button>
            
            {/* Premium deemed blue View Map button */}
            <button
              type="button"
              onClick={() => {
                fireHaptic('medium');
                const latVal = selectedVenue.lat || selectedVenue.latitude || (coords?.lat ?? 36.8065);
                const lngVal = selectedVenue.lon || selectedVenue.longitude || (coords?.lng ?? 10.1815);
                const osmUrl = `https://www.openstreetmap.org/?mlat=${latVal}&mlon=${lngVal}#map=16/${latVal}/${lngVal}`;
                window.open(osmUrl, '_blank');
              }}
              className="w-full bg-blue-500/10 hover:bg-blue-500/15 text-[#3b82f6] border border-blue-500/20 hover:border-blue-500/35 active:scale-[0.98] py-3 text-center text-[14px] font-bold rounded-full transition-all cursor-pointer outline-none flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#3b82f6]" />
              View Map & Directions
            </button>
            
            <button
              type="button"
              onClick={() => handleSelectVenue(null)}
              className="w-full bg-transparent hover:bg-white/5 border border-white/5 text-white font-semibold py-3 text-center text-[14px] rounded-full transition-all outline-none"
            >
              Close Spot Details
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VenueDetailSheet;
