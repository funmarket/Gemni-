import React from 'react';
import { matchingDomain, VibePullRequest } from '@/domains/d17_matching';
import { Check, X, ShieldAlert, Sparkles } from 'lucide-react';

interface PullsInboxTabProps {
  pulls: VibePullRequest[];
  onAcceptPull: (pullId: string) => void;
  onPassPull: (pullId: string) => void;
}

export const PullsInboxTab: React.FC<PullsInboxTabProps> = ({
  pulls,
  onAcceptPull,
  onPassPull
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-base">
            ⚡
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
              Connection Pulls (D17 Inbound)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Explorers inviting you into their Vibe squad. Accept establishes a confirmed Vibe and unlocks 1:1 personal DMs.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          {pulls.length} Pending
        </span>
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
              className="bg-[#16141a] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-zinc-900 rounded-xl border border-white/5">
                  {pull.senderAvatar}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{pull.senderName}</span>
                    <span className="text-xs text-zinc-500 font-mono">@{pull.senderHandle}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {pull.compatibilityScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {pull.reasonText}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => onPassPull(pull.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Pass
                </button>
                <button
                  type="button"
                  onClick={() => onAcceptPull(pull.id)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept Vibe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
