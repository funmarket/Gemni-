import React from 'react';
import { VibeCheck } from './vibeCheckService';

interface VibeCheckHistoryCardProps {
  check: VibeCheck;
  currentUserId: string;
  otherUsername: string;
  otherAvatarUri: string;
  onPress: (check: VibeCheck) => void;
}

export const VibeCheckHistoryCard: React.FC<VibeCheckHistoryCardProps> = ({
  check,
  currentUserId,
  otherUsername,
  otherAvatarUri,
  onPress
}) => {
  const iChallenger = check.challenger_id === currentUserId;

  // Convert raw timestamp to highly scannable human description (e.g. "12m ago")
  const getElapsedString = (past: number): string => {
    const diffSecs = Math.floor((Date.now() - past) / 1000);
    if (diffSecs < 60) return "Just now";

    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Status mapping: Returns structured label, text color, and background opacity color
  const getStatusMapping = () => {
    const s = check.status;
    if (s === 'pending') {
      if (iChallenger) {
        return {
          label: `⏳ Waiting on @${otherUsername}...`,
          textClass: 'text-[#FFD60A]',
          bgClass: 'bg-[#FFD60A]/10'
        };
      } else {
        return {
          label: `👀 @${otherUsername} is checking you`,
          textClass: 'text-[#C650E8]',
          bgClass: 'bg-[#C650E8]/10'
        };
      }
    }

    if (s === 'responded') {
      if (iChallenger) {
        return {
          label: `📸 @${otherUsername} proved it — react!`,
          textClass: 'text-[#3DDC6C]',
          bgClass: 'bg-[#3DDC6C]/10'
        };
      } else {
        return {
          label: `✅ You proved your vibe`,
          textClass: 'text-[#3DDC6C]',
          bgClass: 'bg-[#3DDC6C]/10'
        };
      }
    }

    if (s === 'confirmed') {
      const emoji = check.challenger_reaction === 'fire' ? '🔥' : check.challenger_reaction === 'cap' ? '🧢' : '✨';
      return {
        label: `${emoji} Vibe Confirmed`,
        textClass: 'text-[#3478F6]',
        bgClass: 'bg-[#3478F6]/10'
      };
    }

    // ghosted / fallback
    if (iChallenger) {
      return {
        label: `👻 @${otherUsername} ghosted you`,
        textClass: 'text-[#636366]',
        bgClass: 'bg-[#636366]/10'
      };
    } else {
      return {
        label: `👻 You ghosted this one`,
        textClass: 'text-[#636366]',
        bgClass: 'bg-[#636366]/10'
      };
    }
  };

  const { label, textClass, bgClass } = getStatusMapping();
  const rawTime = check.created_at || Date.now();
  const timeStr = getElapsedString(rawTime);

  const canInteract = check.status === 'responded' && iChallenger;

  return (
    <div
      onClick={() => onPress(check)}
      className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-[#252528] active:scale-[0.99] transition-all cursor-pointer select-none text-left"
    >
      {/* Top row: avatar + status label (left) + time ago (right) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 max-w-[80%]">
          {/* Avatar sphere */}
          <span className="text-xl w-8 h-8 rounded-full border border-white/5 bg-zinc-805 flex items-center justify-center overflow-hidden shrink-0">
            {otherAvatarUri || '🦊'}
          </span>
          {/* Tonal status badge */}
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full truncate leading-none ${textClass} ${bgClass}`}>
            {label}
          </span>
        </div>
        
        {/* Timestamp */}
        <span className="text-[10px] font-semibold text-[#636366] shrink-0 font-mono text-right">
          {timeStr}
        </span>
      </div>

      {/* Middle row: prompt text in quotes */}
      <p className="text-xs italic font-medium text-[#EBEBF5]">
        &ldquo;{check.prompt}&rdquo;
      </p>

      {/* Bottom row (only if status === 'responded' AND iChallenger): Call To Action */}
      {canInteract && (
        <div className="flex items-center justify-end border-t border-white/5 pt-2 mt-1">
          <span className="text-[10px] font-bold text-[#3DDC6C] animate-pulse flex items-center gap-1 uppercase tracking-wider">
            Tap to react 👆
          </span>
        </div>
      )}
    </div>
  );
};
