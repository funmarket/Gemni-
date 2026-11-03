import React from 'react';
import { cn } from '@/lib/utils';
import { Venue } from '../types';
import { 
  getVenuePhoto, 
  getVenueConfidence, 
  getRawConfirmations, 
  getVenueMatchInfo 
} from '../utils/exploreHelpers';

interface VenueCardProps {
  v: Venue;
  profile: any;
  joinedCommunityIds: string[];
  scannedVenues: Record<string, boolean>;
  canValidateVenue: (v: Venue) => boolean;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  onClick: () => void;
  onValidateClick: (v: Venue) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  v,
  profile,
  joinedCommunityIds,
  scannedVenues,
  canValidateVenue,
  fireHaptic,
  onClick,
  onValidateClick,
}) => {
  if (!v || !v.id) {
    console.warn('VenueCard received undefined or invalid venue:', v);
    return null;
  }

  const isVerified = scannedVenues[v.id];
  const confidence = getVenueConfidence(v);
  const confirmations = getRawConfirmations(v);
  const matchInfo = getVenueMatchInfo(v, profile, joinedCommunityIds);
  const photo = getVenuePhoto(v.name, v.category);
  const isLocked = !canValidateVenue(v);

  return (
    <div 
      onClick={onClick}
      className="bg-[#101625]/60 hover:bg-[#182136]/60 border border-blue-500/10 hover:border-blue-500/25 rounded-[22px] p-4 flex gap-4 cursor-pointer active:scale-[0.99] transition-all relative overflow-hidden group shadow-lg"
    >
      {/* Photo component (local/Google matching with fallback banner) */}
      <div className="w-[100px] h-[100px] rounded-xl overflow-hidden shrink-0 relative bg-zinc-900 border border-white/5 shadow-inner">
        <img 
          src={photo} 
          alt={v.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <span className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md text-[9.5px] text-amber-300 font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
          ⭐️ {v.rating}
        </span>
      </div>

      {/* Text content details */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div className="space-y-1">
          {/* Category and Rarity row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] text-[#d5ead6] font-black uppercase tracking-wider">
              {v.category || "CULTURE"}
            </span>
            {v.rarity === 'LEGENDARY' ? (
              <span className="bg-amber-500/10 text-[#fbbf24] border border-amber-500/20 text-[8px] font-black uppercase rounded px-1.5 py-0.2 tracking-wider">
                LEGENDARY
              </span>
            ) : v.rarity === 'RARE' ? (
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[8px] font-black uppercase rounded px-1.5 py-0.2 tracking-wider">
                RARE
              </span>
            ) : (
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[8px] font-black uppercase rounded px-1.5 py-0.2 tracking-wider">
                COMMON
              </span>
            )}
            {/* Fallback AI Vibe Match Score Badge */}
            <span className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[8.5px] font-black uppercase rounded px-1.5 py-0.2 tracking-wider flex items-center gap-0.5 shadow-sm">
              ✨ {matchInfo.score}% Match
            </span>
          </div>

          <h4 className="font-extrabold text-[15px] sm:text-[16px] text-white leading-snug truncate group-hover:text-blue-400 transition-colors">
            {v.name}
          </h4>

          <p className="text-[11.5px] text-zinc-400 truncate flex items-center gap-1 font-semibold">
            <span>📍</span> {v.address || "Main Street Coordinate Cluster"}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-1.5 mt-1 gap-2">
          <span className="text-[11px] text-zinc-500 font-bold font-mono">
            {v.distance} km • {v.visitors} visits
          </span>
          <div className="flex items-center gap-1.5 select-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isLocked) return;
                fireHaptic('medium');
                onValidateClick(v);
              }}
              className={cn(
                !isLocked
                  ? "bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/30 text-[#a78bfa] cursor-pointer"
                  : "bg-zinc-800/60 border border-zinc-700/30 text-zinc-500 opacity-50 cursor-not-allowed",
                "rounded-md px-2 py-0.5 text-[9.5px] font-black flex items-center gap-1 transition-all active:scale-95"
              )}
              disabled={isLocked}
            >
              {!isLocked ? `🛡️ Validate (${confidence}% | ${confirmations} confirmations)` : `🔒 Locked`}
            </button>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10.5px] font-black tracking-wider rounded-md px-1.5 py-0.5">
              +{v.pts} PTS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
