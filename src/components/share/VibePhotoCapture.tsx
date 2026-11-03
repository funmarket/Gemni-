import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, MapPin } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { CameraViewport } from './camera/CameraViewport';
import { CameraControlsBar } from './camera/CameraControlsBar';

interface VibePhotoCaptureProps {
  currentLocationName?: string;
  onCapture: (filteredImageUri: string, rawImageUri?: string, mediaType?: 'photo' | 'video') => void;
  onClose: () => void;
  initialMode?: 'photo' | 'video';
}

export const VibePhotoCapture: React.FC<VibePhotoCaptureProps> = ({
  currentLocationName = 'Local Outpost',
  onCapture,
  onClose,
  initialMode = 'photo',
}) => {
  const { latitude, longitude, cityName } = useGeolocation();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraMode, setCameraMode] = useState<'viewfinder' | 'preview'>('viewfinder');
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('user');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState<'photo' | 'video'>(initialMode);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  const inferredVibe = {
    label: '🌊 Maritime Coastal Wave Breeze',
    accentColor: '#3478F6',
  };

  const startLens = async (facing: 'environment' | 'user' = 'user') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: facing, width: 640, height: 480 },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setActiveFacingMode(facing);
    } catch {
      // Graceful fallback to canvas animation
    }
  };

  useEffect(() => {
    startLens('user');
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Continuous canvas render loop
  useEffect(() => {
    if (cameraMode !== 'viewfinder') return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      offset += 0.03;

      ctx.clearRect(0, 0, width, height);

      if (video && video.readyState >= 2) {
        ctx.save();
        if (activeFacingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        ctx.restore();
      } else {
        // Fallback stylish animated backdrop
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#020205');
        grad.addColorStop(1, '#0e0b16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.translate(width / 2 + Math.sin(offset) * 8, height / 2 + Math.cos(offset) * 6);
        ctx.fillStyle = '#22223a';
        ctx.beginPath();
        ctx.ellipse(0, 0, 65, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [cameraMode, activeFacingMode]);

  const handleShutterCapture = () => {
    setIsCapturing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const uri = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedUrl(uri);
      setCameraMode('preview');
    }
    setIsCapturing(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = window.setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 9) {
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
    recordingTimerRef.current = interval;
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setCapturedUrl(canvas.toDataURL('image/jpeg', 0.9));
      setCameraMode('preview');
    }
  };

  const handleToggleLens = () => {
    const next = activeFacingMode === 'environment' ? 'user' : 'environment';
    startLens(next);
  };

  const handleSaveAndExit = () => {
    if (capturedUrl) {
      onCapture(capturedUrl, capturedUrl, captureType);
    }
  };

  const handleRetake = () => {
    setCapturedUrl(null);
    setRecordingSeconds(0);
    setCameraMode('viewfinder');
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-[#050508]/98 backdrop-blur-xl flex flex-col justify-between overflow-hidden text-white font-sans">
      {/* Top Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-900/40 bg-black/40 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="w-[10px] h-[10px] rounded-full bg-rose-500 animate-pulse" />
          <div>
            <h4 className="text-xs font-mono font-black tracking-wider uppercase flex items-center gap-1">
              <span>Secure Vibe Viewfinder</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
              <MapPin className="w-3 h-3 text-[#3478F6]" />
              <span>
                {currentLocationName || cityName || 'Local Outpost'} | {inferredVibe.label}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer active:scale-90 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <CameraViewport
        cameraMode={cameraMode}
        videoRef={videoRef}
        canvasRef={canvasRef}
        latitude={latitude}
        longitude={longitude}
        cityName={cityName}
        currentLocationName={currentLocationName}
        inferredVibeLabel={inferredVibe.label}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        isCapturing={isCapturing}
        capturedUrl={capturedUrl}
        captureType={captureType}
      />

      {/* Controls Bar */}
      <CameraControlsBar
        cameraMode={cameraMode}
        captureType={captureType}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        onSetCaptureType={(type) => {
          if (isRecording) stopRecording();
          setCaptureType(type);
        }}
        onToggleLens={handleToggleLens}
        onShutterPhoto={handleShutterCapture}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onSaveAndExit={handleSaveAndExit}
        onRetake={handleRetake}
      />
    </div>
  );
};
