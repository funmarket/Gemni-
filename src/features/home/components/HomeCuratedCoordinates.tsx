import React from 'react';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { curatedCoordinates } from '../data/homeHelpers';

interface HomeCuratedCoordinatesProps {
  curatedExpanded: boolean;
  setCuratedExpanded: (val: boolean) => void;
  claimedCoordinates: Record<string, boolean>;
  claimCoordinate: (id: number, points: number) => void;
  triggerHaptic: (type: string) => void;
  onNavigate?: (tab: string, search?: string) => void;
}

export const HomeCuratedCoordinates: React.FC<HomeCuratedCoordinatesProps> = ({
  curatedExpanded,
  setCuratedExpanded,
  claimedCoordinates,
  claimCoordinate,
  triggerHaptic,
  onNavigate
}) => {
  return (
    <div 
      onClick={() => {
        triggerHaptic('light');
        setCuratedExpanded(!curatedExpanded);
      }}
      className={cn(
        "bg-[#021d10]/40 border text-[#10b981] p-4.5 rounded-[18px] transition-all relative overflow-hidden select-none cursor-pointer flex flex-col gap-3",
        curatedExpanded ? "border-[#10b981]/50 bg-[#032a17]/50" : "border-[#10b981]/15 hover:border-[#10b981]/40"
      )}
    >
      <div className="flex items-center justify-between font-black text-xs uppercase tracking-wider w-full">
        <div className="flex items-center gap-2 font-mono">
          <Sparkle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>Curated Heritage Coordinates ({curatedCoordinates.length})</span>
        </div>
        <span className="text-sm transition-transform duration-200">{curatedExpanded ? '▲' : '▼'}</span>
      </div>

      {curatedExpanded && (
        <div className="space-y-3 pt-2 w-full text-zinc-350 normal-case font-normal text-left" onClick={(e) => e.stopPropagation()}>
          <p className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-widest">
            ★ LEVEL 3 VQ COMPASS SECURE PLOTS
          </p>
          <div className="space-y-2.5">
            {curatedCoordinates.map((coord) => {
              const isClaimed = claimedCoordinates[coord.id];
              return (
                <div key={coord.id} className="p-3 bg-[#031d10]/65 border border-[#10b981]/25 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{coord.icon}</span>
                      <div>
                        <h5 className="font-bold text-[11.5px] text-zinc-100">{coord.name}</h5>
                        <span className="text-[9.5px] text-[#10b981] font-mono font-bold block">{coord.loc}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold font-black">+{coord.points} VQ</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal mb-1">{coord.desc}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => claimCoordinate(coord.id, coord.points)}
                      disabled={isClaimed}
                      className={cn(
                        "flex-1 h-8 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider border transition-all cursor-pointer",
                        isClaimed
                          ? "bg-zinc-900 border-transparent text-emerald-600/50 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-500 border-transparent text-white"
                      )}
                    >
                      {isClaimed ? '✓ Signal Synchronized' : `Calibrate Coordinate (+${coord.points} VQ)`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        if (onNavigate) {
                          onNavigate('explore', coord.name);
                        }
                      }}
                      className="bg-emerald-950 hover:bg-[#0b482a] border border-[#10b981]/30 text-[#10b981] px-2.5 text-[9px] font-mono font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center"
                    >
                      Plot 📍
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
