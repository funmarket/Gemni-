import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface HeatmapVenue {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  category: string;
  rating: number;
  visitors: number;
  pts: number;
  rarity: 'LEGENDARY' | 'RARE' | 'COMMON';
  emoji: string;
}

export interface ThermalLevel {
  name: string;
  value: number;
  color: string;
  bgCls: string;
}

interface VenueTooltipPortalProps {
  activeNode: HeatmapVenue;
  pos: { x: number; y: number; inBounds: boolean };
  level: ThermalLevel;
  snippet: string;
}

export const VenueTooltipPortal: React.FC<VenueTooltipPortalProps> = ({
  activeNode,
  pos,
  level,
  snippet,
}) => {
  if (!pos.inBounds) return null;

  return (
    <motion.div
      key={`tooltip-${activeNode.id}`}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="absolute z-30 pointer-events-auto -translate-x-1/2 -translate-y-[105%]"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y - 18}px`,
      }}
    >
      <div className="relative w-64 bg-zinc-950/95 border border-zinc-800/95 text-left rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[9px] font-mono font-bold tracking-wider text-[#8E8E93] uppercase flex items-center gap-1">
            <span className={cn("w-1.5 h-1.5 rounded-full inline-block animate-pulse", level.bgCls)} />
            Vibe Telemetry
          </span>
          <span className={cn(
            "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md text-white uppercase tracking-tight scale-90",
            level.bgCls
          )}>
            {level.name.split(' ')[0]}
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="text-2xl shrink-0 select-none bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-800">{activeNode.emoji}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-black text-white leading-tight tracking-tight line-clamp-1">
              {activeNode.name}
            </h4>
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wide uppercase mt-0.5">
              {activeNode.category}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-800/80 py-2 my-2.5 text-[10px] font-mono leading-none">
          <div className="flex flex-col gap-1 border-r border-zinc-800/60">
            <span className="text-zinc-550 uppercase tracking-widest text-[8px] font-bold">Resonance</span>
            <span className="text-amber-400 font-black text-[11px] flex items-center gap-0.5">
              {activeNode.rating} ★
            </span>
          </div>
          <div className="flex flex-col gap-1 pl-2">
            <span className="text-zinc-550 uppercase tracking-widest text-[8px] font-bold">Lively Pulse</span>
            <span className="text-emerald-400 font-black text-[11px]">
              {activeNode.visitors} visitors
            </span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-zinc-300 font-medium tracking-tight select-text">
          {snippet}
        </p>

        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mt-2.5 pt-2 border-t border-zinc-900/60 font-semibold">
          <span>SYS RATE: {level.value}% MATCH</span>
          <span>{activeNode.distance}km away</span>
        </div>

        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-950 border-r border-b border-zinc-800/95" />
      </div>
    </motion.div>
  );
};
