import React from 'react';
import { Activity, MapPin, Coffee, Dumbbell, Compass, Users, Check, MessageSquare } from 'lucide-react';
import { SocialActivityMatch } from '@/types/socialGraph';
import { cn } from '@/lib/utils';

interface SocialActivityCardProps {
  match: SocialActivityMatch;
  onConnect: (matchId: string) => void;
  onDismiss: (matchId: string) => void;
  onChatWithMatch?: (profile: any) => void;
}

export const SocialActivityCard: React.FC<SocialActivityCardProps> = ({
  match,
  onConnect,
  onDismiss,
  onChatWithMatch,
}) => {
  const profile = match.matchedProfile;

  return (
    <div className="bg-[#111215] border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-5 space-y-3.5 text-left relative overflow-hidden transition-all shadow-lg group select-none">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-black uppercase tracking-wider font-mono">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Monthly Activity Match</span>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 font-bold flex items-center gap-1">
          <MapPin className="w-3 h-3 text-emerald-400" />
          {match.distanceKm} km away
        </span>
      </div>

      {/* Profile Row */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-2xl shrink-0 shadow-md">
            {profile.avatar || '🏃'}
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight">
              @{profile.username}
            </h4>
            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
              {profile.vibes || 'Active lifestyle explorer'}
            </p>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {match.activityScore}% Activity Synergy
            </span>
          </div>
        </div>
      </div>

      {/* Shared Sports & Places Badges */}
      <div className="space-y-2 relative z-10">
        {match.sharedSports.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-emerald-400" /> Sports:
            </span>
            {match.sharedSports.map((sport, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {match.sharedPlaces.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1">
              <Coffee className="w-3 h-3 text-amber-400" /> Places:
            </span>
            {match.sharedPlaces.map((place, i) => (
              <span
                key={i}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/15"
              >
                {place}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Practical Meetup Prompt */}
      <div className="bg-black/50 border border-white/5 rounded-2xl p-3 text-xs text-zinc-300 leading-relaxed font-sans relative z-10">
        <p>💡 {match.whyExplanation}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10">
        {match.status === 'connected' ? (
          <div className="w-full flex items-center justify-between">
            <span className="text-emerald-400 text-xs font-black uppercase font-mono flex items-center gap-1">
              <Check className="w-4 h-4" /> Connected
            </span>
            <button
              type="button"
              onClick={() => onChatWithMatch?.(profile)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer"
            >
              Coordinate Meetup
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onConnect(match.id)}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer mr-2"
            >
              <Users className="w-3.5 h-3.5" />
              Connect For Activity
            </button>

            <button
              type="button"
              onClick={() => onDismiss(match.id)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 text-xs font-bold cursor-pointer"
            >
              Skip
            </button>
          </>
        )}
      </div>
    </div>
  );
};
