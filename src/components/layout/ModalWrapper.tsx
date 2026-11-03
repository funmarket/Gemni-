import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., "max-w-sm", "max-w-md", "max-w-lg"
  showCloseButton?: boolean;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidthClass = 'max-w-sm',
  showCloseButton = true,
}) => {
  const widthClass = maxWidthClass === 'max-w-sm' ? 'w-[90vw] md:w-[420px]' : 
                     maxWidthClass === 'max-w-md' ? 'w-[90vw] md:w-[505px]' : 
                     maxWidthClass === 'max-w-lg' ? 'w-[90vw] md:w-[600px]' : 
                     maxWidthClass;

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-[6px] vibe-modal-backdrop"
          />

          {/* Modal Card Content */}
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative w-full ${widthClass} bg-[#0D0D0E]/98 border border-zinc-850 rounded-[28px] p-5 sm:p-6 text-left text-white shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_2px_rgba(255,255,255,0.08)] z-10 flex flex-col max-h-[90vh] overflow-y-auto select-none vibe-modal-card`}
          >
            {/* Header section (if title or close button) */}
            {(title || showCloseButton) && (
              <div className="flex justify-between items-start pb-3.5 border-b border-zinc-900 shrink-0 select-none">
                <div>
                  {title && (
                    <h3 className="font-black text-md sm:text-lg uppercase tracking-tight italic text-zinc-100 flex items-center gap-2">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-[9px] font-mono tracking-widest text-[#D4AF37]/80 mt-0.5 uppercase">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white hover:bg-zinc-900/50 p-1.5 rounded-full transition-all cursor-pointer border border-transparent hover:border-zinc-850 shrink-0"
                    title="Close Overlay"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable interior body */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-4 text-zinc-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalWrapper;
