import React from 'react';
import { GitFork, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { VibeTrail } from '../types';

interface TrailRemixTreeProps {
  trail: VibeTrail;
  onSelectTrail?: (trail: VibeTrail) => void;
}

export const TrailRemixTree: React.FC<TrailRemixTreeProps> = ({ trail }) => {
  const isForked = Boolean(trail.forkedFromAuthorName);
  const adoptionsCount = trail.adoptionsCount || 0;

  if (!isForked && adoptionsCount === 0) {
    return null;
  }

  return (
    <div className="bg-[#15131a] border border-purple-500/20 rounded-2xl p-4 space-y-3 text-left relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <GitFork className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-display flex items-center gap-1.5">
              Trail Remix Tree <Sparkles className="w-3 h-3 text-purple-400" />
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              Community Lineage & Route Evolution
            </p>
          </div>
        </div>

        <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
          {adoptionsCount} {adoptionsCount === 1 ? 'Fork' : 'Forks'}
        </span>
      </div>

      {/* Visual Tree Branches */}
      <div className="relative pl-3 space-y-2.5 pt-1 z-10 text-xs">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-[18px] top-4 bottom-3 w-0.5 bg-gradient-to-b from-purple-500/40 via-emerald-500/40 to-transparent" />

        {/* Root Node (Original Source) */}
        <div className="flex items-center gap-2.5 relative">
          <div className="w-3 h-3 rounded-full bg-purple-400 border-2 border-[#15131a] shrink-0 z-10 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <div className="bg-zinc-900/90 border border-purple-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 flex-1 min-w-0">
            <div className="truncate">
              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase block">
                {isForked ? "Original Parent Circuit" : "Root Genesis Route"}
              </span>
              <span className="text-xs font-bold text-white truncate block">
                @{isForked ? trail.forkedFromAuthorName : trail.authorName}
              </span>
            </div>
            <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded shrink-0">
              Genesis
            </span>
          </div>
        </div>

        {/* Branch Node (Current Remixed Route) */}
        <div className="flex items-center gap-2.5 relative">
          <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#15131a] shrink-0 z-10 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <div className="bg-zinc-900/90 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 flex-1 min-w-0">
            <div className="truncate">
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase block">
                {isForked ? "Adapted Route (+ Discoveries)" : "Live Community Branch"}
              </span>
              <span className="text-xs font-bold text-white truncate block">
                @{trail.authorName} • {trail.totalStops || trail.stops?.length || 1} Stops
              </span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded shrink-0">
              Active
            </span>
          </div>
        </div>

        {/* Descendant forks indicator */}
        {adoptionsCount > 0 && (
          <div className="flex items-center gap-2.5 relative pl-0.5">
            <div className="w-2 h-2 rounded-full bg-zinc-600 border border-[#15131a] shrink-0 z-10 ml-0.5" />
            <div className="text-[10px] text-zinc-400 font-mono italic">
              ↳ Adopted by {adoptionsCount} local explorers with custom additions
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
