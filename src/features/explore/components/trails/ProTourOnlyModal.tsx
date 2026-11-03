import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X } from 'lucide-react';

interface ProTourOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCurateFreeTrail: () => void;
}

export const ProTourOnlyModal: React.FC<ProTourOnlyModalProps> = ({
  isOpen,
  onClose,
  onCurateFreeTrail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#14121A] border border-purple-500/30 rounded-3xl p-5 max-w-sm w-full text-left space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h4 className="text-base font-extrabold text-white">Pro Guardian Tour Creator</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Only <strong>Pro Guardians</strong> can create paid Vibe Tours. Local Legends and regular explorers can create unlimited community <strong>Vibe Trails</strong>.
          </p>
        </div>

        <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-purple-300">To create bookable tours:</p>
          <p>1. Scroll down to the <strong>Vibe Guardians</strong> section</p>
          <p>2. Tap <strong>Join as Guardian</strong> and select <strong>Pro Guardian</strong></p>
          <p>3. Set your flat rate or hourly price and verify with an in-app selfie</p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCurateFreeTrail}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white font-bold text-xs cursor-pointer"
          >
            Curate Free Trail
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};
