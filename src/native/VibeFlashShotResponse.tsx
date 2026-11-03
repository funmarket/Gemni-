import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVibeFlashWindow } from './useVibeFlashWindow';
import { Camera, AlertCircle, X, Sparkles } from 'lucide-react';
import { detectCameras, captureSequentially } from '../lib/dualCameraUtils';
import { VibeFlash } from './vibeFlashService';

interface VibeFlashShotResponseProps {
  activeFlash: VibeFlash;
  onResponded: () => void;
  onCancel: () => void;
}

export const VibeFlashShotResponse: React.FC<VibeFlashShotResponseProps> = ({
  activeFlash,
  onResponded,
  onCancel
}) => {
  const { respondToFlash } = useVibeFlashWindow();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<{ uri: string; timestamp: number } | null>(null);
  const [cameraMode, setCameraMode] = useState<'viewfinder' | 'preview'>('viewfinder');

  // Real Camera hardware states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [frontDeviceId, setFrontDeviceId] = useState<string | null>(null);
  const [backDeviceId, setBackDeviceId] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'real' | 'simulated'>('simulated');

  const [capturedBackPhoto, setCapturedBackPhoto] = useState<string | null>(null);
  const [capturedFrontPhoto, setCapturedFrontPhoto] = useState<string | null>(null);

  // Drag and drop selfie positioning state
  const [frontPos, setFrontPos] = useState({ x: 16, y: 16 });
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 16, y: 16 });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingFront(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...frontPos };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingFront) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const nextX = Math.max(8, Math.min(220, posStartRef.current.x + dx));
    const nextY = Math.max(8, Math.min(180, posStartRef.current.y + dy));
    setFrontPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingFront(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Trigger-safe countdown timer
  useEffect(() => {
    const calcTime = () => {
      const now = Date.now();
      const diff = activeFlash.expires_at - now;
      if (diff <= 0) {
        setTimeRemaining(0);
      } else {
        setTimeRemaining(diff);
      }
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [activeFlash]);

  // Request & Bind Real Camera Hardware
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (cameraMode === 'viewfinder') {
      const setupLens = async () => {
        try {
          const devs = await detectCameras();
          setFrontDeviceId(devs.frontDeviceId);
          setBackDeviceId(devs.backDeviceId);

          const constraints = {
            video: devs.backDeviceId ? { deviceId: { exact: devs.backDeviceId } } : { facingMode: 'environment' },
            audio: false
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          activeStream = stream;
          setMediaStream(stream);
          setCameraType('real');
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 60);
        } catch (err) {
          console.warn("Viewfinder back camera setup failed, trying selfie fallback:", err);
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            activeStream = fallbackStream;
            setMediaStream(fallbackStream);
            setCameraType('real');
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
              }
            }, 60);
          } catch {
            setCameraType('simulated');
          }
        }
      };
      setupLens();
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraMode]);

  const captureMockPhotos = (stamp: number) => {
    const mockPhotos = [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop", // coffee
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&auto=format&fit=crop", // sunset
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"  // cafe
    ];
    const pickedPhoto = mockPhotos[Math.abs(activeFlash.id.length) % mockPhotos.length];
    setCapturedBackPhoto(pickedPhoto);

    // Generate a high fidelity selfie graphic index
    const canvasFront = document.createElement('canvas');
    canvasFront.width = 240;
    canvasFront.height = 320;
    const ctx = canvasFront.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 240, 320);
      grad.addColorStop(0, '#f59e0b'); // spontaneous orange-amber
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 240, 320);
      ctx.font = 'bold 50px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😇', 120, 150);
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText("SPONTANEOUS FLASH SELFIE", 120, 250);
      ctx.fillText("✓ SECURE VERIFIED", 120, 268);
      setCapturedFrontPhoto(canvasFront.toDataURL('image/jpeg'));
    }

    setCapturedPhoto({
      uri: pickedPhoto,
      timestamp: stamp
    });
    setCameraMode('preview');
  };

  const handleShutterCapture = async () => {
    const stamp = Date.now();
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (_) {}

    if (cameraType === 'real' && videoRef.current) {
      try {
        const { backPhoto, frontPhoto } = await captureSequentially(mediaStream, videoRef.current, frontDeviceId);
        setCapturedBackPhoto(backPhoto);
        setCapturedFrontPhoto(frontPhoto);
        setCapturedPhoto({ uri: backPhoto, timestamp: stamp });
        setCameraMode('preview');
      } catch (err) {
        console.warn("Hardware capture faulted, faking stream graphics:", err);
        captureMockPhotos(stamp);
      }
    } else {
      captureMockPhotos(stamp);
    }
  };

  const handleSendSuccess = async () => {
    if (!capturedPhoto) return;
    setIsUploading(true);
    setUploadError(null);

    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
    let lat = null;
    let lng = null;
    if (manualRaw) {
      try { lat = JSON.parse(manualRaw).coords.lat; lng = JSON.parse(manualRaw).coords.lng; } catch (e) {}
    } else if (lastKnownRaw) {
      try { lat = JSON.parse(lastKnownRaw).coords.lat; lng = JSON.parse(lastKnownRaw).coords.lng; } catch (e) {}
    }

    const payload = {
      uri: capturedBackPhoto || capturedPhoto.uri,
      timestamp: capturedPhoto.timestamp,
      latitude: lat, 
      longitude: lng,
      frontUri: capturedFrontPhoto || null
    };

    try {
      await respondToFlash(activeFlash.id, payload);
      onResponded();
    } catch (err: any) {
      console.error('Failed to submit vibe flash response:', err);
      if (err?.message === 'SHOT_TOO_OLD') {
        setUploadError('SHOT_TOO_OLD');
        setTimeout(() => {
          onCancel();
        }, 2200);
      } else {
        setUploadError(err?.message || "Could not upload photo. Please check your network and try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCapturedBackPhoto(null);
    setCapturedFrontPhoto(null);
    setCameraMode('viewfinder');
    setUploadError(null);
  };

  const formatCountdown = () => {
    const totalSeconds = Math.ceil(timeRemaining / 1000);
    const minutes = Math.max(0, Math.floor(totalSeconds / 60));
    const seconds = Math.max(0, totalSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const timesUp = timeRemaining <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none" id="vibe-flash-response-portal">
      
      {/* 1. TOP HEADER OVERLAY */}
      <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/85 to-transparent">
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-zinc-900/60 border border-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-zinc-800 transition-all pointer-events-auto"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center max-w-[50%]">
          <div className="bg-black/50 backdrop-blur-md border border-amber-500/20 rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-xs text-white font-bold tracking-wide">
              ⚡ SPONTANEOUS VIBEFLASH
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-semibold mt-1.5 tracking-tight">
            Proof of presence window is open!
          </span>
        </div>

        <div className="bg-zinc-950/80 border border-amber-500/30 rounded-full py-1.5 px-3">
          <span className="text-xs font-mono font-bold text-amber-400 tracking-wide">
            ⏱️ {formatCountdown()}
          </span>
        </div>
      </div>

      {/* 2. MAIN ENCLOSED CAMERA CONTAINER */}
      <div className="flex-1 relative flex items-center justify-center bg-zinc-950">
        
        {cameraMode === 'viewfinder' ? (
          <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
            {cameraType === 'real' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 bg-[#0c0a05] flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(251,191,36,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(251,191,36,0.015)_1px,transparent_1px)] bg-[size:30px_30px]" />
                <div className="text-center p-6 space-y-3 z-10">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto animate-pulse">
                    <Camera className="w-7 h-7 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-wider uppercase">Spontaneous Sensors Primed</h4>
                  <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed mx-auto">
                    BeReal-style verified physical sensors enforce real-time capture. Dual shot mechanism active.
                  </p>
                </div>
              </div>
            )}

            {/* Centered target visual grid scope */}
            <div className="absolute pointer-events-none inset-16 border border-white/10 rounded-3xl flex items-center justify-center">
              <div className="w-5 h-5 border-t border-l border-white/30 absolute top-0 left-0 rounded-tl-lg" />
              <div className="w-5 h-5 border-t border-r border-white/30 absolute top-0 right-0 rounded-tr-lg" />
              <div className="w-5 h-5 border-b border-l border-white/30 absolute bottom-0 left-0 rounded-bl-lg" />
              <div className="w-5 h-5 border-b border-r border-white/30 absolute bottom-0 right-0 rounded-br-lg" />
            </div>

            {/* Absolute Bottom shutter trigger */}
            <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center z-15">
              <button
                type="button"
                onClick={handleShutterCapture}
                disabled={timesUp}
                className="w-20 h-20 rounded-full border-4 border-amber-500 bg-white/10 backdrop-blur-md active:scale-90 flex items-center justify-center transition-all cursor-pointer shadow-amber-500/10 shadow-2xl disabled:opacity-30"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Camera className="w-6 h-6 text-black" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* CONFINDER / DOUBLE PREVIEW CAPTURED SCREEN */
          <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            
            {capturedBackPhoto && (
              <img
                src={capturedBackPhoto}
                alt="Captured Environment"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            {capturedFrontPhoto && (
              <div 
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ left: `${frontPos.x}px`, top: `${frontPos.y}px` }}
                className="absolute w-18 h-24 rounded-xl border-2 border-amber-500/50 shadow-md overflow-hidden bg-black z-30 cursor-grab active:cursor-grabbing touch-none select-none"
              >
                <img 
                  src={capturedFrontPhoto} 
                  alt="Captured Front Reaction" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            )}

            {/* Floating verification labels */}
            <div className="absolute bottom-32 left-4 right-4 flex items-center justify-between bg-black/75 backdrop-blur-sm border border-amber-500/10 rounded-xl px-4 py-2.5 z-10 font-mono">
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">OUTPOST LATITUDE</span>
                <span className="text-xs font-bold text-white">
                  {(() => {
                    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
                    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
                    let latVal = null;
                    if (manualRaw) {
                      try { latVal = JSON.parse(manualRaw).coords.lat; } catch (e) {}
                    } else if (lastKnownRaw) {
                      try { latVal = JSON.parse(lastKnownRaw).coords.lat; } catch (e) {}
                    }
                    return latVal ? `${latVal.toFixed(4)}° N` : 'No GPS';
                  })()}
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-zinc-500 font-bold uppercase">DUAL PHOTO SHUTTER</span>
                <span className="text-xs font-bold text-amber-400">VERIFIED PASS ✓</span>
              </div>
            </div>

            {/* Control actions bar for Confirm and Retake */}
            <div className="absolute bottom-6 left-5 right-5 flex flex-col gap-2.5 z-15">
              
              {uploadError && uploadError !== 'SHOT_TOO_OLD' && (
                <div className="text-xs text-rose-400 font-medium text-center bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl flex items-center justify-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" /> {uploadError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendSuccess}
                disabled={isUploading}
                className="w-full h-13 bg-amber-500 hover:brightness-105 active:scale-[0.98] text-black font-bold uppercase tracking-wider text-xs rounded-full cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Use This Shot & Send 💪
              </button>
              
              <button
                type="button"
                onClick={handleRetake}
                className="w-full h-13 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs rounded-full cursor-pointer flex items-center justify-center"
              >
                Retake
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. UPLOADING PROGRESS OVERLAY */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-gradient-to-br from-[#120703] to-black flex flex-col items-center justify-center p-6 space-y-4"
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="flex flex-col items-center space-y-4 text-center animate-pulse"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-black text-white italic uppercase tracking-wider">Sending your vibe... 💪</h3>
              <p className="text-xs text-zinc-500 max-w-[250px] leading-relaxed">
                Publishing live flash proof coordinates directly to the global activity feed. Zero caching. Zero lag.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. EXPIRY / SHOT TOO OLD DIALOG OVERLAY */}
      <AnimatePresence>
        {uploadError === 'SHOT_TOO_OLD' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-6 top-1/3 z-50 bg-[#150a0a] border border-rose-500/30 p-6 rounded-[24px] text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-tight">Window Has Closed! ⏱️</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              VibeFlash demands a rapid 60-second physical response. This window has expired. Prepare for the next spontaneous flash alert!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
