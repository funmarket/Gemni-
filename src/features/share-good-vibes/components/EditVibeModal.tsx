import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Edit3, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/shared/services/device/haptics';

interface EditVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  vibeId: string;
  initialText: string;
  onSave: (id: string, newText: string) => void;
}

export const EditVibeModal: React.FC<EditVibeModalProps> = ({
  isOpen,
  onClose,
  vibeId,
  initialText,
  onSave,
}) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Your vibe note cannot be empty!');
      return;
    }
    triggerHaptic('heavy');
    onSave(vibeId, text.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-zinc-950 border border-zinc-850 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 font-mono text-zinc-100"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">Edit Your Active Vibe</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Vibe Description Note
                </label>
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={140}
                    placeholder="Describe the aesthetic vibe around you..."
                    rows={3}
                    className="w-full bg-zinc-900/50 border border-zinc-850 hover:border-zinc-800 focus:border-rose-500/50 rounded-2xl p-3.5 text-zinc-200 placeholder-zinc-600 text-xs focus:ring-1 focus:ring-rose-500/50 outline-none transition-all resize-none font-sans"
                  />
                  <div className="absolute bottom-2.5 right-3 text-[9px] text-zinc-600 font-mono">
                    {text.length}/140
                  </div>
                </div>
              </div>

              {/* Bottom hint */}
              <div className="flex items-center gap-2 px-1 text-[9px] text-zinc-500 leading-normal">
                <Sparkles className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Your edited coordinates will update in nearby live scanners instantly.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="px-4 py-2 text-xs rounded-xl border border-zinc-850 hover:border-zinc-800 hover:bg-zinc-900/40 text-zinc-400 font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold uppercase tracking-widest transition-all shadow-[0_2px_8px_rgba(244,63,94,0.2)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
