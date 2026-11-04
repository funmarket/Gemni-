import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MapPin, Smile, Image as ImageIcon, Send, Sparkles, Video } from 'lucide-react';
import { socialContentDomain } from '../../domains/d12_social_content';
import { useAuth } from '../../lib/auth';
import { VibePhotoCapture } from '../share/VibePhotoCapture';

interface VibeComposerProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_LOCATIONS = [
  'Mission District',
  'SoMa Node',
  'Castro Street',
  'Chinatown Hub',
  'Ferry Building',
  'Golden Gate Park'
];

const PRESET_EMOJIS = ['✨', '☕', '🍷', '🍕', '🔥', '⚡', '🎧', '🎮', '💡', '🪴', '🐾', '🌌'];

export const VibeComposer: React.FC<VibeComposerProps> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [isCustomLocActive, setIsCustomLocActive] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('✨');
  
  // Camera trigger states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Limits
  const MAX_CHARS = 280;
  const charsRemaining = MAX_CHARS - text.length;
  
  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji);
    if (text.length + emoji.length <= MAX_CHARS) {
      setText((prev) => prev + emoji);
    }
  };

  const handlePost = async () => {
    if (text.length > MAX_CHARS) return;
    if (text.trim().length === 0 && !photo) return;

    setIsSubmitting(true);
    setErrorText(null);

    const locationName = isCustomLocActive && customLocation.trim() 
      ? customLocation.trim() 
      : selectedLocation;

    try {
      await socialContentDomain.createPost({
        text: text.trim(),
        feeling: text.trim(),
        imageUri: photo || null,
        venueName: locationName,
        emoji: selectedEmoji,
        username: profile?.handle || 'traveler',
        avatar: profile?.photoUrl || profile?.handle || '🦊',
        userId: profile?.id || user?.uid || profile?.handle || 'current_user',
        isOnline: true,
      });
      
      // Post succeeded
      onSuccess();
    } catch (err: any) {
      console.error('Failed to post cyber vibe:', err);
      setErrorText('System synchronizer rejected the transmission. Try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex flex-col justify-end overflow-hidden font-sans">
      {/* Background Dimmer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide up screen container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg mx-auto bg-[#101012] rounded-t-[32px] border-t border-zinc-800/80 p-6 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar pointer-events-auto"
      >
        {/* Header decoration line */}
        <div className="w-12 h-1 bg-zinc-800/80 rounded-full mx-auto self-center mb-1 shrink-0" />

        {/* Top Actions Row */}
        <div className="flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800/50 text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h3 className="text-sm font-mono font-black text-zinc-350 tracking-wider uppercase flex items-center gap-1.5 justify-center">
              <Sparkles className="w-4 h-4 text-[#FF375F] animate-pulse" />
              EXPLORER COMPOSER
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mt-0.5">
              LOCAL FEED CHANNEL
            </span>
          </div>

          <button
            type="button"
            onClick={handlePost}
            disabled={isSubmitting || (text.trim().length === 0 && !photo)}
            className="flex items-center gap-1.5 bg-[#FF375F] disabled:bg-zinc-850 text-white disabled:text-zinc-600 px-4.5 py-2.5 rounded-2xl text-[13px] font-black tracking-wide cursor-pointer transition-all active:scale-95 border-none outline-none shadow-lg shadow-[#FF375F]/15 shrink-0"
          >
            <span>POST</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Post Composition Field */}
        <div className="bg-zinc-950/80 rounded-[24px] p-4.5 border border-zinc-900/80 flex flex-col space-y-3.5 shadow-inner">
          {/* Input text field */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's the vibe today? Share your thoughts..."
            maxLength={MAX_CHARS}
            className="w-full min-h-[140px] bg-transparent text-[15px] text-white outline-none border-none resize-none placeholder-zinc-500 leading-relaxed font-sans"
            style={{ caretColor: '#FF375F' }}
          />

          {/* Photo attachment preview if captured */}
          <AnimatePresence>
            {photo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-[16px] overflow-hidden border border-zinc-800/80 bg-zinc-900"
              >
                {photo.startsWith('data:video/') || photo.startsWith('blob:') ? (
                  <video
                    src={photo}
                    autoPlay
                    loop
                    className="w-full max-h-[180px] object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={photo}
                    alt="Captured live vibe"
                    className="w-full max-h-[180px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Discard indicator badge */}
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/90 cursor-pointer active:scale-90 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2.5 left-2.5 bg-[#30D158]/90 backdrop-blur-md text-[9px] font-bold text-black px-2 py-0.5 rounded-[5px] uppercase tracking-wider font-mono">
                  ✓ Cam captured
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer of edit box: Counter and Emoji Appender */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-900/60 shrink-0">
            {/* Left presets emoji tap buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%] no-scrollbar pr-2 py-1 select-none">
              {PRESET_EMOJIS.slice(0, 6).map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => handleEmojiClick(emo)}
                  className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none ${
                    selectedEmoji === emo 
                      ? 'bg-[#FF375F]/15 border border-[#FF375F]/25 text-white scale-105' 
                      : 'bg-zinc-900 border border-zinc-800/30 hover:bg-zinc-850'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>

            {/* Right details: string limits indicator */}
            <div className="text-[10.5px] font-mono font-bold flex items-center gap-1.5 select-none">
              <span className={charsRemaining <= 30 ? 'text-[#FF375F]' : 'text-zinc-550'}>
                {text.length}
              </span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-550">{MAX_CHARS}</span>
            </div>
          </div>
        </div>

        {/* Action Tray: Optional live camera trigger button */}
        <div className="flex flex-col gap-3 shrink-0">
          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest text-left">
            Media Attachments
          </label>
          
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setCameraMode('photo');
                setCameraActive(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white border border-zinc-800/60 p-3 rounded-[16px] text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]"
            >
              <Camera className="w-[15px] h-[15px] text-[#FF375F]" />
              <span>Take Photo</span>
              {photo && !photo.startsWith('data:video/') && !photo.startsWith('blob:') && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] ml-auto shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setCameraMode('video');
                setCameraActive(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white border border-zinc-800/60 p-3 rounded-[16px] text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]"
            >
              <Video className="w-[15px] h-[15px] text-emerald-400 animate-pulse" />
              <span>Record Video</span>
              {photo && (photo.startsWith('data:video/') || photo.startsWith('blob:')) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] ml-auto shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Location selector */}
        <div className="flex flex-col gap-3 shrink-0 text-left">
          <label className="text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#3478F6]" />
            Select Vibe Coordinates (Locality)
          </label>

          <div className="flex flex-wrap gap-2">
            {PRESET_LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setIsCustomLocActive(false);
                  setSelectedLocation(loc);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                  !isCustomLocActive && selectedLocation === loc
                    ? 'bg-[#3478F6]/15 text-[#3478F6] border border-[#3478F6]/35'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800/40 hover:text-white'
                }`}
              >
                {loc}
              </button>
            ))}

            {/* Custom Location Switcher */}
            <button
              type="button"
              onClick={() => setIsCustomLocActive(true)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer active:scale-95 ${
                isCustomLocActive
                  ? 'bg-[#BF5AF2]/15 text-[#BF5AF2] border border-[#BF5AF2]/35'
                  : 'bg-zinc-900 text-zinc-400 border border-[#8031A6]/10 hover:text-white'
              }`}
            >
              + Custom
            </button>
          </div>

          {/* Render custom location text form if chosen */}
          <AnimatePresence>
            {isCustomLocActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-1"
              >
                <input
                  type="text"
                  placeholder="Where are you vibing? (e.g., Yerba Buena)"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  maxLength={40}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#BF5AF2] placeholder-zinc-500 font-sans"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error notification display board */}
        {errorText && (
          <div className="bg-[#FF375F]/10 border border-[#FF375F]/20 text-[#FF375F] text-xs font-semibold p-3 rounded-xl text-center">
            ⚠️ {errorText}
          </div>
        )}
      </motion.div>

      {/* Floating full screen Live Camera overlay */}
      {cameraActive && (
        <VibePhotoCapture
          currentLocationName={isCustomLocActive && customLocation ? customLocation : selectedLocation}
          initialMode={cameraMode}
          onCapture={(filteredUri, rawUri, mediaType) => {
            setPhoto(filteredUri);
            setCameraActive(false);
          }}
          onClose={() => setCameraActive(false)}
        />
      )}
    </div>
  );
};
