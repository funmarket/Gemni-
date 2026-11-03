import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Compass, Check, AlertCircle, Zap, Shield, Heart } from 'lucide-react';
import { vqLedger } from '@/domains/d20_vq_ledger';

interface CommunityHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerHaptic?: (type: 'light' | 'medium' | 'heavy') => void;
  triggerAlert?: (title: string, message: string, type?: string) => void;
  onNavigate?: (tab: string) => void;
}

export const CommunityHandbookModal: React.FC<CommunityHandbookModalProps> = ({
  isOpen,
  onClose,
  triggerHaptic = () => {},
  triggerAlert = () => {},
  onNavigate,
}) => {
  const [compassCalibrated, setCompassCalibrated] = useState(() => {
    return localStorage.getItem('vq_compass_calibrated') === 'true';
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const isCal = localStorage.getItem('vq_compass_calibrated') === 'true';
    setCompassCalibrated(isCal);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCalibrate = (answer: 'tea' | 'club') => {
    if (compassCalibrated) return;

    if (answer === 'tea') {
      triggerHaptic('heavy');
      setSelectedAnswer('tea');
      setCompassCalibrated(true);
      localStorage.setItem('vq_compass_calibrated', 'true');
      
      try {
        vqLedger.credit('current_user', 15, 'INITIAL_GRANT', 'Voyager Compass Signal calibration');
      } catch (e) {
        console.warn('Ledger notice:', e);
      }

      triggerAlert("🎯 Sensor Calibrated!", "Cozy tea ceremonies represent maximum slow restoration. Gained +15 VQ!");
    } else {
      triggerHaptic('light');
      setSelectedAnswer('club');
      triggerAlert("⚠️ Calibration Mismatch", "Mismatch detected. Try a more cozy, reflective restorative option!", "warning");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-zinc-950 border border-purple-500/25 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white font-display">VIBE Guide Handbook</h3>
                <p className="text-[10px] font-mono text-zinc-400">Community Principles & Voyager Calibration</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Intro Card */}
          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-purple-200 text-xs space-y-1 leading-relaxed">
            <span className="font-bold text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
              🌟 The Voyager Ethos
            </span>
            <p className="text-[11px] text-zinc-300 font-sans">
              Transform from tourist to temporary local. VibeQuest is a dynamic, human-first cultural platform honoring neighborhoods, local artisans, slow restoration, and real community resonance.
            </p>
          </div>

          {/* Pillars List */}
          <div className="space-y-2.5">
            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-start gap-3">
              <span className="text-xl">🔥</span>
              <div className="flex-1">
                <h5 className="font-bold text-xs text-white uppercase tracking-tight">Establish Daily Streak</h5>
                <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                  Verify presence every 24h on the Home tab to earn +25 VQ points and reinforce your cultural footprint.
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-start gap-3">
              <span className="text-xl">📡</span>
              <div className="flex-1">
                <h5 className="font-bold text-xs text-white uppercase tracking-tight">Charge Vibe Radar</h5>
                <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                  Explore neighborhoods to build radar sensor charge and unlock rare community landmarks on the Explore map.
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-2xl flex items-start gap-3">
              <span className="text-xl">💸</span>
              <div className="flex-1">
                <h5 className="font-bold text-xs text-white uppercase tracking-tight">Tip Neighborhood Culture</h5>
                <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                  Send VQ appreciation tips directly to local storytellers, street performers, and micro-cafés on their posts.
                </p>
              </div>
            </div>
          </div>

          {/* Voyager Compass Calibration Challenge */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-purple-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '10s' }} />
              <span className="font-black text-xs uppercase tracking-wide text-purple-300 font-mono">
                Active Voyager Compass Calibration
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
              To calibrate your cultural compass sensor: which lifestyle frequency represents true slow restoration and mindful travel?
            </p>

            {!compassCalibrated ? (
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <button
                  type="button"
                  onClick={() => handleCalibrate('tea')}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs py-2 px-3 rounded-xl font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>🍵</span>
                  <span>Cozy Tea Ceremony</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCalibrate('club')}
                  className="bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-white/5 text-xs py-2 px-3 rounded-xl font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span>
                  <span>Megawatt Party</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center gap-2 text-emerald-300 text-xs font-mono font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Voyager Compass Signal Fully Tuned (+15 VQ Earned)</span>
              </div>
            )}
          </div>

          {/* CTA Footer */}
          <div className="pt-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Accept Principles & Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
