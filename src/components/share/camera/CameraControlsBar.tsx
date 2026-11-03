import React from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Video, Play, Square, Check } from 'lucide-react';

interface CameraControlsBarProps {
  cameraMode: 'viewfinder' | 'preview';
  captureType: 'photo' | 'video';
  isRecording: boolean;
  recordingSeconds: number;
  onSetCaptureType: (type: 'photo' | 'video') => void;
  onToggleLens: () => void;
  onShutterPhoto: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSaveAndExit: () => void;
  onRetake: () => void;
}

export const CameraControlsBar: React.FC<CameraControlsBarProps> = ({
  cameraMode,
  captureType,
  isRecording,
  recordingSeconds,
  onSetCaptureType,
  onToggleLens,
  onShutterPhoto,
  onStartRecording,
  onStopRecording,
  onSaveAndExit,
  onRetake,
}) => {
  return (
    <div className="p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] md:pb-6 bg-[#0d0d12]/95 border-t border-zinc-900/80 shrink-0">
      {cameraMode === 'viewfinder' ? (
        <div className="space-y-4">
          {/* Mode Selector Tabs */}
          <div className="flex justify-center gap-6 font-mono text-[10px] uppercase tracking-wider select-none border-b border-zinc-900/40 pb-2.5">
            <button
              type="button"
              onClick={() => onSetCaptureType('photo')}
              className={`py-1.5 px-3.5 rounded-full transition-all cursor-pointer font-bold ${
                captureType === 'photo'
                  ? 'text-white bg-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Photo Mode
            </button>
            <button
              type="button"
              onClick={() => onSetCaptureType('video')}
              className={`py-1.5 px-3.5 rounded-full transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                captureType === 'video'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>10s Video</span>
            </button>
          </div>

          {/* Operation Controls Row */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              type="button"
              onClick={onToggleLens}
              disabled={isRecording}
              className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 active:scale-90 flex items-center justify-center cursor-pointer transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none"
              title="Switch camera facing lens"
            >
              <RefreshCw className="w-[18px] h-[18px]" />
            </button>

            {/* Shutter Button */}
            {captureType === 'photo' ? (
              <button
                type="button"
                onClick={onShutterPhoto}
                className="relative flex items-center justify-center focus:outline-none cursor-pointer group select-none active:scale-95"
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  border: '3.5px solid #FFFFFF',
                  padding: '4px',
                }}
              >
                <div className="rounded-full bg-white transition-all duration-300 w-full h-full group-hover:scale-105 active:scale-90" />
              </button>
            ) : (
              <div className="relative w-[84px] h-[84px] flex items-center justify-center select-none">
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                  viewBox="0 0 84 84"
                >
                  <circle
                    cx="42"
                    cy="42"
                    r="37"
                    className="stroke-zinc-800/60"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  {isRecording && (
                    <motion.circle
                      cx="42"
                      cy="42"
                      r="37"
                      className="stroke-emerald-400"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 37}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 37 -
                          (recordingSeconds / 10) * (2 * Math.PI * 37),
                      }}
                      transition={{ duration: 0.25, ease: 'linear' }}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                <button
                  type="button"
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className="relative flex items-center justify-center focus:outline-none cursor-pointer active:scale-95 transition-all z-10"
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                  }}
                >
                  {isRecording ? (
                    <motion.div
                      animate={{
                        scale: [0.95, 1.15, 0.95],
                        borderRadius: ['50%', '35%', '50%'],
                      }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      className="w-8 h-8 bg-[#FF375F] flex items-center justify-center shadow-[0_0_15px_rgba(255,55,95,0.7)]"
                    >
                      <Square className="w-3.5 h-3.5 text-white fill-white" />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full rounded-full border-[3.5px] border-zinc-500 bg-zinc-900/40 hover:bg-zinc-800/60 flex items-center justify-center transition-colors">
                      <div className="w-11 h-11 rounded-full bg-zinc-300 hover:scale-105 transition-transform flex items-center justify-center">
                        <Play className="w-4 h-4 text-zinc-950 fill-zinc-950 ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              </div>
            )}

            <div className="w-12 h-12 flex items-center justify-center opacity-0" />
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          <button
            type="button"
            onClick={onSaveAndExit}
            className="w-full h-13 rounded-2xl bg-[#FF375F] hover:bg-[#ff3b68] active:scale-[0.98] transition-all text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
          >
            <span>Attach & Use {captureType === 'video' ? 'Video' : 'Shot'}</span>
            <Check className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="w-full h-13 rounded-2xl bg-zinc-950 hover:bg-zinc-900 transition-colors border border-zinc-900 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer"
          >
            Retake {captureType === 'video' ? 'Video' : 'Shot'}
          </button>
        </div>
      )}
    </div>
  );
};
