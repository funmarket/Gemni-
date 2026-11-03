import React from 'react';
import { Star } from 'lucide-react';

interface Visitor {
  userId: string;
  userName: string;
  avatar: string;
}

interface VenueCard {
  venueId: string;
  venueName: string;
  rating: number;
  vibe: string;
  visitors: Visitor[];
}

interface VibeCheckInsScrollProps {
  currentVibe: string;
  venueCards: VenueCard[];
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  onNavigate?: (tab: string, search?: string, category?: string) => void;
}

export const VibeCheckInsScroll: React.FC<VibeCheckInsScrollProps> = ({
  currentVibe,
  venueCards,
  triggerHaptic,
  onNavigate
}) => {
  return (
    <div className="space-y-2 select-none text-left">
      <h3 className="text-[14px] font-extrabold text-primary font-display tracking-tight flex items-center gap-1.5 uppercase">
        Vibe Check-ins
      </h3>

      <div className="flex overflow-x-auto gap-3.5 no-scrollbar pb-1.5 -mx-4 px-4">
        {/* Card 1: Active Current Vibe (Bold orange highlighted border) */}
        <div className="vibe-card px-5 py-3 text-center min-w-[105px] shrink-0 flex flex-col justify-center border-vibe-primary/80">
          <span className="text-[9px] uppercase text-secondary font-extrabold tracking-widest block leading-none mb-1.5">Current Vibe</span>
          <span className="text-[17px] font-black uppercase text-vibe-primary tracking-wide block leading-none">{currentVibe}</span>
        </div>

        {/* Dynamically List Check-ins for followed users & matches */}
        {venueCards.map((vc) => {
          let accentColorClass = "text-vibe-primary";
          let starColorClass = "text-vibe-primary fill-vibe-primary";
          if (vc.vibe === "Hype" || vc.vibe === "Inspiring") {
            accentColorClass = "text-vibe-secondary";
            starColorClass = "text-vibe-secondary fill-vibe-secondary";
          } else if (vc.vibe === "Chilled" || vc.vibe === "Quiet") {
            accentColorClass = "text-cyan-500";
            starColorClass = "text-cyan-500 fill-cyan-500";
          }

          return (
            <div 
              key={vc.venueId} 
              onClick={() => {
                triggerHaptic('light');
                if (onNavigate) {
                  onNavigate('explore', vc.venueName);
                }
              }}
              className="vibe-card hover:brightness-110 py-3 px-4 min-w-[145px] shrink-0 text-left relative overflow-hidden flex flex-col justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-primary block truncate">{vc.venueName}</span>
                <span className={`text-[11px] ${accentColorClass} font-bold flex items-center gap-1 mt-0.5`}>
                  {vc.rating.toFixed(1)} <Star className={`w-3 h-3 ${starColorClass} inline`} /> {vc.vibe}
                </span>
              </div>
              
              {/* Overlapping friends profile indicators */}
              <div className="flex -space-x-1.5 overflow-hidden mt-3">
                {vc.visitors.map((visitor, visitorIdx) => (
                  <div 
                    key={`${vc.venueId}-${visitor.userId}-${visitorIdx}`} 
                    title={visitor.userName}
                    className="w-5 h-5 rounded-full border border-[var(--app-card-bg)] bg-elevated flex items-center justify-center text-[10px] text-primary"
                  >
                    {visitor.avatar}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {venueCards.length === 0 && (
          <div className="vibe-card py-3 px-4 min-w-[200px] shrink-0 text-left flex items-center justify-center gap-2 select-none">
            <span className="text-[17px]">🎒</span>
            <div>
              <span className="text-[10px] font-bold text-secondary block whitespace-nowrap">No outer check-ins yet</span>
              <span className="text-[8px] text-secondary/85 block">Follow explorers on the VibeCenter!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
