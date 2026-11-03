import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, MapPin, Smile, Send, X, Sparkles, Check } from 'lucide-react';
import { socialFeedService, SocialPost } from '@/services/socialFeedService';

interface GossipInlineComposerProps {
  currentUsername?: string;
  currentUserAvatar?: string;
  currentUserId?: string;
  onPostCreated?: (post: SocialPost) => void;
}

const PRESET_LOCATIONS = [
  'Mission Dolores Node',
  'SoMa Creative Hub',
  'Golden Gate Park',
  'Haight-Ashbury Records',
  'Castro Street',
  'Ferry Building'
];

const PRESET_EMOJIS = ['✨', '☕', '🍷', '🍕', '🔥', '⚡', '🎧', '📸', '🌿', '🌌'];

export const GossipInlineComposer: React.FC<GossipInlineComposerProps> = ({
  currentUsername = 'traveler',
  currentUserAvatar = '✨',
  currentUserId = 'me',
  onPostCreated,
}) => {
  const [text, setText] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>(PRESET_LOCATIONS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('✨');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justPosted, setJustPosted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !photo) return;

    setIsSubmitting(true);
    try {
      const newPost = await socialFeedService.createPost({
        text: text.trim(),
        feeling: text.trim(),
        imageUri: photo,
        venueName: selectedLocation,
        emoji: selectedEmoji,
        username: currentUsername,
        avatar: currentUserAvatar,
        userId: currentUserId,
      });

      setText('');
      setPhoto(null);
      setShowLocationPicker(false);
      setShowEmojiPicker(false);
      setJustPosted(true);
      setTimeout(() => setJustPosted(false), 2500);

      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error('Failed to post vibe:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#18161D] border border-white/10 rounded-[24px] p-4 mx-3 sm:mx-5 mb-5 shadow-xl text-left">
      
      {/* Upper row: Avatar + input text area */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-lg shrink-0 mt-0.5 shadow-sm">
          {currentUserAvatar}
        </div>

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`What's your vibe today, @${currentUsername.replace(/^@/, '')}? Post to Gossip & My Network...`}
            rows={2}
            className="w-full bg-zinc-950/60 border border-white/5 rounded-2xl p-3 text-[13.5px] text-white placeholder-zinc-500 outline-none focus:border-amber-400 transition-all resize-none font-sans leading-relaxed"
          />

          {/* Photo Preview if attached */}
          {photo && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10 max-h-48 bg-black/40">
              <img src={photo} alt="Preview" className="w-full h-full object-cover max-h-48" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input for Image/Camera upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Expandable Location Picker */}
      {showLocationPicker && (
        <div className="mt-3 p-2.5 bg-zinc-900/80 rounded-xl border border-white/5 flex flex-wrap gap-1.5">
          {PRESET_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                setSelectedLocation(loc);
                setShowLocationPicker(false);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-zinc-800 text-zinc-400 border-white/5 hover:text-white'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}

      {/* Expandable Emoji Picker */}
      {showEmojiPicker && (
        <div className="mt-3 p-2 bg-zinc-900/80 rounded-xl border border-white/5 flex flex-wrap gap-2">
          {PRESET_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => {
                setSelectedEmoji(em);
                setShowEmojiPicker(false);
              }}
              className={`text-lg p-1.5 rounded-lg border cursor-pointer hover:scale-110 transition-transform ${
                selectedEmoji === em ? 'bg-white/10 border-amber-400' : 'border-transparent'
              }`}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Add Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-white/5 text-emerald-400 hover:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">Photo</span>
          </button>

          {/* Location button */}
          <button
            type="button"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-white/5 text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[90px] sm:max-w-[130px] font-mono text-[11px]">{selectedLocation.split(' ')[0]}</span>
          </button>

          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-white/5 text-purple-400 hover:text-purple-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            <span>{selectedEmoji}</span>
            <span className="hidden sm:inline text-[11px] font-mono">Vibe</span>
          </button>
        </div>

        {/* Post Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (!text.trim() && !photo)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            justPosted
              ? 'bg-emerald-500 text-black'
              : 'bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-black disabled:text-zinc-600 shadow-md shadow-amber-500/10'
          }`}
        >
          {justPosted ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Posted!</span>
            </>
          ) : (
            <>
              <span>Post</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
