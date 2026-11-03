import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Compass, Check, X, ShieldAlert, ArrowRight, BookOpen } from 'lucide-react';
import { RomancePolarMatch } from '@/types/socialGraph';
import { cn } from '@/lib/utils';

interface PolarRomanceCardProps {
  match: RomancePolarMatch;
  onAccept: (matchId: string) => void;
  onPass: (matchId: string) => void;
  onOpenReport: (match: RomancePolarMatch) => void;
  onChatWithMatch?: (profile: any) => void;
}

export const PolarRomanceCard: React.FC<PolarRomanceCardProps> = ({
  match,
  onAccept,
  onPass,
  onOpenReport,
  onChatWithMatch,
}) => {
  const [isPassing, setIsPassing] = useState(false);
  const profile = match.matchedProfile;

  // Calculate days remaining on cooldown
  const daysRemaining = Math.max(0, Math.ceil((match.nextEligibleDate - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 border border-purple-500/30 bg-gradient-to-b from-[#181024] via-[#120d1c] to-[#0d0a14] shadow-[0_8px_32px_rgba(168,85,247,0.15)] text-left space-y-4 select-none group">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Rarity & Cycle Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-amber-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-black uppercase tracking-widest font-mono">
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>Polar Romance Match • 90-Day Auto-Pair</span>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 font-bold">
          Next cycle in {daysRemaining}d
        </span>
      </div>

      {/* Main Profile Info Row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-purple-500/40 p-1 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/10">
              {profile.avatar || '✨'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border border-black flex items-center justify-center text-[10px] text-white">
              ⚡
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              @{profile.username}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-1 italic mt-0.5">
              "{profile.vibes || 'Seeking authentic alignment'}"
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black font-mono text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-md">
                {match.complementarityScore}% Complementary
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Opposites Attract
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Polar Complementarity Dimension Badges */}
      <div className="space-y-1.5 relative z-10 bg-black/40 border border-white/5 p-3 rounded-2xl text-xs">
        <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-black flex items-center gap-1">
          <span>⚡</span> Polar Balance Breakdown
        </div>
        <p className="text-[11px] text-zinc-300 leading-snug">
          {match.dimensions.planning}
        </p>
        <p className="text-[11px] text-zinc-400 leading-snug">
          {match.dimensions.energy}
        </p>
      </div>

      {/* "Why You Matched" Teaser */}
      <div className="relative z-10 flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={() => onOpenReport(match)}
          className="text-purple-300 hover:text-purple-200 text-xs font-bold font-mono inline-flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          Read Full Complementarity Report →
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-2 border-t border-white/5 relative z-10">
        {match.status === 'accepted' ? (
          <div className="w-full flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-black uppercase font-mono flex items-center gap-1">
              <Check className="w-4 h-4" /> Connected in Vibes
            </span>
            <button
              type="button"
              onClick={() => onChatWithMatch?.(profile)}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
            >
              Start Chat
            </button>
          </div>
        ) : match.status === 'passed' ? (
          <span className="text-zinc-500 text-xs font-mono">Passed for this 90-day cycle</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAccept(match.id)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              Accept & Connect
            </button>

            <button
              type="button"
              onClick={() => onPass(match.id)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 text-xs font-bold transition-all cursor-pointer"
            >
              Pass
            </button>
          </>
        )}
      </div>
    </div>
  );
};
