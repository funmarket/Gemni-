import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareLiveFeedProps {
  activities: any[];
  joinedVibeIds: string[];
  activeRadarTarget: string | null;
  vibeEchoes: Record<string, any[]>;
  onEditVibe: (vibe: { id: string; text: string }) => void;
  onDeleteVibe: (id: string) => void;
  onOpenCircle: (vibe: { name: string; category: string; description: string }) => void;
  onJoinVibe: (id: string, text: string) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ShareLiveFeed: React.FC<ShareLiveFeedProps> = ({
  activities,
  joinedVibeIds,
  activeRadarTarget,
  vibeEchoes,
  onEditVibe,
  onDeleteVibe,
  onOpenCircle,
  onJoinVibe,
  triggerHaptic
}) => {
  return (
    <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-[16px] tracking-tight flex items-center gap-2">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Nearby Ephemeral Vibe Feed
        </h3>
        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Interactive Radar</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activities.map((vibe) => {
            const isJoined = joinedVibeIds.includes(vibe.id);
            const isRadarActive = activeRadarTarget === vibe.id;
            
            return (
              <motion.div 
                key={vibe.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-2xl flex flex-col border transition-all relative overflow-hidden",
                  vibe.color,
                  isRadarActive && "ring-2 ring-rose-500/50 scale-[1.01]"
                )}
              >
                {isRadarActive && (
                  <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
                )}

                {/* Header row */}
                <div className="flex items-center justify-between mb-1.5 z-10">
                  <span className="text-xs font-black text-white">{vibe.user}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">{vibe.expiresIn}</span>
                    {vibe.isMyVibe && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('light');
                            onEditVibe({ id: vibe.id, text: vibe.text });
                          }}
                          className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit Vibe Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic('medium');
                            if (confirm("Are you sure you want to delete this vibe check from the live feed?")) {
                              onDeleteVibe(vibe.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/15 rounded-lg text-red-400/80 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Vibe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tag row */}
                <div className="flex items-center gap-2 mb-3.5 flex-wrap z-10">
                  <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded-full font-mono text-zinc-400">{vibe.vibeTag}</span>
                  <span className="text-[9px] text-[#f43f5e] font-mono font-bold">🎯 {vibe.compatibility} Compatibility</span>
                </div>

                {/* Body area */}
                <div className="relative pl-[70px] min-h-[56px] w-full z-10">
                  <div className="absolute top-0 left-0 shrink-0">
                    {vibe.backPhoto ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 select-none">
                        {(vibe as any).isVideo || vibe.backPhoto.startsWith('data:video/') || vibe.backPhoto.startsWith('blob:') ? (
                          <video 
                            src={vibe.backPhoto} 
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={vibe.backPhoto} 
                            alt="Main Scenery" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {vibe.frontPhoto && (
                          <div className="absolute top-0.5 left-0.5 w-6 h-7 rounded-md border border-rose-500 overflow-hidden shadow-md bg-black">
                            {(vibe as any).isVideo || vibe.frontPhoto.startsWith('data:video/') || vibe.frontPhoto.startsWith('blob:') ? (
                              <video 
                                src={vibe.frontPhoto} 
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img 
                                src={vibe.frontPhoto} 
                                alt="Front Action" 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-emerald-500/90 text-white font-mono px-0.5 rounded uppercase scale-[0.8] leading-none">Live</span>
                      </div>
                    ) : (
                      <span className="text-2xl block p-2 bg-black/20 rounded-xl leading-none">{vibe.icon}</span>
                    )}
                  </div>

                  <div className="w-full min-w-0">
                    <p className="text-[14px] font-normal text-zinc-100 leading-snug">{vibe.text}</p>
                    <p className="text-[11px] text-zinc-400 mt-1.5 font-mono leading-relaxed">
                      {(vibe as any).displaySub || vibe.sub}
                    </p>
                  </div>
                </div>

                {/* Footer/action row */}
                <div className="flex justify-between items-center mt-3.5 z-10 w-full gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenCircle({
                        name: vibe.text,
                        category: vibe.vibeTag,
                        description: `People aligning with "${vibe.text}" posted by ${vibe.user}.`
                      });
                    }}
                    className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1.5 font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/5 transition-all cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    Circle ({(vibeEchoes[vibe.text] || []).length})
                  </button>

                  <button
                    onClick={() => onJoinVibe(vibe.id, vibe.text)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider border transition-all cursor-pointer",
                      isJoined 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/20 hover:scale-[1.03]"
                    )}
                  >
                    {isJoined ? 'Joined ✓' : 'Join Vibe'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
