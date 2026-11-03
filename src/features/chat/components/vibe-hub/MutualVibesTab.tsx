import React from 'react';
import { MutualVibeMatch } from '@/domains/d17_matching';
import { MessageSquare, Sparkles } from 'lucide-react';

interface MutualVibesTabProps {
  vibes: MutualVibeMatch[];
  onOpenChat: (vibe: MutualVibeMatch) => void;
}

export const MutualVibesTab: React.FC<MutualVibesTabProps> = ({
  vibes,
  onOpenChat
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base">
            💬
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider">
              Confirmed Vibes Squad (D17 Mutual Matches)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Only confirmed mutual Vibes unlock ordinary 1:1 personal messaging (SOC-002).
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
          {vibes.length} Confirmed
        </span>
      </div>

      {vibes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-3xl space-y-2">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No Confirmed Vibes Yet</p>
          <p className="text-[11px] text-zinc-500">
            Accept pending Pulls or complete a reciprocal 180s VibeCheck to establish your double-opt-in connection.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vibes.map((vibe) => (
            <div
              key={vibe.id}
              className="bg-[#16141a] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => onOpenChat(vibe)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-zinc-900 rounded-xl border border-white/5">
                  {vibe.matchedAvatar}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{vibe.matchedName}</span>
                    <span className="text-xs text-zinc-500 font-mono">@{vibe.matchedHandle}</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                    ⚡ {vibe.matchType.replace('_', ' ')} • Unlocked
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(vibe);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
