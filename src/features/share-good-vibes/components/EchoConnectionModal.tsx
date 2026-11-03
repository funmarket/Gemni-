import React from 'react';
import { motion } from 'motion/react';
import { Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VibePhotoCapture } from '@/components/share/VibePhotoCapture';

interface EchoConnectionModalProps {
  activeEchoVibe: { name: string; category: string; description: string } | null;
  onClose: () => void;
  userEchoNote: string;
  setUserEchoNote: (val: string) => void;
  attachPhotoToEcho: boolean;
  setAttachPhotoToEcho: (val: boolean) => void;
  echoCapturedImage: string | null;
  setEchoCapturedImage: (val: string | null) => void;
  echoCapturedFrontImage: string | null;
  setEchoCapturedFrontImage: (val: string | null) => void;
  echoCaptureTimestamp: number | null;
  setEchoCaptureTimestamp: (val: number | null) => void;
  handleEchoPublishSubmit: (e: React.FormEvent) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export const EchoConnectionModal: React.FC<EchoConnectionModalProps> = ({
  activeEchoVibe,
  onClose,
  userEchoNote,
  setUserEchoNote,
  attachPhotoToEcho,
  setAttachPhotoToEcho,
  echoCapturedImage,
  setEchoCapturedImage,
  echoCapturedFrontImage,
  setEchoCapturedFrontImage,
  echoCaptureTimestamp,
  setEchoCaptureTimestamp,
  handleEchoPublishSubmit,
  triggerHaptic,
}) => {
  if (!activeEchoVibe) return null;

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
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" /> Echo Vibe: {activeEchoVibe.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer absolute right-0 top-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          You are echoing this vibe to align with people matching this vibe. Send a soft message request or follow.
        </p>

        <form onSubmit={handleEchoPublishSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Echo Connection Note</label>
            <input 
              type="text" 
              placeholder="e.g., Grabbing coffee too! Down to check this out." 
              value={userEchoNote}
              onChange={(e) => setUserEchoNote(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Snapshot (Optional)</span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAttachPhotoToEcho(!attachPhotoToEcho);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all",
                  attachPhotoToEcho 
                    ? "bg-rose-500 text-white" 
                    : "bg-zinc-850 text-zinc-400 border border-zinc-800"
                )}
              >
                {attachPhotoToEcho ? "Disable Camera" : "Enable Camera"}
              </button>
            </div>

            {attachPhotoToEcho ? (
              <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black p-1 max-h-80 relative">
                <VibePhotoCapture
                  currentLocationName={activeEchoVibe.name}
                  onCapture={(filteredUri, rawUri) => {
                    setEchoCapturedImage(filteredUri);
                    setEchoCapturedFrontImage(rawUri || filteredUri);
                    setEchoCaptureTimestamp(Date.now());
                    setAttachPhotoToEcho(false);
                  }}
                  onClose={() => setAttachPhotoToEcho(false)}
                />
              </div>
            ) : echoCapturedImage ? (
              <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900 relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                  <img src={echoCapturedImage} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">✓ Snapshot Attached</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Captured {echoCaptureTimestamp ? new Date(echoCaptureTimestamp).toLocaleTimeString() : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEchoCapturedImage(null);
                    setEchoCapturedFrontImage(null);
                    setEchoCaptureTimestamp(null);
                  }}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-white text-xs font-bold font-mono"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="text-center py-2 text-zinc-500 text-[11px]">
                No live proof attached. (Sending a photo is optional)
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-montserrat h-11 uppercase tracking-wider text-xs font-bold rounded-xl hover:brightness-110 active:scale-97 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-4 h-4 fill-white" />
            Transmit Echo Connection
          </button>
        </form>
      </motion.div>
    </div>
  );
};
