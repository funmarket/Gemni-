import React from 'react';
import { Plus, Clock } from 'lucide-react';
import { TrailStopCard, StopDraft } from './TrailStopCard';

interface TrailStopsBuilderTabProps {
  stops: StopDraft[];
  userCoords: { lat: number; lng: number } | null;
  onUpdateStop: (id: string, updates: Partial<StopDraft>) => void;
  onRemoveStop: (id: string) => void;
  onMoveStop: (index: number, direction: 'up' | 'down') => void;
  onAddStop: () => void;
}

export const TrailStopsBuilderTab: React.FC<TrailStopsBuilderTabProps> = ({
  stops,
  onUpdateStop,
  onRemoveStop,
  onMoveStop,
  onAddStop
}) => {
  const totalMinutes = stops.reduce((sum, s) => sum + (s.suggestedDurationMin || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl px-4 py-2.5">
        <div>
          <span className="text-xs font-bold text-white block">
            {stops.length} Ordered Stops
          </span>
          <span className="text-[10px] text-zinc-400">
            Drag or use arrows to organize sequence
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>{totalHours}h ({totalMinutes}m) Total</span>
        </div>
      </div>

      <div className="space-y-3">
        {stops.map((stop, idx) => (
          <TrailStopCard
            key={stop.id}
            stop={stop}
            index={idx}
            totalStops={stops.length}
            onUpdateStop={onUpdateStop}
            onRemoveStop={onRemoveStop}
            onMoveStop={onMoveStop}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddStop}
        className="w-full py-3.5 rounded-xl border border-dashed border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/5 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Another Stop
      </button>
    </div>
  );
};
