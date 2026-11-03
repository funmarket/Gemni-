import React from 'react';
import { motion } from 'motion/react';
import { Camera, X, CheckCircle2, AlertCircle, Check, Compass } from 'lucide-react';
import { getDevicePosition } from '@/shared/services/device/geolocation';
import { VibePhotoCapture } from '@/components/share/VibePhotoCapture';
import { getScrollHideStyles } from '@/features/share-good-vibes/utils/scrollVisibilityStyles';

interface ShareVibeModalProps {
  showShareVibeModal: boolean;
  onClose: () => void;
  vibeCaptureStep: 'viewfinder' | 'preview' | 'details';
  setVibeCaptureStep: (step: 'viewfinder' | 'preview' | 'details') => void;
  vibeCaptureTimestamp: number | null;
  setVibeCaptureTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  vibeCapturedImage: string | null;
  setVibeCapturedImage: (val: string | null) => void;
  vibeCapturedFrontImage: string | null;
  setVibeCapturedFrontImage: (val: string | null) => void;
  isVibeVideo: boolean;
  setIsVibeVideo: (val: boolean) => void;
  vibeCaptureLat: number | null;
  setVibeCaptureLat: (val: number | null) => void;
  vibeCaptureLng: number | null;
  setVibeCaptureLng: (val: number | null) => void;
  newVibeLocation: string;
  setNewVibeLocation: (val: string) => void;
  isFlashActive: boolean;
  gpsStatus: 'idle' | 'fetching' | 'success' | 'failed';
  setGpsStatus: (val: 'idle' | 'fetching' | 'success' | 'failed') => void;
  frontPos: { x: number; y: number };
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handleVibePublishSubmit: (e: React.FormEvent) => void;
  handleResetCamera: () => void;
  newVibeNote: string;
  setNewVibeNote: (val: string) => void;
  newVibeTag: string;
  setNewVibeTag: (val: string) => void;
  selectedVibeEmoji: string;
  setSelectedVibeEmoji: (val: string) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
  shareModalRef: React.RefObject<any>;
}

export const ShareVibeModal: React.FC<ShareVibeModalProps> = ({
  showShareVibeModal,
  onClose,
  vibeCaptureStep,
  setVibeCaptureStep,
  vibeCaptureTimestamp,
  setVibeCaptureTimestamp,
  currentTime,
  setCurrentTime,
  vibeCapturedImage,
  setVibeCapturedImage,
  vibeCapturedFrontImage,
  setVibeCapturedFrontImage,
  isVibeVideo,
  setIsVibeVideo,
  vibeCaptureLat,
  setVibeCaptureLat,
  vibeCaptureLng,
  setVibeCaptureLng,
  newVibeLocation,
  setNewVibeLocation,
  isFlashActive,
  gpsStatus,
  setGpsStatus,
  frontPos,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleVibePublishSubmit,
  handleResetCamera,
  newVibeNote,
  setNewVibeNote,
  newVibeTag,
  setNewVibeTag,
  selectedVibeEmoji,
  setSelectedVibeEmoji,
  triggerHaptic,
  shareModalRef,
}) => {
  if (!showShareVibeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      <motion.div 
        ref={shareModalRef}
        style={getScrollHideStyles()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-md text-left space-y-4 my-8 relative overflow-hidden"
      >
        {/* White overlay flash overlay for shutter snap physics representation */}
        <div 
          className="absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-300" 
          style={{ opacity: isFlashActive ? 0.9 : 0 }}
        />

        <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
          <h3 className="font-bold text-[16px] text-zinc-100 uppercase tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-500 animate-pulse" /> 
            {vibeCaptureStep === 'viewfinder' && "Step 1: Capture Presence"}
            {vibeCaptureStep === 'preview' && "Step 2: Presence Verification"}
            {vibeCaptureStep === 'details' && "Step 3: Broadcast Details"}
          </h3>
          <button 
            onClick={() => {
              triggerHaptic('light');
              onClose();
              setVibeCaptureStep('viewfinder');
            }}
            className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: VIEWFINDER SCREEN (Zero-gallery interface) */}
        {vibeCaptureStep === 'viewfinder' && (
          <div className="space-y-4">
            <VibePhotoCapture
              currentLocationName={newVibeLocation || "Dolores Park Node"}
              onCapture={(filteredUri, rawUri, mediaType) => {
                const stamp = Date.now();
                setVibeCaptureTimestamp(stamp);
                setCurrentTime(stamp);
                setVibeCapturedImage(filteredUri);
                setVibeCapturedFrontImage(rawUri || filteredUri);
                setIsVibeVideo(mediaType === 'video');
                
                // Check/request location coordinates synchronously
                setGpsStatus('fetching');
                getDevicePosition()
                  .then((pos) => {
                    setVibeCaptureLat(pos.latitude);
                    setVibeCaptureLng(pos.longitude);
                    setGpsStatus('success');
                  })
                  .catch(() => {
                    setGpsStatus('failed');
                    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
                    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
                    let defaultLat = null;
                    let defaultLng = null;
                    if (manualRaw) {
                      try {
                        const parsed = JSON.parse(manualRaw);
                        defaultLat = parsed.coords.lat;
                        defaultLng = parsed.coords.lng;
                      } catch (e) {}
                    } else if (lastKnownRaw) {
                      try {
                        const parsed = JSON.parse(lastKnownRaw);
                        defaultLat = parsed.coords.lat;
                        defaultLng = parsed.coords.lng;
                      } catch (e) {}
                    }
                    setVibeCaptureLat(defaultLat);
                    setVibeCaptureLng(defaultLng);
                  });

                setVibeCaptureStep('preview');
              }}
              onClose={() => {
                triggerHaptic('light');
                onClose();
              }}
            />
          </div>
        )}

        {/* STEP 2: VERIFICATION PREVIEW SCREEN (With the 5m timestamp check & Accelerator test) */}
        {vibeCaptureStep === 'preview' && vibeCaptureTimestamp && (
          <div className="space-y-4">
            {/* Render snaps inside a simulated dual cam view */}
            <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 h-64 overflow-hidden shadow-inner flex items-center justify-center">
              {vibeCapturedImage ? (
                isVibeVideo || vibeCapturedImage.startsWith('data:video/') || vibeCapturedImage.startsWith('blob:') ? (
                  <video 
                    src={vibeCapturedImage} 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={vibeCapturedImage} 
                    alt="Captured Scenery" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="text-zinc-500 text-xs font-mono">Processing back framing...</div>
              )}

              {vibeCapturedFrontImage && (
                <div 
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  style={{ left: `${frontPos.x}px`, top: `${frontPos.y}px` }}
                  className="absolute w-18 h-24 rounded-xl border-2 border-rose-500/50 shadow-md overflow-hidden bg-black z-30 cursor-grab active:cursor-grabbing touch-none select-none"
                >
                  {isVibeVideo || vibeCapturedFrontImage.startsWith('data:video/') || vibeCapturedFrontImage.startsWith('blob:') ? (
                    <video 
                      src={vibeCapturedFrontImage} 
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <img 
                      src={vibeCapturedFrontImage} 
                      alt="Captured Front Selfie" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}
                </div>
              )}

              {/* Sequential latency marker watermark badge under 400ms target constraint */}
              <div className="absolute top-4 right-4 bg-black/80 px-2 py-1 rounded border border-[#f43f5e]/20 text-[8px] font-mono font-bold text-rose-300 tracking-wider">
                ⚡ DUAL-CAM (150ms sequential offset)
              </div>
            </div>

            {/* Security Validator Information */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Capture GPS Outpost:</span>
                <span className="text-zinc-300 text-right">{newVibeLocation} ({gpsStatus === 'success' ? "✓ Geo-Referenced" : "Offline Fixed fallback"})</span>
              </div>

              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Capture Timestamp:</span>
                <span className="text-zinc-300 font-semibold">{new Date(vibeCaptureTimestamp).toLocaleTimeString()} ({Math.max(0, Math.floor((currentTime - vibeCaptureTimestamp) / 1000))}s ago)</span>
              </div>

              {/* Strict age validation indicator */}
              <div className="py-1">
                {Math.max(0, Math.floor((currentTime - vibeCaptureTimestamp) / 1000)) < 300 ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-start gap-2.5 leading-snug">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="font-bold">✓ SECURE PASSING VALIDATOR</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Proof age is {Math.floor((currentTime - vibeCaptureTimestamp) / 1000)}s &lt; 5 mins threshold. Live verification verified.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl flex items-start gap-2.5 leading-snug">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-bold">🛑 PROOF LOCKED / EXPIRED</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Security age is {Math.floor((currentTime - vibeCaptureTimestamp) / 60)}m {Math.floor((currentTime - vibeCaptureTimestamp) % 60)}s (exceeds 5 mins limit). Upload block triggered. Please retake.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Debug test accelerator button to let user instantly test/prove the 5-minute locked state triggers correctly */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setVibeCaptureTimestamp(prev => prev ? prev - 301000 : null);
                  }}
                  className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-[9px] uppercase font-black tracking-widest border border-yellow-500/25 active:scale-95 transition-all text-center leading-none"
                >
                  ⚡ Accelerate Time +5 Mins (Test Expire Rule)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setVibeCaptureStep('viewfinder');
                  setVibeCapturedImage(null);
                  setVibeCapturedFrontImage(null);
                  setVibeCaptureTimestamp(null);
                }}
                className="bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 border border-zinc-800 rounded-xl h-11 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Retake Photo
              </button>

              <button
                type="button"
                disabled={Math.max(0, Math.floor((currentTime - vibeCaptureTimestamp) / 1000)) >= 300}
                onClick={() => {
                  triggerHaptic('medium');
                  setVibeCaptureStep('details');
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 disabled:opacity-40 hover:brightness-110 active:scale-97 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider transition-all"
              >
                Use This Shot ✓
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS & DESCRIPTION SCREEN */}
        {vibeCaptureStep === 'details' && (
          <form onSubmit={handleVibePublishSubmit} className="space-y-4">
            <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-900">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                {vibeCapturedImage && <img src={vibeCapturedImage} alt="Locked" className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-300 uppercase">Live Proof Verified</p>
                <p className="text-[10px] text-zinc-500 font-mono">Location coordinates locked: {newVibeLocation}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Short vibe description note</label>
              <input 
                type="text" 
                placeholder="e.g., catching sunset with mellow beats, warm tea..." 
                value={newVibeNote}
                onChange={(e) => setNewVibeNote(e.target.value)}
                required
                maxLength={100}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Coordinate Region</label>
                <input 
                  type="text" 
                  placeholder="e.g. Dolores Park" 
                  value={newVibeLocation}
                  onChange={(e) => setNewVibeLocation(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vibe Tag</label>
                <select 
                  value={newVibeTag}
                  onChange={(e) => {
                    setNewVibeTag(e.target.value);
                    // Auto-assign suitable emoji
                    const emojis: Record<string, string> = {
                      Chill: "🧘", Creative: "🎨", Energetic: "⚡", Reflective: "🌌", Playful: "🎈"
                    };
                    setSelectedVibeEmoji(emojis[e.target.value] || "✨");
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none cursor-pointer"
                >
                  <option value="Chill">Chill 🧘</option>
                  <option value="Creative">Creative 🎨</option>
                  <option value="Energetic">Energetic ⚡</option>
                  <option value="Reflective">Reflective 🌌</option>
                  <option value="Playful">Playful 🎈</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-montserrat h-11 uppercase tracking-wider text-xs font-bold rounded-xl hover:brightness-110 active:scale-97 transition-all flex items-center justify-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Transmit Presence Stream
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
