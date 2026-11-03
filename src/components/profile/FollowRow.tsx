import React from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import { UserProfile } from '../../types/socialGraph';

interface FollowRowProps {
  profile: UserProfile;
  isFollowing: boolean;
  onFollowToggle: () => void;
  isFirst?: boolean;
}

export const FollowRow: React.FC<FollowRowProps> = ({
  profile,
  isFollowing,
  onFollowToggle,
  isFirst = false,
}) => {
  return (
    <div className="w-full">
      {!isFirst && <div className="h-[1px] bg-zinc-900 mx-5" />}

      <div className="px-5 py-3.5 flex items-center justify-between gap-3 bg-transparent select-none">
        
        {/* Profile Info Left Area */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center text-lg shadow-inner">
            {profile.avatar || '👤'}
            {profile.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full" />
            )}
          </div>

          <div className="min-w-0 text-left">
            <span className="block font-semibold text-[15px] text-white truncate">
              @{profile.username}
            </span>
            <span className="block text-[12px] text-zinc-500 truncate max-w-[180px]">
              {profile.vibes || 'Active VibeQuest Explorer'}
            </span>
          </div>
        </div>

        {/* Quick Follow/Unfollow Action Button Right Side */}
        <button
          type="button"
          onClick={onFollowToggle}
          className={`px-3 py-1.5 rounded-[10px] text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95 border ${
            isFollowing 
              ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400' 
              : 'bg-fuchsia-600/15 border-fuchsia-500/25 text-fuchsia-400 hover:bg-fuchsia-600/25'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unfollow</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Follow</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default FollowRow;
