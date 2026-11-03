import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Community {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  members: number;
  description: string;
  creator: string;
  tag: 'love' | 'kindness' | 'help';
  category: string;
  isPrivate?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

interface VibeCirclesPanelProps {
  showAllCommunities: boolean;
  setShowAllCommunities: (val: boolean) => void;
  sortedCommunities: Community[];
  joinedCommunityIds: string[];
  handleJoinToggle: (c: Community) => void;
  setActiveChatroomCommunity: (c: Community | null) => void;
  setShowCreateCommunity: (val: boolean) => void;
  currentUserLat: number | null;
  currentUserLng: number | null;
  getDistanceInKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  triggerHaptic: (type: string) => void;
  filteredCommunities: Community[];
}

export const VibeCirclesPanel: React.FC<VibeCirclesPanelProps> = ({
  showAllCommunities,
  setShowAllCommunities,
  sortedCommunities,
  joinedCommunityIds,
  handleJoinToggle,
  setActiveChatroomCommunity,
  setShowCreateCommunity,
  currentUserLat,
  currentUserLng,
  getDistanceInKm,
  triggerHaptic,
  filteredCommunities
}) => {
  return (
    <div id="communities-section" className="bg-[#0b0c10] border border-zinc-900 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-[#f43f5e]">
            <Users className="w-5 h-5 text-[#f43f5e]" />
          </span>
          <span className="text-[18px] font-bold text-white tracking-tight">Vibe Circles & Communities</span>
        </div>

        <button 
          onClick={() => {
            triggerHaptic('medium');
            setShowCreateCommunity(true);
          }}
          className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          Create
        </button>
      </div>

      <p className="text-[14px] text-zinc-400 mt-0.5 leading-relaxed">
        Discover stable, recurring local interest circles and Vibe Circles focused on shared presence.
      </p>

      {/* Communities controller */}
      <div className="pt-1">
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowAllCommunities(!showAllCommunities);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-zinc-950/30 border border-zinc-900 hover:border-zinc-800 flex items-center justify-center gap-2 text-[14px] font-semibold text-rose-455 hover:text-rose-400 transition-all text-center cursor-pointer"
        >
          {showAllCommunities ? 'Hide Communities' : `View All Local Communities (${filteredCommunities.length})`}
          <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", showAllCommunities && "rotate-90")} />
        </button>
      </div>

      <AnimatePresence>
        {showAllCommunities && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3 pt-3"
          >
            {sortedCommunities.map((c) => {
              const isJoined = joinedCommunityIds.includes(c.id);
              return (
                <div 
                  key={c.id} 
                  onClick={() => {
                    triggerHaptic('medium');
                    if (!isJoined) {
                      handleJoinToggle(c);
                    }
                    setActiveChatroomCommunity(c);
                  }}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-start gap-4 hover:border-rose-500/25 hover:bg-zinc-90 w-full hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none"
                >
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                    {c.emoji}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-[16px] text-zinc-100 truncate">{c.name}</h4>
                        <p className="text-xs text-zinc-500 font-medium font-sans">
                          @{c.handle} • {c.members} active citizens
                          {currentUserLat && currentUserLng && c.latitude !== undefined && c.latitude !== null && (
                            <span className="text-rose-400 font-mono font-bold ml-2">
                              📍 {getDistanceInKm(currentUserLat, currentUserLng, c.latitude, c.longitude || 0).toFixed(2)}km
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinToggle(c);
                        }}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border",
                          isJoined 
                            ? "bg-zinc-900 text-zinc-500 border-zinc-850"
                            : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 border-rose-500/20"
                        )}
                      >
                        {isJoined ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                    <p className="text-[14px] leading-relaxed font-normal text-zinc-400 mt-1 font-sans">{c.description}</p>
                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>Initiator: {c.creator}</span>
                      {c.isPrivate && <span className="bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 rounded uppercase font-black text-[9px]">Invite-Only</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredCommunities.length === 0 && (
              <div className="py-6 text-center text-zinc-500 text-[14px]">
                No communities found under this focus filter. Press 'Create' to register the first!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
