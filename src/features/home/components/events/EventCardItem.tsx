import React from 'react';
import { Calendar, MapPin, ChevronDown, ChevronUp, Star, Navigation } from 'lucide-react';
import { openDeviceMap } from '@/shared/browser/openExternalMap';

interface EventItem {
  id: string;
  name: string;
  loc: string;
  tag: string;
  date: string;
  type: 'live' | 'upcoming';
  addedBy: string;
}

interface EventCardItemProps {
  event: EventItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isRsvped: boolean;
  onToggleRsvp: () => void;
  photoUrl: string;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const EventCardItem: React.FC<EventCardItemProps> = ({
  event,
  isExpanded,
  onToggleExpand,
  isRsvped,
  onToggleRsvp,
  photoUrl,
  fireHaptic,
}) => {
  return (
    <div className="bg-[#15131A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all text-left">
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={photoUrl}
            alt={event.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/5 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {event.tag}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{event.date}</span>
            </div>
            <h4 className="text-xs font-extrabold text-white mt-0.5">{event.name}</h4>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-500" /> {event.loc}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fireHaptic('medium');
              onToggleRsvp();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              isRsvped
                ? 'bg-emerald-500 text-black'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10'
            }`}
          >
            {isRsvped ? 'Going ✓' : 'RSVP'}
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2.5 bg-black/20 text-xs">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span>Organized by: <strong className="text-white">{event.addedBy}</strong></span>
            <button
              type="button"
              onClick={() => openDeviceMap({ address: event.loc })}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px] cursor-pointer"
            >
              <Navigation className="w-3 h-3" /> Open in Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
