import React from 'react';
import { matchingDomain, VibePullRequest } from '@/domains/d17_matching';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface PullsInboxTabProps {
  pulls: VibePullRequest[];
  onAcceptPull: (pullId: string) => void;
  onPassPull: (pullId: string) => void;
  onOpenProfile?: (profile: { id: string; displayName: string; handle: string; avatar: string; bio?: string }) => void;
}

export const PullsInboxTab: React.FC<PullsInboxTabProps> = ({
  pulls,
  onAcceptPull,
  onPassPull,
  onOpenProfile,
}) => {
  return (
    <div className="space-y-4 text-left">
      {/* Information Banner */}
      <div className="bg-purple-950/25 border border-purple-500/20 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-base shrink-0 border border-purple-500/30">
            ⚡
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider truncate">
              Connection Pulls (D17 Inbound)
            </h4>
            <p className="text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-none leading-relaxed mt-0.5">
              Explorers inviting you into their Vibe squad. Accept establishes a confirmed Vibe and unlocks 1:1 personal DMs.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-3.5 py-1.5 rounded-full border border-purple-500/30 whitespace-nowrap shadow-sm shrink-0">
            <span className="font-extrabold text-purple-200">{pulls.length}</span>
            <span>Pending</span>
          </span>
        </div>
      </div>

      {pulls.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-3xl space-y-2">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No Pending Pulls</p>
          <p className="text-[11px] text-zinc-500">
            Share moments in the Gossip feed or complete a VibeCheck challenge to receive inbound invites!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pulls.map((pull) => (
            <div
              key={pull.id}
              className="bg-[#141218] border border-white/10 rounded-2xl p-4 flex items-start gap-3.5 hover:border-purple-500/30 transition-all overflow-hidden text-left relative"
            >
              {/* Left: Avatar container */}
              <div 
                className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-400/50 transition-colors shadow-sm"
                onClick={() => onOpenProfile?.({
                  id: pull.senderId,
                  displayName: pull.senderName,
                  handle: pull.senderHandle,
                  avatar: pull.senderAvatar,
                  bio: pull.reasonText,
                })}
              >
                {pull.senderAvatar && (pull.senderAvatar.startsWith('http') || pull.senderAvatar.startsWith('/') || pull.senderAvatar.startsWith('data:')) ? (
                  <img
                    src={pull.senderAvatar}
                    alt={pull.senderName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{pull.senderAvatar || '⚡'}</span>
                )}
              </div>

              {/* Middle: Name on single line, handle underneath, reason text underneath */}
              <div 
                className="flex-1 min-w-0 pr-1 cursor-pointer"
                onClick={() => onOpenProfile?.({
                  id: pull.senderId,
                  displayName: pull.senderName,
                  handle: pull.senderHandle,
                  avatar: pull.senderAvatar,
                  bio: pull.reasonText,
                })}
              >
                {/* Name on a single line */}
                <h4 className="font-extrabold text-[15px] text-white truncate leading-tight">
                  {pull.senderName}
                </h4>

                {/* Handle sits directly underneath the name */}
                <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                  @{pull.senderHandle.replace(/^@/, '')}
                </p>

                {/* Reason text sits underneath the handle and wraps cleanly */}
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed line-clamp-2 font-normal break-words">
                  {pull.reasonText}
                </p>
              </div>

              {/* Right: Badge on top right, buttons directly underneath */}
              <div className="shrink-0 flex flex-col items-end justify-between self-stretch gap-2.5">
                {/* Match compatibility badge on top right */}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>{pull.compatibilityScore}% Match</span>
                </span>

                {/* Action buttons (Pass and Accept Vibe) sitting directly underneath */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPassPull(pull.id);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer active:scale-95 shrink-0"
                  >
                    Pass
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptPull(pull.id);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
