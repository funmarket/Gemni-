import React from 'react';
import { cn } from '@/lib/utils';

interface CompassModalProps {
  discoveryRadar: any[];
  claimedDiscoveries: Record<string, boolean>;
  claimDiscovery: (id: string, points: number) => void;
}

export const CompassModal: React.FC<CompassModalProps> = ({
  discoveryRadar,
  claimedDiscoveries,
  claimDiscovery,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-amber-200/35 border border-amber-300 text-amber-950/90 space-y-1">
        <span className="font-black text-[10px] uppercase tracking-wider block text-amber-800">🎉 Rarity Shard Found!</span>
        <p className="font-medium text-[11px] leading-relaxed">
          A highly compatible cultural hotspot is locked in your browser. Verify credentials to secure the access log.
        </p>
      </div>

      {discoveryRadar.map((spot) => {
        const isClaimed = claimedDiscoveries[spot.id];
        const points = spot.points || (spot.rarity === 'legendary' ? 150 : spot.rarity === 'trending' ? 100 : 50);
        const icon = spot.icon || (spot.rarity === 'legendary' ? '👑' : spot.rarity === 'trending' ? '📈' : '💎');
        const desc = spot.desc || spot.subtitle || 'Local spot discovered via hardware GPS sonar.';

        return (
          <div key={spot.id} className="p-4 rounded-xl bg-white border-2 border-amber-300/40 space-y-2 text-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-tight text-slate-900">{spot.name}</h4>
                  <span className="text-[8.5px] font-bold text-amber-600 bg-amber-100 rounded-lg px-2 py-0.5 border border-amber-200 font-mono inline-block mt-0.5 uppercase tracking-widest leading-none">{spot.rarity}</span>
                </div>
              </div>
              <span className="text-emerald-600 font-mono font-black text-xs">+{points} VQ</span>
            </div>
            <p className="text-[10px] text-zinc-600 leading-normal font-medium">{desc}</p>
            <button
              type="button"
              onClick={() => claimDiscovery(spot.id, points)}
              disabled={isClaimed}
              className={cn(
                "w-full h-9 rounded-lg font-mono font-black text-[10.5px] uppercase tracking-wider border transition-all mt-2 cursor-pointer flex items-center justify-center shadow-sm",
                isClaimed
                  ? "bg-zinc-100 border-zinc-200 text-zinc-450 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-[#ea580c] hover:brightness-110 text-white border-transparent"
              )}
            >
              {isClaimed ? '✓ Shard Signal Secured' : `Secure Shard (+${points} VQ)`}
            </button>
          </div>
        );
      })}
    </div>
  );
};
