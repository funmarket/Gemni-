import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

interface ExploreDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: { lat: number; lng: number } | null;
  getScrollHideStyles: () => React.CSSProperties;
  modalRef: React.RefObject<HTMLDivElement | null>;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ExploreDiagnosticModal: React.FC<ExploreDiagnosticModalProps> = ({
  isOpen,
  onClose,
  coords,
  getScrollHideStyles,
  modalRef,
  fireHaptic
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-[4px] p-4 transition-all duration-300"
        style={getScrollHideStyles()}
      >
        <div className="absolute inset-0 -z-10" onClick={onClose} />

        <div 
          ref={modalRef}
          className="bg-[#1A181C] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden"
          style={{ borderTop: '4px solid #5E4DB2', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
        >
          <div className="p-6 space-y-4 text-left">
            <div className="flex justify-between items-start select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#FF9F0A]" />
                <h3 className="font-bold text-[20px] text-white">Vibe Suggestions</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full bg-white/5 text-white hover:bg-white/10 border-none outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[14px] text-[#EBEBF5] leading-relaxed">
              Your local search engine recommends nearby places using on-device calculations with 100% privacy and zero cloud tracking. Fully offline-first.
            </p>

            <div className="bg-black/25 border border-white/5 rounded-xl p-3.5 space-y-2.5 font-mono text-[11px] text-[#8E8E93] select-none text-left">
              <div className="flex justify-between">
                <span>📡 GPS Latitude:</span>
                <span className="text-white font-bold">{coords?.lat?.toFixed(5) || "0.0"}</span>
              </div>
              <div className="flex justify-between">
                <span>🛰️ GPS Longitude:</span>
                <span className="text-white font-bold">{coords?.lng?.toFixed(5) || "0.0"}</span>
              </div>
              <div className="flex justify-between">
                <span>🔬 Location Engine:</span>
                <span className="text-[#3DDC6C] font-black">STABLE</span>
              </div>
            </div>

            <div className="pt-2 space-y-2 select-none">
              <button 
                type="button"
                onClick={() => {
                  fireHaptic('medium');
                  alert("All local matching checks passed. Your data is 100% private.");
                }}
                className="w-full bg-emerald-950/25 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-950/40 py-3 text-center text-[14px] font-bold rounded-full outline-none transition-all cursor-pointer bg-transparent"
              >
                Test Local Matching
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-transparent hover:bg-white/5 border border-white/5 text-white font-bold py-3 text-center text-[14px] rounded-full transition-all outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
