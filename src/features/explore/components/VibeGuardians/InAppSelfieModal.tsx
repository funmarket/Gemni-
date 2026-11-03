import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Shield } from 'lucide-react';
import { VibeGuardian, GuardianType, GuardianTrailItem } from './types';
import { updateOrRegisterGuardian } from './services/vibeGuardianStorage';
import { guardiansDomain } from '@/domains/d07_guardians';
import { SelfieCameraStep } from './selfie-modal/SelfieCameraStep';
import { GuardianProfileFormStep } from './selfie-modal/GuardianProfileFormStep';

interface InAppSelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile?: any;
  onGuardianSaved: (guardian: VibeGuardian) => void;
}

export const InAppSelfieModal: React.FC<InAppSelfieModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile,
  onGuardianSaved,
}) => {
  const [step, setStep] = useState<'camera' | 'details'>('camera');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Form state
  const [guardianType, setGuardianType] = useState<GuardianType>('local');
  const [name, setName] = useState(currentUserProfile?.displayName || '');
  const [city, setCity] = useState(currentUserProfile?.city || 'Tunis');
  const [pricingType, setPricingType] = useState<'hourly' | 'flat'>('hourly');
  const [hourlyRate, setHourlyRate] = useState<number>(30);
  const [flatRate, setFlatRate] = useState<number>(75);
  const [bio, setBio] = useState('');
  const [trails, setTrails] = useState<GuardianTrailItem[]>([]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && step === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleSnapSelfie = () => {
    setCountdown(3);
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          window.clearInterval(interval);
          performCapture();
          return null;
        }
        return prev - 1;
      });
    }, 500);
  };

  const performCapture = () => {
    if (videoRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhotoUrl(dataUrl);
        stopCamera();
        setStep('details');
        return;
      }
    }

    const fallback =
      currentUserProfile?.photoUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    setCapturedPhotoUrl(fallback);
    stopCamera();
    setStep('details');
  };

  const handleSaveGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedPhotoUrl) return;

    const priceDisplay =
      guardianType === 'pro'
        ? pricingType === 'hourly'
          ? `$${hourlyRate}/hour`
          : `$${flatRate} flat tour`
        : undefined;

    const newGuardian: VibeGuardian = {
      id: currentUserProfile?.id ? `guardian-${currentUserProfile.id}` : `guardian-self-${Date.now()}`,
      name: name || currentUserProfile?.displayName || 'My Guardian Node',
      handle: currentUserProfile?.handle ? `@${currentUserProfile.handle}` : '@local_vibe_node',
      type: guardianType,
      city: city || 'Tunis',
      stateCountry: 'Tunisia',
      age: 28,
      hideAge: false,
      selfieUrl: capturedPhotoUrl,
      selfieCapturedAt: new Date().toISOString(),
      hasActiveProSubscription: guardianType === 'pro',
      hiresCount: 1,
      pricingType: guardianType === 'pro' ? pricingType : undefined,
      hourlyRate: guardianType === 'pro' && pricingType === 'hourly' ? hourlyRate : undefined,
      flatRate: guardianType === 'pro' && pricingType === 'flat' ? flatRate : undefined,
      priceDisplay,
      showInHireSuggestions: guardianType === 'pro',
      experience: 'Certified local host',
      hobbies: ['Urban Exploration', 'Photography'],
      trails,
      favoriteTrails: trails.map((t) => t.title),
      bio: bio || 'Happy to show you around!',
      earnedBadges: [{ badge: 'Good Vibe', count: 1 }],
      reviews: [],
      handshakes: [],
      isCurrentUser: true,
    };

    updateOrRegisterGuardian(newGuardian);
    guardiansDomain.registerGuardian({
      guardianId: newGuardian.id,
      handle: newGuardian.handle.replace('@', ''),
      name: newGuardian.name,
      avatarUrl: newGuardian.selfieUrl,
      selfieUrl: newGuardian.selfieUrl,
      selfieCapturedAt: newGuardian.selfieCapturedAt,
      type: newGuardian.type,
      city: newGuardian.city,
      districts: ['Central'],
      languages: ['English', 'French'],
      bio: newGuardian.bio,
      pricing: {
        mode: guardianType === 'pro' ? pricingType : 'free',
        amountInLocalCurrency: guardianType === 'pro' ? (pricingType === 'hourly' ? hourlyRate : flatRate) : 0,
        currency: 'USD',
      },
      maxClients: 5,
      linkedTrailIds: [],
      badges: ['Verified Local'],
      sellerPolicy: {
        cancellationNoticeHours: 24,
        refundTerms: 'Full refund with 24h notice.',
        contactNote: 'Direct message in-app.',
      },
    });

    onGuardianSaved(newGuardian);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#110F15] border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-left shadow-2xl relative flex flex-col"
        >
          <div className="bg-[#17141E] border-b border-white/10 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-white">
                {step === 'camera' ? 'Front-Camera Selfie' : 'Guardian Profile Details'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === 'camera' ? (
            <SelfieCameraStep
              videoRef={videoRef}
              cameraActive={cameraActive}
              cameraError={cameraError}
              countdown={countdown}
              onSnapSelfie={handleSnapSelfie}
              onRetryCamera={startCamera}
            />
          ) : (
            <GuardianProfileFormStep
              capturedPhotoUrl={capturedPhotoUrl!}
              guardianType={guardianType}
              setGuardianType={setGuardianType}
              name={name}
              setName={setName}
              city={city}
              setCity={setCity}
              pricingType={pricingType}
              setPricingType={setPricingType}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              flatRate={flatRate}
              setFlatRate={setFlatRate}
              bio={bio}
              setBio={setBio}
              trails={trails}
              onRemoveTrail={(idx) => setTrails((prev) => prev.filter((_, i) => i !== idx))}
              onRetakePhoto={() => setStep('camera')}
              onSubmit={handleSaveGuardian}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default InAppSelfieModal;
