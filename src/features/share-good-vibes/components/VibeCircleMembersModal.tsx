import React from 'react';
import { motion } from 'motion/react';
import { Users, X, Check, Sparkles } from 'lucide-react';

interface EchoMember {
  name: string;
  match: string;
  time: string;
  note: string;
  photo?: string | null;
  isPendingCreatorAction?: boolean;
  statusLabel?: string;
}

interface VibeCircleMembersModalProps {
  activeCircleVibe: { name: string; category: string; description: string };
  onClose: () => void;
  vibeEchoes: Record<string, EchoMember[]>;
  setVibeEchoes: React.Dispatch<React.SetStateAction<Record<string, EchoMember[]>>>;
  handleConvertCircleToCommunity: (vibeName: string, categoryName: string, prefillDetails: string) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export const VibeCircleMembersModal: React.FC<VibeCircleMembersModalProps> = ({
  activeCircleVibe,
  onClose,
  vibeEchoes,
  setVibeEchoes,
  handleConvertCircleToCommunity,
  triggerHaptic,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-sm text-left space-y-4 my-8 relative"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-900 relative">
          <h3 className="font-bold text-[18px] text-zinc-100 uppercase tracking-tight flex items-center gap-2 pr-6">
            <Users className="w-5 h-5 text-rose-500" /> {activeCircleVibe.name} Circle
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer absolute right-0 top-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-zinc-400">
            A dynamic neighborhood circle of people who echoed and matched this vibe recently near Mission District.
          </p>
        </div>

        {/* Members List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {(vibeEchoes[activeCircleVibe.name] || []).length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No active echoes in this circle yet. Be the first to Echo!
            </div>
          ) : (
            (vibeEchoes[activeCircleVibe.name] || []).map((echoer, eIdx) => (
              <div 
                key={eIdx} 
                className="bg-zinc-900/60 border border-zinc-900 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="flex gap-3 items-start w-full">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500/30 to-amber-500/30 border border-rose-500/20 flex items-center justify-center font-bold text-xs text-rose-300 shrink-0">
                    {echoer.name.charAt(1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">{echoer.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{echoer.time}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed break-words">
                      {echoer.note}
                    </p>
                    
                    {echoer.photo && (
                      <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-zinc-800">
                        <img src={echoer.photo} alt="Live presence proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[9px] font-mono">
                    {echoer.match}
                  </div>
                </div>

                {/* Interactive Actions for the Vibe Creator */}
                {echoer.isPendingCreatorAction ? (
                  <div className="mt-1.5 flex gap-1.5 justify-end w-full border-t border-zinc-900/60 pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        alert(`✨ Success! As the Vibe Creator, you have added ${echoer.name} to your Connection Circle!`);
                        setVibeEchoes(prev => {
                          const updated = { ...prev };
                          if (updated[activeCircleVibe.name]) {
                            updated[activeCircleVibe.name] = updated[activeCircleVibe.name].map((item, idx) => {
                              if (idx === eIdx) {
                                return { ...item, isPendingCreatorAction: false, statusLabel: 'Circle Member' };
                              }
                              return item;
                            });
                          }
                          return updated;
                        });
                      }}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/20 text-rose-300 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer"
                    >
                      Add to Circle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('heavy');
                        handleConvertCircleToCommunity(activeCircleVibe.name, activeCircleVibe.category, echoer.note);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all cursor-pointer"
                    >
                      Add to Community
                    </button>
                  </div>
                ) : echoer.statusLabel ? (
                  <div className="mt-1 flex items-center gap-1 self-end px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-[9px] uppercase font-mono font-bold">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {echoer.statusLabel}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Form Community from this Circle button */}
        <div className="pt-2">
          <button 
            type="button"
            onClick={() => handleConvertCircleToCommunity(activeCircleVibe.name, activeCircleVibe.category, activeCircleVibe.description)}
            className="w-full py-2.5 px-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold uppercase text-[11px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-97 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-rose-300" />
            Form Community from this Circle
          </button>
        </div>
      </motion.div>
    </div>
  );
};
