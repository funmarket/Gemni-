import React from 'react';

interface VibeRequestProps {
  id: string;
  username: string;
  previewText: string;
  timeAgo: string;
  avatar: string;
  isOnline?: boolean;
  onAccept: () => void;
  onIgnore: () => void;
}

export const VibeRequestCard: React.FC<VibeRequestProps> = ({
  username,
  previewText,
  timeAgo,
  avatar,
  isOnline = false,
  onAccept,
  onIgnore,
}) => {
  return (
    <div
      className="bg-[#1C1C1E] rounded-[14px] p-4 mx-5 mb-2.5 flex items-center gap-4 transition-all"
      id={`request-card-${username}`}
    >
      {/* Left Avatar + status */}
      <div className="relative w-11 h-11 shrink-0 bg-[#2C2C2E] rounded-full flex items-center justify-center text-xl">
        {avatar || '✨'}
        {isOnline && (
          <span 
            className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#30D158] border-2 border-[#1C1C1E] rounded-full"
            id={`request-online-dot-${username}`}
          />
        )}
      </div>

      {/* Center content */}
      <div className="flex-1 min-w-0 space-y-1 text-left">
        <h4 className="font-bold text-[15px] text-white truncate">
          @{username}
        </h4>
        <p className="text-[13px] text-[#8E8E93] truncate font-normal leading-normal">
          {previewText}
        </p>
        <span className="block text-[11px] text-[#636366] font-normal">
          {timeAgo}
        </span>
      </div>

      {/* Right Action buttons stacked vertically */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onAccept}
          className="bg-[rgba(48,209,88,0.12)] border-[1.5px] border-[rgba(48,209,88,0.25)] text-[#30D158] px-3.5 py-[8px] rounded-[10px] text-[12px] font-bold cursor-pointer transition-all active:scale-95 active:bg-[rgba(48,209,88,0.22)]"
        >
          Accept ✓
        </button>
        <button
          type="button"
          onClick={onIgnore}
          className="bg-transparent border-[1.5px] border-[#3A3A3C] text-[#EBEBF5] px-3.5 py-[8px] rounded-[10px] text-[12px] font-semibold cursor-pointer transition-all active:scale-95 active:border-[#636366] active:bg-white/5"
        >
          Ignore
        </button>
      </div>
    </div>
  );
};
