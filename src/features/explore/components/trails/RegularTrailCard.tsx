import React from 'react';
import { motion } from 'motion/react';
import { Heart, Clock, Tag, GitFork, Shield } from 'lucide-react';
import { VibeTrail, TimeOfDay } from '../../types';
import { cn } from '@/lib/utils';

interface RegularTrailCardProps {
  trail: VibeTrail;
  userId?: string;
  onSelectTrail: (trail: VibeTrail) => void;
  onToggleSave: (id: string) => void;
  onHireGuardianForTrail: (trail: VibeTrail) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

const getTimeEmoji = (time?: TimeOfDay) => {
  switch (time) {
    case 'morning':
      return '🌅';
    case 'afternoon':
      return '☀️';
    case 'sunset':
      return '🌇';
    case 'night':
      return '🌙';
    default:
      return '✨';
  }
};

export const RegularTrailCard: React.FC<RegularTrailCardProps> = ({
  trail,
  userId,
  onSelectTrail,
  onToggleSave,
  onHireGuardianForTrail,
  fireHaptic,
}) => {
  const isSaved = userId && Array.isArray(trail.savedBy) ? trail.savedBy.includes(userId) : false;
  const stopCount = trail.totalStops || (trail.stops ? trail.stops.length : 1);
  const timeSequence =
    trail.stops && trail.stops.length > 0
      ? trail.stops.map((s) => getTimeEmoji(s.timeOfDay))
      : ['✨'];

  const totalMins = trail.totalEstimatedMinutes || (trail.stops ? trail.stops.length * 60 : 120);
  const hrs = Math.floor(totalMins / 60);
  const durationStr = hrs > 0 ? `~${hrs}h` : `${totalMins}m`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="w-[300px] shrink-0 bg-[#1A181C] border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all group shadow-md"
    >
      <div
        className="h-[145px] w-full relative bg-cover bg-center cursor-pointer overflow-hidden"
        style={{
          backgroundImage: `url(${
            trail.imageUrl ||
            'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop'
          })`,
        }}
        onClick={() => {
          fireHaptic('light');
          onSelectTrail(trail);
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="bg-zinc-950/80 backdrop-blur-md border border-white/15 text-white font-extrabold text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase">
            📍 {trail.category}
          </span>
          {trail.city && (
            <span className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/20 text-emerald-300 font-bold text-[9px] px-2 py-0.5 rounded-full">
              {trail.city}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fireHaptic('medium');
            onToggleSave(trail.id);
          }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-zinc-950/70 backdrop-blur-md border cursor-pointer',
            isSaved
              ? 'text-red-500 border-red-500/30 bg-red-500/10'
              : 'text-zinc-300 border-white/10 hover:text-white'
          )}
        >
          <Heart className={cn('w-4 h-4', isSaved && 'fill-red-500')} />
        </button>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold text-white">
          <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[10px] text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {durationStr}
          </span>
          <span className="bg-emerald-500/30 backdrop-blur-md border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-md text-[10px] font-black">
            {stopCount} Stops Circuit
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between text-left space-y-3">
        <div
          className="space-y-1.5 cursor-pointer"
          onClick={() => {
            fireHaptic('light');
            onSelectTrail(trail);
          }}
        >
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Flow:</span>
            <div className="flex items-center gap-0.5">
              {timeSequence.map((emoji, idx) => (
                <span key={idx} className="text-xs">
                  {emoji}
                  {idx < timeSequence.length - 1 && (
                    <span className="text-zinc-600 text-[10px] mx-0.5">➜</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <h3 className="font-extrabold text-[15px] text-white tracking-tight leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
            {trail.name}
          </h3>

          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 pt-0.5">
            "{trail.story}"
          </p>

          {trail.forkedFromAuthorName && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md truncate max-w-full">
                <GitFork className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                <span className="truncate">Adapted from @{trail.forkedFromAuthorName}</span>
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-white/5 select-none">
          <div className="flex flex-wrap gap-1">
            {(trail.vibeTags || []).slice(0, 3).map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-emerald-400"
              >
                <Tag className="w-2.5 h-2.5" />
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] gap-2">
            <div className="flex items-center gap-1.5 text-zinc-400 font-bold truncate max-w-[130px]">
              <div className="w-5 h-5 rounded-md bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] shrink-0">
                🎒
              </div>
              <span className="truncate">{trail.authorName}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fireHaptic('medium');
                  onHireGuardianForTrail(trail);
                }}
                className="text-[10px] font-black text-amber-300 hover:text-white bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-2.5 h-2.5 text-amber-400" />
                Hire
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fireHaptic('light');
                  onSelectTrail(trail);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition-all"
              >
                Explore now
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
