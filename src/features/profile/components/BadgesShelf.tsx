import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, CheckCircle2, Lock, X, ChevronRight, Shield } from 'lucide-react';
import { PassportBadge, OFFICIAL_BADGES, BadgeTier } from '../types/badgeTypes';
import { cn } from '@/lib/utils';

interface BadgesShelfProps {
  fireHaptic?: (style: 'light' | 'medium' | 'heavy') => void;
}

const getTierColor = (tier: BadgeTier) => {
  switch (tier) {
    case 'LEGENDARY':
      return {
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
        border: 'border-purple-500/30 hover:border-purple-500/50'
      };
    case 'GOLD':
      return {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
        border: 'border-amber-500/30 hover:border-amber-500/50'
      };
    case 'SILVER':
      return {
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]',
        border: 'border-teal-500/30 hover:border-teal-500/50'
      };
    case 'BRONZE':
    default:
      return {
        badge: 'bg-zinc-700/30 text-zinc-300 border-zinc-600/30',
        glow: 'shadow-[0_0_15px_rgba(161,161,170,0.1)]',
        border: 'border-zinc-800 hover:border-zinc-700'
      };
  }
};

export const BadgesShelf: React.FC<BadgesShelfProps> = ({ fireHaptic }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'curator' | 'explorer' | 'community'>('all');
  const [selectedBadge, setSelectedBadge] = useState<PassportBadge | null>(null);

  const filteredBadges = activeCategory === 'all'
    ? OFFICIAL_BADGES
    : OFFICIAL_BADGES.filter(b => b.category === activeCategory);

  const unlockedCount = OFFICIAL_BADGES.filter(b => b.unlocked).length;

  return (
    <div className="bg-[#121116] border border-white/5 rounded-3xl p-5 space-y-4 text-left select-none relative overflow-hidden shadow-xl">
      {/* Background Accent Ambient Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-white tracking-tight flex items-center gap-1.5">
              Cultural Passport Shelf <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              Verified Proof of Local Exploration
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
          {unlockedCount}/{OFFICIAL_BADGES.length} Stamped
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
        {[
          { id: 'all', label: 'All Badges' },
          { id: 'curator', label: '🧭 Curator' },
          { id: 'explorer', label: '🚶 Explorer' },
          { id: 'community', label: '🤝 Community' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              fireHaptic?.('light');
              setActiveCategory(tab.id as any);
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 font-medium",
              activeCategory === tab.id
                ? "bg-zinc-800 text-white border-white/20 shadow-sm"
                : "bg-zinc-900/60 text-zinc-400 border-white/5 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative z-10">
        {filteredBadges.map((badge) => {
          const colors = getTierColor(badge.tier);

          return (
            <motion.div
              key={badge.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                fireHaptic?.('medium');
                setSelectedBadge(badge);
              }}
              className={cn(
                "p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden",
                badge.unlocked 
                  ? cn("bg-zinc-900/90", colors.border, colors.glow)
                  : "bg-zinc-950/70 border-white/5 opacity-70 hover:opacity-90"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span className="text-2xl filter drop-shadow-md select-none">{badge.icon}</span>
                  <span className={cn("text-[8px] font-black uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border", colors.badge)}>
                    {badge.tier}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed pt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress or Verified Stamp */}
              <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                {badge.unlocked ? (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <div className="w-full space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 font-bold">
                      <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Progress</span>
                      <span>{badge.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${badge.progress}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Badge Certificate Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#16141a] border border-amber-500/30 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                  {selectedBadge.icon}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border",
                    getTierColor(selectedBadge.tier).badge
                  )}>
                    {selectedBadge.tier} CREDENTIAL
                  </span>
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    +{selectedBadge.pointsReward} VIBE PTS
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white tracking-tight pt-1">
                  {selectedBadge.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-3.5 space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 font-mono block">
                  Unlock Requirements
                </span>
                <p className="text-zinc-300 leading-relaxed font-medium">
                  {selectedBadge.unlockCriteria}
                </p>
                {selectedBadge.unlockedAt && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block pt-1 border-t border-white/5">
                    ✓ Verified on {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Close Certificate
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
