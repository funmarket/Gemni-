import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { PreMadeTour } from '../types';

interface GuardianToursListProps {
  tours: PreMadeTour[];
  onBookTour: (tour: PreMadeTour) => void;
}

export const GuardianToursList: React.FC<GuardianToursListProps> = ({ tours, onBookTour }) => {
  if (!tours || tours.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pre-Made Bookable Tours</span>
        </h5>
        <span className="text-[10px] font-mono text-emerald-400">Direct Reservation</span>
      </div>

      <div className="space-y-3">
        {tours.map((tour) => (
          <div key={tour.id} className="bg-[#181520] border border-white/10 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h4 className="font-extrabold text-sm text-white">{tour.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed font-sans">{tour.description}</p>
              </div>
              <span className="bg-amber-500/15 text-amber-300 font-mono text-xs font-black px-2.5 py-1 rounded-xl border border-amber-500/30 shrink-0">
                {tour.price}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-400" />
                {tour.duration}
              </span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-emerald-400" />
                {tour.meetingPoint}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onBookTour(tour)}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Calendar className="w-3.5 h-3.5" /> Book Tour Slot
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
