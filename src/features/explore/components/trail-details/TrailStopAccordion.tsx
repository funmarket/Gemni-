import React, { useState } from 'react';
import { Clock, Lightbulb, MapPin, Navigation, ExternalLink, ChevronRight } from 'lucide-react';
import { TrailStop, TimeOfDay } from '../../types';
import { cn } from '@/lib/utils';

interface TrailStopAccordionProps {
  stops: TrailStop[];
  onCenterRadar: (coords: { lat: number; lng: number }, label: string) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

const getTimeOfDayBadge = (time?: TimeOfDay) => {
  switch (time) {
    case 'morning':
      return { label: 'Morning', emoji: '🌅', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' };
    case 'afternoon':
      return { label: 'Afternoon', emoji: '☀️', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300' };
    case 'sunset':
      return { label: 'Sunset', emoji: '🌇', color: 'border-orange-500/30 bg-orange-500/10 text-orange-300' };
    case 'night':
      return { label: 'Night', emoji: '🌙', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300' };
    default:
      return { label: 'Anytime', emoji: '✨', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' };
  }
};

export const TrailStopAccordion: React.FC<TrailStopAccordionProps> = ({
  stops,
  onCenterRadar,
  fireHaptic,
}) => {
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);

  const formatStopLocation = (stop: TrailStop) => {
    if (stop.lat && stop.lng && (!stop.address || stop.address.trim() === '')) {
      return `${stop.lat},${stop.lng}`;
    }
    if (stop.placeName && stop.address && !stop.address.toLowerCase().includes(stop.placeName.toLowerCase())) {
      return `${stop.placeName}, ${stop.address}`;
    }
    return stop.address || stop.placeName || `${stop.lat},${stop.lng}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
          Curated Trail Itinerary ({stops.length} Stops)
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono">Tap stop for pro-tips</span>
      </div>

      <div className="space-y-2.5">
        {stops.map((stop, index) => {
          const isActive = activeStopIndex === index;
          const badge = getTimeOfDayBadge(stop.timeOfDay);
          const stopLocation = formatStopLocation(stop);
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stopLocation)}&travelmode=walking`;

          return (
            <div
              key={stop.id || index}
              className={cn(
                "border rounded-2xl transition-all overflow-hidden bg-[#16141a]",
                isActive ? "border-emerald-500/40 shadow-lg" : "border-white/5 hover:border-white/10"
              )}
            >
              <button
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  setActiveStopIndex(isActive ? null : index);
                }}
                className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{stop.placeName}</h4>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[200px] block">
                      {stop.address || 'Local checkpoint'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn("text-[9px] font-mono px-2 py-0.5 rounded-full border", badge.color)}>
                    {badge.emoji} {badge.label}
                  </span>
                  <ChevronRight className={cn("w-4 h-4 text-zinc-500 transition-transform", isActive && "rotate-90")} />
                </div>
              </button>

              {isActive && (
                <div className="p-3.5 pt-0 border-t border-white/5 space-y-3 bg-black/20 text-xs">
                  {stop.proTip && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{stop.proTip}</span>
                    </div>
                  )}

                  {stop.photoUrl && (
                    <img
                      src={stop.photoUrl}
                      alt={stop.placeName}
                      className="w-full h-36 object-cover rounded-xl border border-white/5"
                    />
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      Suggested: {stop.suggestedDurationMin || 45} mins
                    </span>

                    <div className="flex items-center gap-2">
                      {stop.lat && stop.lng && (
                        <button
                          type="button"
                          onClick={() => {
                            fireHaptic('medium');
                            onCenterRadar({ lat: stop.lat, lng: stop.lng }, stop.placeName);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3 text-emerald-400" /> Radar
                        </button>
                      )}
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-mono text-[10px] flex items-center gap-1 font-bold"
                      >
                        <ExternalLink className="w-3 h-3" /> Navigate
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
