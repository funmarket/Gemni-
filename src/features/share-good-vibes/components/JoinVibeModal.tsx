import React from 'react';
import { motion } from 'motion/react';
import { X, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VibePhotoCapture } from '@/components/share/VibePhotoCapture';

interface JoinVibeModalProps {
  activeJoinVibe: { id: string; text: string; user: string; vibeTag: string; icon?: string; backPhoto?: string | null };
  onClose: () => void;
  userJoinNote: string;
  setUserJoinNote: (val: string) => void;
  attachPhotoToJoin: boolean;
  setAttachPhotoToJoin: (val: boolean) => void;
  joinCapturedImage: string | null;
  setJoinCapturedImage: (val: string | null) => void;
  joinCapturedFrontImage: string | null;
  setJoinCapturedFrontImage: (val: string | null) => void;
  joinCaptureTimestamp: number | null;
  setJoinCaptureTimestamp: (val: number | null) => void;
  handleJoinVibeSubmit: (e: React.FormEvent) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export const JoinVibeModal: React.FC<JoinVibeModalProps> = ({
  activeJoinVibe,
  onClose,
  userJoinNote,
  setUserJoinNote,
  attachPhotoToJoin,
  setAttachPhotoToJoin,
  joinCapturedImage,
  setJoinCapturedImage,
  joinCapturedFrontImage,
  setJoinCapturedFrontImage,
  joinCaptureTimestamp,
  setJoinCaptureTimestamp,
  handleJoinVibeSubmit,
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
            <HeartHandshake className="w-5 h-5 text-emerald-400" /> Connect Vibe
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer absolute right-0 top-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeJoinVibe.icon || '✨'}</span>
            <div>
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Join Vibe: {activeJoinVibe.user}</h4>
              <p className="text-xs font-semibold text-zinc-100">{activeJoinVibe.text}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400">
          Send a personalized request or note to register alignment. The vibe creator can add you to their connection circle or community!
        </p>

        <form onSubmit={handleJoinVibeSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Connection Request Note</label>
            <input 
              type="text" 
              placeholder="e.g., Let's connect! I'm nearby at the park too." 
              value={userJoinNote}
              onChange={(e) => setUserJoinNote(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Snapshot (Optional)</span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAttachPhotoToJoin(!attachPhotoToJoin);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all",
                  attachPhotoToJoin 
                    ? "bg-emerald-500 text-black font-extrabold" 
                    : "bg-zinc-800 text-zinc-400 border border-zinc-800"
                )}
              >
                {attachPhotoToJoin ? "Disable Camera" : "Enable Camera"}
              </button>
            </div>

            {attachPhotoToJoin ? (
              <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black p-1 max-h-80 relative">
                <VibePhotoCapture
                  currentLocationName={activeJoinVibe.text}
                  onCapture={(filteredUri, rawUri) => {
                    setJoinCapturedImage(filteredUri);
                    setJoinCapturedFrontImage(rawUri || filteredUri);
                    setJoinCaptureTimestamp(Date.now());
                    setAttachPhotoToJoin(false);
                  }}
                  onClose={() => setAttachPhotoToJoin(false)}
                />
              </div>
            ) : joinCapturedImage ? (
              <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-900 relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                  <img src={joinCapturedImage} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">✓ Snapshot Attached</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Captured {joinCaptureTimestamp ? new Date(joinCaptureTimestamp).toLocaleTimeString() : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setJoinCapturedImage(null);
                    setJoinCapturedFrontImage(null);
                    setJoinCaptureTimestamp(null);
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-montserrat h-11 uppercase tracking-widest text-xs font-black rounded-xl hover:brightness-110 active:scale-97 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
            Transmit Join Connection
          </button>
        </form>
      </motion.div>
    </div>
  );
};
