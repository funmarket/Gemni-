import React from 'react';

interface VibeMatchRowProps {
  id: string;
  username: string;
  matchedTimeAgo: string;
  avatar: string;
  isOnline?: boolean;
  onVibeCheck: () => void;
  isFirst?: boolean;
}

export const VibeMatchRow: React.FC<VibeMatchRowProps> = ({
  username,
  matchedTimeAgo,
  avatar,
  isOnline = false,
  onVibeCheck,
  isFirst = false,
}) => {
  return (
    <div className="w-full">
      {/* 1px dark separator between rows (unless it is the first row) */}
      {!isFirst && <div className="h-[1px] bg-[#1C1C1E] mx-5" />}

      {/* Row container */}
      <div 
        className="px-5 py-3.5 flex items-center justify-between gap-3 bg-transparent transition-all select-none"
        id={`match-row-${username}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Area */}
          <div className="relative w-10 h-10 shrink-0 bg-[#1C1C1E] rounded-full flex items-center justify-center text-lg">
            {avatar || '✨'}
            {isOnline && (
              <span 
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#30D158] border-2 border-[#000000] rounded-full"
                id={`match-online-dot-${username}`}
              />
            )}
          </div>

          {/* User info */}
          <div className="min-w-0 text-left">
            <span className="block font-semibold text-[15px] text-white truncate">
              @{username}
            </span>
            <span className="block text-[12px] text-[#8E8E93] font-normal">
              Matched {matchedTimeAgo}
            </span>
          </div>
        </div>

        {/* Right side Compact Tonal Purple Action button */}
        <button
          type="button"
          onClick={onVibeCheck}
          className="bg-[rgba(191,90,242,0.12)] border-[1.5px] border-[rgba(191,90,242,0.25)] text-[#BF5AF2] px-3 py-1.5 rounded-[10px] text-[12px] font-bold cursor-pointer transition-all active:scale-95 active:bg-[rgba(191,90,242,0.22)] shrink-0"
        >
          VibeCheck 🎯
        </button>
      </div>
    </div>
  );
};
