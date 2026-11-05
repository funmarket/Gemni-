import React, { useState, useEffect } from 'react';
import { socialGraphDomain, SocialProfile } from '@/domains/d03_social_graph';
import { Radio, UserPlus, UserCheck, ShieldCheck } from 'lucide-react';

interface EchoFollowersTabProps {
  onGoDrift: () => void;
  onOpenProfile?: (profile: SocialProfile) => void;
}

export const EchoFollowersTab: React.FC<EchoFollowersTabProps> = ({
  onGoDrift,
  onOpenProfile,
}) => {
  const [echoFollowers, setEchoFollowers] = useState<
    (SocialProfile & { isFollowedBack: boolean })[]
  >(() => socialGraphDomain.getEchoFollowers());

  useEffect(() => {
    return socialGraphDomain.subscribe(() => {
      setEchoFollowers(socialGraphDomain.getEchoFollowers());
    });
  }, []);

  const handleFollowToggle = (id: string, isFollowedBack: boolean) => {
    if (isFollowedBack) {
      socialGraphDomain.unfollow(id);
    } else {
      socialGraphDomain.follow(id);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Information Banner */}
      <div className="bg-emerald-950/25 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-base shrink-0 border border-emerald-500/30">
            📣
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider truncate">
              Echo Followers (D03 Inbound Resonance)
            </h4>
            <p className="text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-none leading-relaxed mt-0.5">
              Users tuned into your signal. You can follow them back into your Orbit at any time.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/15 px-3.5 py-1.5 rounded-full border border-emerald-500/30 whitespace-nowrap shadow-sm shrink-0">
            <span className="font-extrabold text-emerald-200">{echoFollowers.length}</span>
            <span>Tuning In</span>
          </span>
        </div>
      </div>

      {echoFollowers.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-4 flex flex-col items-center justify-center bg-[#111114] border border-white/5 rounded-3xl">
          <span className="text-[48px] block text-zinc-500">📣</span>
          <h3 className="font-bold text-[17px] text-white">
            No Echoes Yet
          </h3>
          <p className="text-[13px] text-[#8E8E93] max-w-[260px] leading-relaxed mx-auto font-normal">
            Post stories in Gossip, create custom Trails, or host an Activity to get more listeners tuning into your aura.
          </p>
          <button
            type="button"
            onClick={onGoDrift}
            className="bg-emerald-500 hover:bg-emerald-600 text-black text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Broadcast a Vibe
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {echoFollowers.map((profile) => (
            <div
              key={profile.id}
              className="bg-[#141218] border border-white/10 rounded-2xl p-4 flex items-start gap-3.5 hover:border-emerald-500/30 transition-all overflow-hidden text-left relative"
            >
              {/* Left: Avatar container */}
              <div 
                className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:border-amber-400/50 transition-colors shadow-sm"
                onClick={() => onOpenProfile?.(profile)}
              >
                {profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('/') || profile.avatar.startsWith('data:')) ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{profile.avatar || '🦁'}</span>
                )}
              </div>

              {/* Middle: Name on single line, handle underneath, bio underneath */}
              <div 
                className="flex-1 min-w-0 pr-1 cursor-pointer"
                onClick={() => onOpenProfile?.(profile)}
              >
                {/* Name on a single line */}
                <h4 className="font-extrabold text-[15px] text-white truncate leading-tight">
                  {profile.displayName}
                </h4>

                {/* Handle sits directly underneath the name */}
                <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                  @{profile.handle.replace(/^@/, '')}
                </p>

                {/* Bio sits underneath the handle and wraps cleanly */}
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed line-clamp-2 font-normal break-words">
                  {profile.bio}
                </p>
              </div>

              {/* Right: Badge on top right, button directly underneath with clear space */}
              <div className="shrink-0 flex flex-col items-end justify-between self-stretch gap-2.5">
                {/* Pro Guardian / Legend badge stays on the top right */}
                {profile.badge ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>{profile.badge}</span>
                  </span>
                ) : (
                  <div className="h-5" />
                )}

                {/* Follow Back action button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(profile.id, profile.isFollowedBack);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-sm ${
                    profile.isFollowedBack
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                      : 'text-black bg-emerald-400 hover:bg-emerald-300 font-bold'
                  }`}
                >
                  {profile.isFollowedBack ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow Back</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
