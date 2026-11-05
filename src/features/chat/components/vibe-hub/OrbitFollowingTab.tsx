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
    <div className="space-y-4 text-left">
      {/* Information Banner */}
      <div className="bg-sky-950/25 border border-sky-500/20 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-base shrink-0 border border-sky-500/30">
            🔭
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase text-sky-300 tracking-wider truncate">
              Your Orbit (D03 Outbound Follows)
            </h4>
            <p className="text-[11px] text-zinc-400 line-clamp-1 sm:line-clamp-none leading-relaxed mt-0.5">
              Accounts you actively follow. Following is directed and distinct from confirmed Vibes.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-300 bg-sky-500/15 px-3.5 py-1.5 rounded-full border border-sky-500/30 whitespace-nowrap shadow-sm shrink-0">
            <span className="font-extrabold text-sky-200">{following.length}</span>
            <span>Orbiting</span>
          </span>
        </div>
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
        <div className="space-y-3">
          {following.map((profile) => (
            <div
              key={profile.id}
              className="bg-[#141218] border border-white/10 rounded-2xl p-4 flex items-start gap-3.5 hover:border-sky-500/30 transition-all overflow-hidden text-left relative"
            >
              {/* Left: Avatar container */}
              <div 
                className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer hover:border-sky-400/50 transition-colors shadow-sm"
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
                  <span className="text-3xl">{profile.avatar || '🔭'}</span>
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
                {/* Pro Guardian / Explorer badge stays on the top right */}
                {profile.badge ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-bold shrink-0 whitespace-nowrap">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>{profile.badge}</span>
                  </span>
                ) : (
                  <div className="h-5" />
                )}

                {/* Unfollow button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfollow(profile.id);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Unfollow</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
