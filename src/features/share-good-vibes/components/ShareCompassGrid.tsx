import React from 'react';
import { cn } from '@/lib/utils';
import { categoriesList } from '../data/vibeData';

interface ShareCompassGridProps {
  onOpenEcho: (vibe: { name: string; category: string; description: string }) => void;
  onOpenCircle: (vibe: { name: string; category: string; description: string }) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ShareCompassGrid: React.FC<ShareCompassGridProps> = ({
  onOpenEcho,
  onOpenCircle,
  triggerHaptic
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[14px] font-bold text-zinc-500 uppercase tracking-widest">Aesthetic Discovery Compass</h3>
        <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300 uppercase font-bold font-mono">12 Active Nodes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categoriesList.map((cat, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-gradient-to-br rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4",
              cat.colorClass
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[17px] font-bold tracking-tight text-white">{cat.name}</span>
              </div>
              <span className="text-[11px] font-bold font-mono text-zinc-400 bg-black/20 px-2 py-0.5 rounded-full">Proximity-First</span>
            </div>

            <div className="space-y-2.5">
              {cat.items.map((sub, sIdx) => {
                const prefillDescription = `A neighborhood collective for matching on ${sub.name} vibes, spontaneous connections, and sharing real-time neighborhood coordinates near Mission District.`;
                
                return (
                  <div 
                    key={sIdx}
                    className="bg-zinc-950/40 hover:bg-zinc-950/60 transition-all p-3.5 rounded-2xl border border-zinc-900/40 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">
                        {sub.name === 'Interest Circles' && '✨'}
                        {sub.name === 'Spontaneous Coffee' && '☕'}
                        {sub.name === 'Shared Flow' && '🎸'}
                        {sub.name === 'Pop-up Meetups' && '🌍'}
                        {sub.name === 'Group Walks' && '🚶'}
                        {sub.name === 'Outdoor Sessions' && '🌳'}
                        {sub.name === 'Coffee Walks' && '🚶'}
                        {sub.name === 'Local Trails' && '🏞️'}
                        {sub.name === 'Sunset Pulse' && '🌅'}
                        {sub.name === 'Quiet Nooks' && '🏡'}
                        {sub.name === 'Roof Terraces' && '🌆'}
                        {sub.name === 'Inner Gardens' && '🌿'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-zinc-100 truncate">{sub.name}</p>
                        <p className="text-[12px] text-zinc-400 truncate mt-0.5">{sub.desc}</p>
                        <span className="text-[9px] font-mono text-rose-450 mt-1 block">🎯 {sub.comp} Match Rate</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button 
                        onClick={() => {
                          triggerHaptic('light');
                          onOpenEcho({
                            name: sub.name,
                            category: cat.name,
                            description: prefillDescription
                          });
                        }}
                        className="py-1 px-3.5 rounded-xl text-[10px] font-black uppercase bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 active:scale-95 transition-all text-center shrink-0"
                      >
                        Echo
                      </button>
                      <button 
                        onClick={() => {
                          triggerHaptic('medium');
                          onOpenCircle({
                            name: sub.name,
                            category: cat.name,
                            description: prefillDescription
                          });
                        }}
                        className="py-1 px-3.5 rounded-xl text-[10px] font-black uppercase bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 active:scale-95 transition-all text-center shrink-0"
                      >
                        Circle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
