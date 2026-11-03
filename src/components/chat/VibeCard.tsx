import React from 'react';
import { ChevronRight, Calendar } from 'lucide-react';

interface VibeCardProps {
  id: string;
  username: string;
  feeling: string;
  location: string;
  emoji: string;
  avatar: string;
  vibeScore: number;
  unreadCount?: number;
  isOnline?: boolean;
  imageUri?: string;
  timestamp?: any;
  onPress: () => void;
}

export const VibeCard: React.FC<VibeCardProps> = ({
  username,
  feeling,
  location,
  emoji,
  avatar,
  vibeScore,
  unreadCount = 0,
  isOnline = false,
  imageUri,
  timestamp,
  onPress,
}) => {
  // Format the time if available
  const formattedTime = timestamp 
    ? new Date(typeof timestamp === 'string' || typeof timestamp === 'number' ? timestamp : timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div
      onClick={onPress}
      className="bg-[#1A181C] rounded-[20px] p-4 sm:p-5 mx-3 sm:mx-5 mb-3 flex flex-col gap-3 sm:gap-3.5 border border-white/5 hover:border-white/10 shadow-none cursor-pointer transition-all active:scale-[0.99] hover:bg-[#201E22] group"
      id={`vibe-card-${username}`}
    >
      {/* Upper Row: Profile and Location Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar Container with online indicator light */}
          <div className="relative w-10 h-10 shrink-0 bg-white/[0.03] rounded-full flex items-center justify-center text-lg border border-white/5">
            {avatar || '✨'}
            {isOnline && (
              <span 
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#30D158] border-2 border-[#1A1020] rounded-full ring-1 ring-[#30D158]/40"
                id={`online-dot-${username}`}
              />
            )}
          </div>

          <div className="text-left">
            <h4 className="font-bold text-[14px] text-white tracking-tight group-hover:text-[#3478F6] transition-colors">
              @{username}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#8E8894] font-medium font-mono">
                {formattedTime}
              </span>
              <span className="text-[9px] text-zinc-650">•</span>
              <span className="text-[11px] text-zinc-400 font-semibold truncate max-w-[145px] flex items-center gap-1">
                <span>{emoji} {location}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action: Score Badge */}
        <div className="flex items-center gap-2">
          <div className="bg-[#BF5AF2]/10 border border-[#BF5AF2]/20 rounded-lg px-2 py-1 text-[11px] font-bold text-[#BF5AF2] font-mono shrink-0">
            {vibeScore}% Match
          </div>
          <ChevronRight className="w-4 h-4 text-[#636366] group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Middle Row: Content (Message and optional Photo) */}
      <div className="space-y-3 pl-1 text-left">
        {feeling && (
          <p className="text-[14px] text-[#EBEBF5] font-normal leading-relaxed whitespace-pre-wrap select-text">
            {feeling}
          </p>
        )}

        {imageUri && (
          <div className="relative rounded-xl overflow-hidden border border-white/5 bg-black/20">
            <img 
              src={imageUri} 
              alt="Shared vibe context" 
              className="w-full max-h-64 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-[6px] text-[9px] font-black text-white tracking-widest uppercase font-mono">
              Live Capture
            </div>
          </div>
        )}
      </div>

      {/* Lowermost: Sub-match energy visual slidebar */}
      <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-gradient-to-r from-[#BF5AF2] to-[#FF375F] rounded-full transition-all duration-500"
          style={{ width: `${vibeScore}%` }}
        />
      </div>
      
    </div>
  );
};
