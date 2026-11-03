import React, { useState, useEffect } from 'react';
import { socialGraphDomain, SocialProfile } from '@/domains/d03_social_graph';
import { Telescope, UserMinus, UserCheck, ShieldCheck } from 'lucide-react';

interface OrbitFollowingTabProps {
  onGoDrift: () => void;
  onOpenProfile?: (profile: SocialProfile) => void;
}

export const OrbitFollowingTab: React.FC<OrbitFollowingTabProps> = ({
  onGoDrift,
  onOpenProfile,
}) => {
  const [following, setFollowing] = useState<SocialProfile[]>(() =>
    socialGraphDomain.getOrbitFollowing()
  );

  useEffect(() => {
    return socialGraphDomain.subscribe(() => {
      setFollowing(socialGraphDomain.getOrbitFollowing());
    });
  }, []);

  const handleUnfollow = (id: string) => {
    socialGraphDomain.unfollow(id);
  };

  return (
    <div className="space-y-4 px-3 sm:px-5 text-left">
      {/* Information Banner */}
      <div className="bg-sky-950/20 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-base">
            🔭
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-sky-300 tracking-wider">
              Your Orbit (D03 Outbound Follows)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Accounts you actively follow. Following is directed and distinct from confirmed Vibes.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
          {following.length} Orbiting
        </span>
      </div>

      {following.length === 0 ? (
        <div className="py-16 px-6 text-center space-y-4 flex flex-col items-center justify-center bg-[#111114] border border-white/5 rounded-3xl">
          <span className="text-[48px] block text-zinc-500">🔭</span>
          <h3 className="font-bold text-[17px] text-white">
            You follow 0 people
          </h3>
          <p className="text-[13px] text-[#8E8E93] max-w-[260px] leading-relaxed mx-auto font-normal">
            Start drifting into frequencies to build your gravitational orbit around creators and local guardians.
          </p>
          <button
            type="button"
            onClick={onGoDrift}
            className="bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Explore & Drift
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {following.map((profile) => (
            <div
              key={profile.id}
              className="bg-[#16141a] border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-sky-500/30 transition-all"
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
                onClick={() => handleUnfollow(profile.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <UserMinus className="w-3.5 h-3.5" />
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
