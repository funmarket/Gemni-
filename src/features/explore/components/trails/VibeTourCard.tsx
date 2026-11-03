import React from 'react';
import { motion } from 'motion/react';
import { Shield, Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import { VibeTrail } from '../../types';

interface VibeTourCardProps {
  tour: VibeTrail;
  onSelectTour: (tour: VibeTrail) => void;
  onOpenReservation: (tour: VibeTrail) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const VibeTourCard: React.FC<VibeTourCardProps> = ({
  tour,
  onSelectTour,
  onOpenReservation,
  fireHaptic,
}) => {
  const price = tour.tourDetails?.price || 85;
  const duration = tour.tourDetails?.duration || '6h';
  const meetingPoint = tour.tourDetails?.meetingPoint || 'Hotel pickup included';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-[330px] shrink-0 bg-[#16141D] border border-purple-500/30 rounded-2xl overflow-hidden flex flex-col transition-all group shadow-xl"
    >
      <div
        className="h-[155px] w-full relative bg-cover bg-center cursor-pointer overflow-hidden"
        style={{
          backgroundImage: `url(${
            tour.imageUrl ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop'
          })`,
        }}
        onClick={() => {
          fireHaptic('light');
          onSelectTour(tour);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-purple-900/90 backdrop-blur-md border border-purple-500/40 text-purple-200 font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md">
            <Shield className="w-3 h-3 text-amber-300" />
            Pro Guided Tour
          </span>
          {tour.city && (
            <span className="bg-black/70 backdrop-blur-md border border-white/10 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
              {tour.city}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 bg-amber-500/90 text-black font-mono font-black text-xs px-2.5 py-1 rounded-xl shadow-lg border border-amber-300 flex items-center gap-0.5">
          <span>${price}</span>
          <span className="text-[9px] uppercase font-bold opacity-80">flat</span>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold text-white">
          <span className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 text-[10px] text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {duration}
          </span>
          <span className="bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-300" /> Private Experience
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3">
        <div
          className="space-y-1.5 cursor-pointer"
          onClick={() => {
            fireHaptic('light');
            onSelectTour(tour);
          }}
        >
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Guaranteed Direct Host</span>
          </div>

          <h3 className="font-extrabold text-[15px] text-white tracking-tight leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
            {tour.tourDetails?.tourTitle || tour.name}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 pt-0.5">
            "{tour.tourDetails?.about || tour.story}"
          </p>

          <div className="text-[10px] text-zinc-400 font-mono pt-1">
            <span className="text-zinc-500">Pickup:</span> {meetingPoint}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5 select-none">
          <div className="flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold truncate max-w-[130px]">
              <div className="w-5 h-5 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] shrink-0">
                🛡️
              </div>
              <span className="truncate">{tour.authorName}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fireHaptic('medium');
                  onOpenReservation(tour);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-md"
              >
                <Calendar className="w-3 h-3" />
                Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
