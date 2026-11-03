import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sparkles, Info, Check } from 'lucide-react';

interface CameraViewportProps {
  cameraMode: 'viewfinder' | 'preview';
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  latitude: number | null;
  longitude: number | null;
  cityName?: string | null;
  currentLocationName: string;
  inferredVibeLabel: string;
  isRecording: boolean;
  recordingSeconds: number;
  isCapturing: boolean;
  capturedUrl: string | null;
  captureType: 'photo' | 'video';
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  cameraMode,
  videoRef,
  canvasRef,
  latitude,
  longitude,
  cityName,
  currentLocationName,
  inferredVibeLabel,
  isRecording,
  recordingSeconds,
  isCapturing,
  capturedUrl,
  captureType,
}) => {
  return (
    <div className="flex-1 min-h-[220px] relative flex items-center justify-center bg-black/90 p-4 overflow-hidden select-none">
      {cameraMode === 'viewfinder' ? (
        <div className="w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden relative shadow-2xl border border-zinc-900/80">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />

          <canvas
            ref={canvasRef}
            width={480}
            height={640}
            className="w-full h-full object-cover bg-black"
          />

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-2 border-white/5 rounded-3xl">
            <div className="border border-dashed border-white/10 w-[80%] h-[80%] rounded-[50%]" />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70%] h-[35%] border border-[#ffffff]/5 rounded-[50%]" />

            <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-1 text-[9px] font-mono text-left max-w-[80%]">
              <span className="text-[#30D158] font-bold">✓ Active Location Calibration</span>
              <span className="text-white truncate">
                Lat: {latitude ? `${latitude.toFixed(4)}°` : 'Active'}
              </span>
              <span className="text-white truncate">
                Lng: {longitude ? `${longitude.toFixed(4)}°` : 'Active'}
              </span>
            </div>

            <div className="absolute top-4 right-4 bg-black/85 border border-white/10 text-white rounded-lg px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider">
              🔬 VibeQuest Live Lens
            </div>
          </div>

          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/85 backdrop-blur-md border border-[#FF375F] px-3 py-1.5 rounded-full z-30 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF375F] animate-ping" />
              <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                REC • {recordingSeconds}s
              </span>
            </div>
          )}

          {isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 select-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={10 - recordingSeconds}
                  initial={{ opacity: 0, scale: 0.1, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 2.2, y: 20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{
                    textShadow:
                      '0 0 25px rgba(255, 55, 95, 0.8), 0 0 10px rgba(255, 55, 95, 0.6)',
                  }}
                  className="text-8xl font-mono font-black text-rose-500 flex items-center justify-center"
                >
                  {10 - recordingSeconds}
                </motion.div>
              </AnimatePresence>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[9.5px] font-mono font-black tracking-[0.25em] text-zinc-400 uppercase mt-3 bg-black/75 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md"
              >
                Capturing Live Vibe
              </motion.span>
            </div>
          )}

          {isCapturing && (
            <div className="absolute inset-0 bg-white z-40 flex items-center justify-center animate-pulse">
              <div className="text-black font-mono text-xs font-black tracking-widest uppercase">
                CAPTURING VIBE MEDIA...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4 py-2">
          <div className="text-center font-mono">
            <h5 className="text-[13px] font-black uppercase tracking-widest text-emerald-400">
              Captured Output
            </h5>
            <p className="text-[10px] text-zinc-500">Review your clean camera media feed below</p>
          </div>

          <div className="w-full aspect-[3/4] bg-zinc-950 rounded-3xl border border-zinc-850 p-1 relative overflow-hidden flex items-center justify-center shadow-2xl">
            {capturedUrl ? (
              captureType === 'video' ? (
                <video
                  src={capturedUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <img
                  src={capturedUrl}
                  alt="Captured Output"
                  className="w-full h-full object-cover rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              )
            ) : (
              <span className="text-zinc-500 text-[10px] font-mono">Processing photo...</span>
            )}
            <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md border border-white/5 rounded px-2.5 py-1 text-[8.5px] tracking-widest text-zinc-400 font-bold uppercase font-mono">
              ✓ Authenticated Frame
            </span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/40 rounded-2xl px-4 py-2.5 text-[11px] max-w-xs text-zinc-400 leading-relaxed text-center">
            <Info className="w-4 h-4 text-[#3478F6] shrink-0" />
            <span>Optic indices and positioning data securely encoded within local container.</span>
          </div>
        </div>
      )}
    </div>
  );
};
