import { useState, useEffect, useRef } from 'react';
import { requestCameraStream, stopMediaStream } from '@/shared/services/device/geolocation'; // Wait, let's make sure we import from the right path!
// Let's import requestCameraStream and stopMediaStream from '@/shared/services/device/camera'
import { requestCameraStream as requestStream, stopMediaStream as stopStream } from '@/shared/services/device/camera';
import { getSharedAudioContext, resumeSharedAudioContext } from '@/shared/services/device/audio';
import { getDevicePosition } from '@/shared/services/device/geolocation';
import { detectCameras, captureSequentially } from '@/lib/dualCameraUtils';
import { triggerHaptic } from '@/shared/services/device/haptics';

export const useShareCamera = (showShareVibeModal: boolean, initialStep: 'viewfinder' | 'preview' | 'details' = 'viewfinder') => {
  const [step, setStep] = useState<'viewfinder' | 'preview' | 'details'>(initialStep);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [captureLat, setCaptureLat] = useState<number | null>(null);
  const [captureLng, setCaptureLng] = useState<number | null>(null);
  const [capturedLocation, setCapturedLocation] = useState('Dolores Park');
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'success' | 'failed'>('idle');
  const [cameraType, setCameraType] = useState<'real' | 'simulated'>('simulated');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Hardware devices
  const [frontDeviceId, setFrontDeviceId] = useState<string | null>(null);
  const [backDeviceId, setBackDeviceId] = useState<string | null>(null);

  // PiP element dragging position overlay
  const [frontPos, setFrontPos] = useState({ x: 16, y: 16 });
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 16, y: 16 });

  // Handle PiP overlay dragging coordinates
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
    const nextX = Math.max(8, Math.min(240, posStartRef.current.x + dx));
    const nextY = Math.max(8, Math.min(180, posStartRef.current.y + dy));
    setFrontPos({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingFront(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Sound generator
  const playShutterSound = () => {
    try {
      const audioCtx = getSharedAudioContext();
      resumeSharedAudioContext();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.45, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.12);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Synthesizer block rejected:", e);
    }
  };

  // Bind camera video feed
  useEffect(() => {
    if (showShareVibeModal && step === 'viewfinder') {
      let activeStream: MediaStream | null = null;
      const setupLens = async () => {
        try {
          const devs = await detectCameras();
          setFrontDeviceId(devs.frontDeviceId);
          setBackDeviceId(devs.backDeviceId);

          const constraints = {
            video: devs.backDeviceId 
              ? { deviceId: { exact: devs.backDeviceId } } 
              : { facingMode: 'environment' },
            audio: false
          };

          const stream = await requestStream(constraints);
          activeStream = stream;
          setMediaStream(stream);
          setCameraType('real');
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 60);
        } catch (err) {
          console.warn("Environmental camera error, targeting user lens fallback:", err);
          try {
            const fallbackStream = await requestStream({ video: { facingMode: 'user' } });
            activeStream = fallbackStream;
            setMediaStream(fallbackStream);
            setCameraType('real');
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = fallbackStream;
              }
            }, 60);
          } catch (innerErr) {
            console.warn("Unified camera rejected, running simulator layer:", innerErr);
            setCameraType('simulated');
          }
        }
      };

      setupLens();

      return () => {
        if (activeStream) {
          stopStream(activeStream);
        }
        setMediaStream(null);
      };
    }
  }, [showShareVibeModal, step]);

  const handleShutterCapture = async () => {
    const stamp = Date.now();
    setTimestamp(stamp);

    triggerHaptic('heavy');
    playShutterSound();
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 250);

    setGpsStatus('fetching');
    try {
      const pos = await getDevicePosition();
      setCaptureLat(pos.latitude);
      setCaptureLng(pos.longitude);
      setGpsStatus('success');

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.latitude}&lon=${pos.longitude}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const place = data.address.suburb || data.address.neighbourhood || data.address.quarter || data.address.city || data.address.state || "Dolores Park";
            setCapturedLocation(place);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn("Capture GPS lookup timeout/rejection:", err);
      setGpsStatus('failed');
      const manualRaw = localStorage.getItem('vibe_quest_manual_location');
      const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
      let defaultLat = null;
      let defaultLng = null;
      let defaultLoc = "Nearby Spot";
      if (manualRaw) {
        try {
          const parsed = JSON.parse(manualRaw);
          defaultLat = parsed.coords.lat;
          defaultLng = parsed.coords.lng;
          defaultLoc = parsed.cityName;
        } catch (e) {}
      } else if (lastKnownRaw) {
        try {
          const parsed = JSON.parse(lastKnownRaw);
          defaultLat = parsed.coords.lat;
          defaultLng = parsed.coords.lng;
          defaultLoc = parsed.cityName;
        } catch (e) {}
      }
      setCaptureLat(defaultLat);
      setCaptureLng(defaultLng);
      setCapturedLocation(defaultLoc);
    }

    let bPic: string | null = null;
    let fPic: string | null = null;

    if (cameraType === 'real' && videoRef.current && mediaStream) {
      try {
        const { backPhoto, frontPhoto } = await captureSequentially(mediaStream, videoRef.current, frontDeviceId);
        bPic = backPhoto;
        fPic = frontPhoto;
        setBackImage(backPhoto);
        setFrontImage(frontPhoto);
        setStep('preview');
      } catch (err) {
        console.error("Failed to capture live dual video snapshots:", err);
        setCameraType('simulated');
      }
    }

    if (cameraType === 'simulated' || !bPic) {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#111827');
        grad.addColorStop(0.5, '#4c0519');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);
        
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(320, 240, 160, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("VIBE LOCATION ACTIVE: " + (captureLat ? captureLat.toFixed(4) : "No GPS") + " / " + (captureLng ? captureLng.toFixed(4) : "No GPS"), 30, 400);
        
        bPic = canvas.toDataURL('image/jpeg');
        setBackImage(bPic);
      }
      fPic = "👩‍🎤";
      setFrontImage(fPic);
      setStep('preview');
    }
  };

  const handleResetCamera = () => {
    setBackImage(null);
    setFrontImage(null);
    setTimestamp(null);
    setStep('viewfinder');
  };

  return {
    step,
    setStep,
    timestamp,
    setTimestamp,
    backImage,
    setBackImage,
    frontImage,
    setFrontImage,
    isVideo,
    setIsVideo,
    captureLat,
    setCaptureLat,
    captureLng,
    setCaptureLng,
    capturedLocation,
    setCapturedLocation,
    isFlashActive,
    gpsStatus,
    setGpsStatus,
    cameraType,
    videoRef,
    frontPos,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleShutterCapture,
    handleResetCamera
  };
};
