import React from 'react';
import { Sparkles, MapPin, ChevronDown, ChevronUp, Navigation } from 'lucide-react';
import { openDeviceMap } from '@/shared/browser/openExternalMap';

interface LiveActivity {
  id: string;
  text: string;
  location: string;
  emoji: string;
  author?: string;
  date?: string;
}

interface ActivityCardItemProps {
  activity: LiveActivity;
  isExpanded: boolean;
  onToggleExpand: () => void;
  resonancesCount: number;
  onBoostResonance: () => void;
  photoUrl: string;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ActivityCardItem: React.FC<ActivityCardItemProps> = ({
  activity,
  isExpanded,
  onToggleExpand,
  resonancesCount,
  onBoostResonance,
  photoUrl,
  fireHaptic,
}) => {
  return (
    <div className="bg-[#15131A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all text-left">
      <div className="p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-2xl shrink-0">
            {activity.emoji}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-mono">
                {activity.date || 'Happening Now'}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-white mt-0.5">{activity.text}</h4>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-500" /> {activity.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fireHaptic('medium');
              onBoostResonance();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{resonancesCount || 0}</span>
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
            <span>Initiator: <strong className="text-white">{activity.author || 'Local Member'}</strong></span>
            <button
              type="button"
              onClick={() => openDeviceMap({ address: activity.location })}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[10px] cursor-pointer"
            >
              <Navigation className="w-3 h-3" /> Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
