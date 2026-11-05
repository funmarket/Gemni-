import React from 'react';
import { MutualVibeMatch } from '@/domains/d17_matching';
import { MessageSquare, Sparkles } from 'lucide-react';

interface MutualVibesTabProps {
  vibes: MutualVibeMatch[];
  onOpenChat: (vibe: MutualVibeMatch) => void;
  onOpenProfile?: (profile: { id: string; displayName: string; handle: string; avatar: string }) => void;
}

export const MutualVibesTab: React.FC<MutualVibesTabProps> = ({
  vibes,
  onOpenChat,
  onOpenProfile,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Information Banner */}
      <div className="bg-cyan-950/25 border border-cyan-500/20 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-base shrink-0 border border-cyan-500/30">
            💬
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider truncate">
              Confirmed Vibes Squad (D17 Mutual Matches)
            </h4>
            <p className="text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-none leading-relaxed mt-0.5">
              Only confirmed mutual Vibes unlock ordinary 1:1 personal messaging (SOC-002).
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/15 px-3.5 py-1.5 rounded-full border border-cyan-500/30 whitespace-nowrap shadow-sm shrink-0">
            <span className="font-extrabold text-cyan-200">{vibes.length}</span>
            <span>Confirmed</span>
          </span>
        </div>
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
              className="bg-[#141218] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-all overflow-hidden text-left relative"
            >
              {/* Left & Middle grouped for responsive flex */}
              <div 
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                onClick={() => onOpenProfile?.({
                  id: vibe.matchedUserId,
                  displayName: vibe.matchedName,
                  handle: vibe.matchedHandle,
                  avatar: vibe.matchedAvatar,
                })}
              >
                {/* Left: Avatar container */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center hover:border-cyan-400/50 transition-colors shadow-sm">
                  {vibe.matchedAvatar && (vibe.matchedAvatar.startsWith('http') || vibe.matchedAvatar.startsWith('/') || vibe.matchedAvatar.startsWith('data:')) ? (
                    <img
                      src={vibe.matchedAvatar}
                      alt={vibe.matchedName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{vibe.matchedAvatar || '💬'}</span>
                  )}
                </div>

                {/* Middle: Name on single line, handle underneath, status underneath */}
                <div className="min-w-0 flex-1">
                  {/* Name on a single line */}
                  <h4 className="font-extrabold text-[15px] text-white truncate leading-tight">
                    {vibe.matchedName}
                  </h4>

                  {/* Handle sits directly underneath the name */}
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                    @{vibe.matchedHandle.replace(/^@/, '')}
                  </p>

                  {/* Match type underneath */}
                  <p className="text-xs text-cyan-400 font-mono mt-1 font-semibold flex items-center gap-1 truncate">
                    <span>⚡</span>
                    <span className="capitalize">{vibe.matchType.replace('_', ' ').toLowerCase()}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">Unlocked</span>
                  </p>
                </div>
              </div>

              {/* Right: Score badge on top right, Chat button underneath */}
              <div className="shrink-0 flex flex-col items-end justify-between self-stretch gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{vibe.compatibilityScore}% Vibe</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat(vibe);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
