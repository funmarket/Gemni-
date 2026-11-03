import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Compass, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { RomancePolarMatch } from '@/types/socialGraph';
import { cn } from '@/lib/utils';

interface WhyMatchedModalProps {
  match: RomancePolarMatch | null;
  onClose: () => void;
  onAccept: (matchId: string) => void;
}

export const WhyMatchedModal: React.FC<WhyMatchedModalProps> = ({
  match,
  onClose,
  onAccept,
}) => {
  if (!match) return null;

  const profile = match.matchedProfile;
  const report = match.whyReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#151020] border border-purple-500/30 rounded-3xl w-full max-w-lg p-6 relative z-10 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/10">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider font-mono text-purple-300 block">
                Polar Romance Synthesis Report
              </span>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Why You Matched with @{profile.username}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Category Headline */}
        <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              Complementarity Confidence
            </span>
            <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              {match.complementarityScore}% Synergistic Match
            </span>
          </div>
          <h4 className="text-sm font-black text-white">
            {report.headline}
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {report.description}
          </p>
        </div>

        {/* The 4 Complementarity Dimensions */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 font-mono block">
            Productive Opposite Poles
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block">
                🧭 Structure ↔ Flow
              </span>
              <p className="text-[11px] text-zinc-300">
                {match.dimensions.planning}
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                ⚡ Grounding ↔ Spark
              </span>
              <p className="text-[11px] text-zinc-300">
                {match.dimensions.energy}
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block">
                👥 Focus ↔ Catalyst
              </span>
              <p className="text-[11px] text-zinc-300">
                {match.dimensions.social}
              </p>
            </div>

            <div className="bg-zinc-900/80 border border-white/5 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block">
                🌱 Habit ↔ Exploration
              </span>
              <p className="text-[11px] text-zinc-300">
                {match.dimensions.routine}
              </p>
            </div>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> What You Learn From Each Other
          </span>
          <div className="bg-black/50 border border-emerald-500/15 rounded-2xl p-3.5 space-y-2 text-xs">
            {report.growthOpportunities.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-zinc-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Foundation */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Core Shared Alignment
          </span>
          <div className="flex flex-wrap gap-1.5">
            {report.sharedFoundations.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/5 text-zinc-300"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-3">
          {match.status !== 'accepted' && (
            <button
              type="button"
              onClick={() => {
                onAccept(match.id);
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              Accept Polar Match & Connect
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};
