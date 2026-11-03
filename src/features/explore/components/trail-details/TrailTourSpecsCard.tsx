import React from 'react';
import { Shield, Clock, Users, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { TourDetails } from '../../types';

interface TrailTourSpecsCardProps {
  tour?: TourDetails;
  formattedDuration: string;
}

export const TrailTourSpecsCard: React.FC<TrailTourSpecsCardProps> = ({
  tour,
  formattedDuration,
}) => {
  return (
    <div className="bg-[#181522] border border-purple-500/30 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Pro Guardian Tour Specifications</span>
        </div>
        <span className="text-emerald-400 font-mono font-extrabold text-sm">
          ${tour?.price || 85} Flat Rate
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Duration</span>
          <span className="font-bold text-white flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> {tour?.duration || formattedDuration}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Party Capacity</span>
          <span className="font-bold text-white flex items-center gap-1">
            <Users className="w-3 h-3 text-cyan-400" /> Up to {tour?.maxPartySize || 4} Guests
          </span>
        </div>
      </div>

      {tour?.meetingPoint && (
        <div className="text-xs space-y-0.5 border-t border-white/5 pt-2">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">Meeting Location</span>
          <span className="text-zinc-200">{tour.meetingPoint}</span>
        </div>
      )}

      {tour?.whatsIncluded && tour.whatsIncluded.length > 0 && (
        <div className="text-xs space-y-1.5 border-t border-white/5 pt-2">
          <span className="text-[10px] text-zinc-400 uppercase font-mono block">What is Included</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tour.whatsIncluded.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
