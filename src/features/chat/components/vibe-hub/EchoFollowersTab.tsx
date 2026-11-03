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
    <div className="space-y-4 px-3 sm:px-5 text-left">
      {/* Information Banner */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-base">
            📣
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-emerald-300 tracking-wider">
              Echo Followers (D03 Inbound Resonance)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Users tuned into your signal. You can follow them back into your Orbit at any time.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          {echoFollowers.length} Tuning In
        </span>
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
        <div className="space-y-2">
          {echoFollowers.map((profile) => (
            <div
              key={profile.id}
              className="bg-[#16141a] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onOpenProfile?.(profile)}
              >
                <span className="text-3xl p-2 bg-zinc-900 rounded-xl border border-white/5">
                  {profile.avatar}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{profile.displayName}</span>
                    <span className="text-xs text-zinc-500 font-mono">@{profile.handle}</span>
                    {profile.badge && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {profile.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{profile.bio}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleFollowToggle(profile.id, profile.isFollowedBack)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  profile.isFollowedBack
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                    : 'text-black bg-emerald-400 hover:bg-emerald-300 font-bold'
                }`}
              >
                {profile.isFollowedBack ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    Follow Back
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
