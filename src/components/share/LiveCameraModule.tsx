import React, { useEffect, useRef, useState } from 'react';
import { X, Zap, Camera, RefreshCw } from 'lucide-react';
import { socialContentDomain } from '../../domains/d12_social_content';
import { detectCameras, captureSequentially } from '../../lib/dualCameraUtils';

interface LiveCameraModuleProps {
  currentLocationName: string;
  onSuccess: () => void;
  onClose: () => void;
  onCapture?: (imageUri: string, frontUri?: string) => void;
}

export const LiveCameraModule: React.FC<LiveCameraModuleProps> = ({
  currentLocationName,
  onSuccess,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);

  // Hardware tracking
  const [frontDeviceId, setFrontDeviceId] = useState<string | null>(null);
  const [backDeviceId, setBackDeviceId] = useState<string | null>(null);
  const [activeFacingMode, setActiveFacingMode] = useState<'environment' | 'user'>('environment');

  // Helper: Stop all current track sources cleanly
  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Exit 1: User clicks on close manually
  const handleManualClose = () => {
    stopTracks(); // Explicit Exit Path 1
    onClose();
  };

  // Initialize sensors & streams
  const initCamera = async (deviceIdToUse?: string | null, targetFacing: 'environment' | 'user' = 'environment') => {
    stopTracks();
    try {
      // 1. Scan camera hardware
      const devs = await detectCameras();
      setFrontDeviceId(devs.frontDeviceId);
      setBackDeviceId(devs.backDeviceId);

      // 2. Determine best video constraint
      const resolvedDeviceId = deviceIdToUse || (targetFacing === 'environment' ? devs.backDeviceId : devs.frontDeviceId);
      const constraints: MediaStreamConstraints = {
        video: resolvedDeviceId 
          ? { deviceId: { exact: resolvedDeviceId } } 
          : { facingMode: targetFacing },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setErrorText(null);
      setActiveFacingMode(targetFacing);
    } catch (err) {
      console.warn('Camera stream request failed:', err);
      // Attempt generic user permission prompt fallback
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
        setHasPermission(true);
        setErrorText(null);
      } catch (innerErr) {
        console.error('Unified camera permission denied:', innerErr);
        setHasPermission(false);
      }
    }
  };

  // Mount Stream
  useEffect(() => {
    initCamera(null, 'environment');

    // Exit 3: Component unmounts (cleanup)
    return () => {
      stopTracks(); // Explicit Exit Path 3
    };
  }, []);

  const toggleLens = () => {
    const nextFacing = activeFacingMode === 'environment' ? 'user' : 'environment';
    const nextDevice = nextFacing === 'user' ? frontDeviceId : backDeviceId;
    initCamera(nextDevice, nextFacing);
  };

  const handleCapture = async () => {
    if (!videoRef.current || isUploading) return;

    // Vibration feedback on shutter press
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (_) {}

    setIsUploading(true);
    setErrorText(null);

    try {
      // Shutter snap simulation overlay flash
      setFlashOn(true);
      setTimeout(() => setFlashOn(false), 200);

      // Take dual photos sequentially under 400ms Switch Latency target
      const { backPhoto, frontPhoto } = await captureSequentially(
        streamRef.current,
        videoRef.current,
        frontDeviceId
      );

      if (onCapture) {
        onCapture(backPhoto, frontPhoto);
        setShowCheckmark(true);
        setTimeout(() => {
          stopTracks();
          onSuccess();
        }, 500);
        return;
      }

      // Create record
      await socialContentDomain.createPost({
        imageUri: backPhoto,
        image: backPhoto,
        text: caption.trim() || 'Live Camera Capture',
        feeling: caption.trim() || 'Live Camera Capture',
        venueName: currentLocationName || 'Mission Area',
        location: currentLocationName || 'Mission Area',
        emoji: '📸',
        username: 'traveler',
        userId: 'current_user',
        isOnline: true,
      });

      // Show Successful checkmark
      setShowCheckmark(true);

      // Wait 800ms
      setTimeout(() => {
        // Exit 2: Capture finishes successfully
        stopTracks(); // Explicit Exit Path 2
        onSuccess();
      }, 800);

    } catch (err: any) {
      console.error('Failed to capture or upload live vibe:', err);
      setIsUploading(false);
      setErrorText("Couldn't share. Tap to try again.");
      // Soft restore camera preview if sequential swap state faulted
      initCamera(backDeviceId, 'environment');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col justify-between overflow-hidden font-sans select-none" id="live-camera-modal-view">
      
      {/* If permission denied */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#000000] z-20">
          <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#8E8E93] border border-[#2C2C2E]">
            <Camera className="w-8 h-8" />
          </div>
          <p className="text-[14px] text-[#EBEBF5] font-semibold max-w-xs leading-normal">
            Camera access needed to share your vibe.
          </p>
          <button
            type="button"
            onClick={() => initCamera(null, 'environment')}
            className="border-[1.5px] border-[#3A3A3C] text-[#EBEBF5] px-6 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all active:scale-95 hover:bg-white/5 active:border-[#636366]"
          >
            Open Settings / Permit Lens
          </button>
          <span className="text-[12px] text-[#8E8E93] max-w-xs block leading-relaxed">
            Allow camera in your browser settings, then try again.
          </span>
          <button
            type="button"
            onClick={handleManualClose}
            className="text-[14px] text-[#3478F6] font-semibold pt-4"
          >
            Go Back
          </button>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative flex-1 bg-[#000000]">
        {hasPermission && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${activeFacingMode === 'user' ? 'transform -scale-x-100' : ''}`}
          />
        )}

        {/* Overlay Successful Badge */}
        {showCheckmark && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#000000]/60 z-30 transition-all">
            <div className="w-[60px] h-[60px] rounded-full bg-[#30D158] flex items-center justify-center text-white text-2xl font-bold animate-pulse">
              ✓
            </div>
          </div>
        )}

        {/* CONTROLS OVERLAID */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 pointer-events-none">
          
          {/* Top Bar (Pointer-events only on elements) */}
          <div className="flex items-center justify-between w-full pointer-events-auto mt-2">
            <button
              type="button"
              onClick={handleManualClose}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="px-3.5 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-xs text-white font-semibold">
              Dual-Lens Capture
            </div>

            <button
              type="button"
              onClick={toggleLens}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="Switch Active Viewfinder Lens"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Bar Controls */}
          <div className="w-full space-y-4 pointer-events-auto bg-gradient-to-t from-black/85 via-black/50 to-transparent pb-6 pt-10 px-1 -mx-5 px-5 select-none text-center">
            
            {/* Error notifications */}
            {errorText && (
              <p className="text-[13px] text-[#FF375F] font-semibold text-center pb-2">
                ⚠️ {errorText}
              </p>
            )}

            {/* Injected Context location badge */}
            <div className="inline-block px-3 py-1 bg-[#2C2C2E]/60 rounded-full text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2">
              📍 {currentLocationName || 'Mission Node'}
            </div>

            {/* Caption Form Element */}
            {!onCapture && (
              <input
                type="text"
                placeholder="Add a vibe caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
                className="w-full bg-white/12 border-[1.5px] border-white/20 rounded-[12px] px-3.5 py-2.5 text-[14px] text-white outline-none focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6]/30 transition-all placeholder-[#8E8E93]"
              />
            )}

            {/* Large MD3 Shutter Button with Center Gap Ring */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isUploading || showCheckmark}
                className="relative flex items-center justify-center focus:outline-none transition-all duration-200 cursor-pointer"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: '3px solid #FFFFFF',
                  padding: '4px',
                  opacity: isUploading ? 0.6 : 1,
                  transform: isUploading ? 'scale(0.75)' : 'scale(1)',
                }}
              >
                <div 
                  className={`rounded-full transition-all duration-200 ${isUploading ? 'bg-[#FF375F] scale-90 animate-ping' : 'bg-white'}`}
                  style={{
                    width: '68px',
                    height: '68px',
                  }}
                />
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono tracking-wide">
              ⚡ Captures back environment & front selfie reaction sequentially
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};
