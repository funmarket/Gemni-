import React from 'react';
import { Trash2, ArrowUp, ArrowDown, MapPin, Clock } from 'lucide-react';
import { TimeOfDay } from '../../types';

export const TIME_OPTIONS: { id: TimeOfDay; label: string; emoji: string; color: string }[] = [
  { id: 'morning', label: 'Morning', emoji: '🌅', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
  { id: 'sunset', label: 'Sunset', emoji: '🌇', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  { id: 'night', label: 'Night', emoji: '🌙', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
  { id: 'anytime', label: 'Flexible', emoji: '✨', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
];

export interface StopDraft {
  id: string;
  placeName: string;
  address: string;
  lat: number;
  lng: number;
  timeOfDay: TimeOfDay;
  suggestedDurationMin: number;
  proTip: string;
  category: string;
  photoUrl?: string;
}

interface TrailStopCardProps {
  stop: StopDraft;
  index: number;
  totalStops: number;
  onUpdateStop: (id: string, updates: Partial<StopDraft>) => void;
  onRemoveStop: (id: string) => void;
  onMoveStop: (index: number, direction: 'up' | 'down') => void;
}

export const TrailStopCard: React.FC<TrailStopCardProps> = ({
  stop,
  index,
  totalStops,
  onUpdateStop,
  onRemoveStop,
  onMoveStop
}) => {
  return (
    <div className="bg-[#1A181C] border border-white/10 rounded-2xl p-4 space-y-3 relative text-left">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center font-mono">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Stop #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {index > 0 && (
            <button
              type="button"
              onClick={() => onMoveStop(index, 'up')}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          {index < totalStops - 1 && (
            <button
              type="button"
              onClick={() => onMoveStop(index, 'down')}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
          {totalStops > 1 && (
            <button
              type="button"
              onClick={() => onRemoveStop(stop.id)}
              className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-red-500/10 cursor-pointer ml-1"
              title="Delete Stop"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            Place Name *
          </label>
          <input
            type="text"
            value={stop.placeName}
            onChange={(e) => onUpdateStop(stop.id, { placeName: e.target.value })}
            placeholder="e.g. Bab El Bhar Gateway"
            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            Address / Location
          </label>
          <input
            type="text"
            value={stop.address}
            onChange={(e) => onUpdateStop(stop.id, { address: e.target.value })}
            placeholder="e.g. Place de la Victoire"
            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Time of day badges & duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <div>
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            Best Time of Day
          </label>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateStop(stop.id, { timeOfDay: opt.id })}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  stop.timeOfDay === opt.id ? opt.color : 'border-white/5 bg-black/20 text-zinc-500'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
            Duration (Minutes)
          </label>
          <div className="relative">
            <input
              type="number"
              value={stop.suggestedDurationMin}
              onChange={(e) => onUpdateStop(stop.id, { suggestedDurationMin: parseInt(e.target.value) || 30 })}
              className="w-full bg-black/40 border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <Clock className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
          Insider Tip for this stop
        </label>
        <input
          type="text"
          value={stop.proTip}
          onChange={(e) => onUpdateStop(stop.id, { proTip: e.target.value })}
          placeholder="e.g. Order pine-nut tea and ask for the second-floor balcony."
          className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
};
