import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bookmark, MapPin, Sparkles, Shield, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { useAuth } from '@/lib/auth';
import { socialGraphDomain } from '@/domains/d03_social_graph';
import { matchingDomain } from '@/domains/d17_matching';

export interface PublicUserData {
  id: string;
  handle: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  city?: string;
  interests?: string[];
  accountType?: string;
  vibeScore?: number;
}

interface PublicProfileModalProps {
  userId?: string | null;
  handle?: string | null;
  initialProfile?: Partial<PublicUserData> | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (userId: string, username: string, avatar?: string) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  userId,
  handle,
  initialProfile,
  isOpen,
  onClose,
  onOpenChat,
}) => {
  const { user: currentAuthUser, profile: currentProfile } = useAuth();
  const [profileData, setProfileData] = useState<PublicUserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [pullSent, setPullSent] = useState<boolean>(false);
  const [hasMutualVibe, setHasMutualVibe] = useState<boolean>(false);

  // Load and hydrate profile from Supabase or fallback registry
  useEffect(() => {
    if (!isOpen) return;

    const targetHandle = (handle || initialProfile?.handle || '').replace(/^@/, '').trim();
    const targetId = (userId || initialProfile?.id || '').trim();

    if (!targetHandle && !targetId) return;

    let active = true;
    setIsLoading(true);

    async function loadData() {
      try {
        // 1. Try Supabase profiles
        let query = supabase.from('profiles').select('*');
        if (targetId && targetHandle) {
          query = query.or(`id.eq.${targetId},handle.ilike.${targetHandle}`);
        } else if (targetId) {
          query = query.or(`id.eq.${targetId},id.eq.usr_${targetId}`);
        } else {
          query = query.ilike('handle', targetHandle);
        }

        const { data: row } = await query.maybeSingle();

        if (active && row) {
          const loaded: PublicUserData = {
            id: row.id,
            handle: row.handle || targetHandle,
            displayName: row.display_name || row.handle || targetHandle,
            photoUrl: row.photo_url || (targetHandle === 'yassine_medina' ? '/assets/aistudio/image_29f0b009.png' : undefined),
            bio: row.bio || (targetHandle === 'yassine_medina' ? 'Exploring hidden corners of the Medina, local culture, music and coffee.' : 'Curating spontaneous urban adventures and local culture.'),
            city: row.city || 'Tunis',
            interests: Array.isArray(row.interests) && row.interests.length > 0 
              ? row.interests 
              : targetHandle === 'yassine_medina' 
                ? ['Culture', 'Photography', 'Coffee'] 
                : ['Local Gems', 'Espresso', 'Heritage'],
            accountType: row.account_type || 'vibe',
          };
          setProfileData(loaded);
          checkSocialStatus(loaded.id, loaded.handle);
          setIsLoading(false);
          return;
        }

        // 2. Fallback to seed profile in D03 or initial data
        const seedProfile = socialGraphDomain.getProfile(targetId) || socialGraphDomain.getProfile(`user_${targetHandle}`);
        if (active && seedProfile) {
          const loaded: PublicUserData = {
            id: seedProfile.id,
            handle: seedProfile.handle,
            displayName: seedProfile.displayName,
            photoUrl: targetHandle === 'yassine_medina' || seedProfile.handle === 'yassine_medina' 
              ? '/assets/aistudio/image_29f0b009.png' 
              : undefined,
            bio: seedProfile.bio || 'Exploring hidden corners of the Medina, local culture, music and coffee.',
            city: seedProfile.city || 'Tunis',
            interests: ['Culture', 'Photography', 'Coffee'],
            vibeScore: seedProfile.vibeScore || 95,
          };
          setProfileData(loaded);
          checkSocialStatus(loaded.id, loaded.handle);
          setIsLoading(false);
          return;
        }

        // 3. Fallback to initial provided data
        if (active && initialProfile) {
          const loaded: PublicUserData = {
            id: initialProfile.id || targetId || `usr_${targetHandle}`,
            handle: initialProfile.handle || targetHandle,
            displayName: initialProfile.displayName || targetHandle,
            photoUrl: initialProfile.photoUrl || (targetHandle === 'yassine_medina' ? '/assets/aistudio/image_29f0b009.png' : undefined),
            bio: initialProfile.bio || (targetHandle === 'yassine_medina' ? 'Exploring hidden corners of the Medina, local culture, music and coffee.' : 'Exploring local cultural trails.'),
            city: initialProfile.city || 'Tunis',
            interests: initialProfile.interests || ['Culture', 'Photography', 'Coffee'],
            accountType: initialProfile.accountType || 'vibe',
          };
          setProfileData(loaded);
          checkSocialStatus(loaded.id, loaded.handle);
        }
      } catch (err) {
        console.warn('Could not load public profile details:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    function checkSocialStatus(id: string, h: string) {
      const currentUid = currentProfile?.id || currentAuthUser?.uid || 'current_user';
      setIsFollowing(socialGraphDomain.isFollowing(id) || socialGraphDomain.isFollowing(h));
      setPullSent(matchingDomain.hasSentPull(id, currentUid) || matchingDomain.hasSentPull(h, currentUid));
      setHasMutualVibe(matchingDomain.hasMutualVibe(id, currentUid) || matchingDomain.hasMutualVibe(h, currentUid));
    }

    loadData();

    return () => {
      active = false;
    };
  }, [isOpen, userId, handle, initialProfile, currentProfile?.id, currentAuthUser?.uid]);

  if (!isOpen) return null;

  const currentUid = currentProfile?.id || currentAuthUser?.uid || 'current_user';
  const isSelf = profileData && (
    profileData.id === currentProfile?.id || 
    profileData.handle === currentProfile?.handle ||
    profileData.id === currentAuthUser?.uid
  );

  const handleToggleEcho = () => {
    if (!profileData) return;
    const key = profileData.handle || profileData.id;
    if (isFollowing) {
      socialGraphDomain.unfollow(key);
      setIsFollowing(false);
    } else {
      socialGraphDomain.follow(key);
      setIsFollowing(true);
    }
  };

  const handleTogglePull = () => {
    if (!profileData || pullSent) return;
    matchingDomain.sendPull({
      targetUserId: profileData.id,
      targetHandle: profileData.handle,
      targetName: profileData.displayName,
      senderId: currentUid,
      senderHandle: currentProfile?.handle || 'me',
      senderName: currentProfile?.displayName || 'Explorer',
      senderAvatar: currentProfile?.photoUrl || '✨',
      reasonText: `Sent connection Pull to @${profileData.handle}`,
    });
    setPullSent(true);
  };

  const displayPhoto = profileData?.photoUrl || (profileData?.handle === 'yassine_medina' ? '/assets/aistudio/image_29f0b009.png' : null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0 -z-10" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-[360px] sm:max-w-[380px] bg-[#0E0C15] border border-white/10 rounded-[28px] p-4 sm:p-5 shadow-2xl relative select-none font-sans text-left overflow-hidden space-y-4"
        >
          {/* Close button at top right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 1. Large Top Photo Card with Bookmark Button */}
          <div className="relative w-full aspect-[3/3.8] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-inner">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={profileData?.displayName || 'User Photo'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950/40 via-zinc-900 to-black text-zinc-600">
                <span className="text-6xl mb-2">👤</span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  @{profileData?.handle || 'explorer'}
                </span>
              </div>
            )}

            {/* Bookmark button in top right of photo */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              title="Save to favorites"
              className={cn(
                "absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer active:scale-90",
                isSaved 
                  ? "bg-amber-500/30 border-amber-500/60 text-amber-300" 
                  : "bg-black/40 hover:bg-black/60 border-white/15 text-white/90"
              )}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-amber-300 text-amber-300")} />
            </button>
          </div>

          {/* 2. User Info Details Section */}
          <div className="space-y-2.5 pt-1">
            {/* Name + City Pill */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-xl text-white tracking-tight truncate">
                {profileData?.displayName || 'Loading...'}
              </h3>
              {profileData?.city && (
                <span className="bg-[#1C1A24] text-zinc-300 border border-white/5 font-medium text-xs px-3 py-1 rounded-full shrink-0">
                  {profileData.city}
                </span>
              )}
            </div>

            {/* Canonical Handle */}
            <p className="text-xs text-zinc-400 font-mono">
              @{profileData?.handle || 'username'}
            </p>

            {/* Biography */}
            <p className="text-xs text-zinc-300 font-normal leading-relaxed line-clamp-3">
              {profileData?.bio || 'Local explorer on the VibeQuest network.'}
            </p>

            {/* Interest Pills */}
            {profileData?.interests && profileData.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profileData.interests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#181622] border border-white/5 text-zinc-300 text-[11px] font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. Bottom Divider */}
          <div className="border-t border-white/10 pt-3" />

          {/* 4. Bottom Action Bar: ECHO (Left) and PULL (Right) */}
          {!isSelf ? (
            <div className="flex items-center justify-between gap-3 pt-0.5">
              {/* ECHO (D03 Social Graph: One-way follow into Orbit) */}
              <button
                type="button"
                onClick={handleToggleEcho}
                className={cn(
                  "flex-1 font-mono text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95",
                  isFollowing
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                )}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>ECHOED</span>
                  </>
                ) : (
                  <span>ECHO</span>
                )}
              </button>

              {/* PULL (D17 Matching: Connection Invitation) */}
              <button
                type="button"
                onClick={handleTogglePull}
                disabled={pullSent}
                className={cn(
                  "flex-1 font-mono text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95",
                  pullSent
                    ? "bg-rose-500/20 text-rose-200 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] cursor-default"
                    : "border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                )}
              >
                {pullSent ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>PULLED</span>
                  </>
                ) : (
                  <span>PULL</span>
                )}
              </button>

              {/* Optional 1:1 Message icon if mutual Vibe exists */}
              {hasMutualVibe && onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(profileData?.id || '', profileData?.displayName || '', profileData?.photoUrl);
                  }}
                  title="Direct Message"
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-1">
              <span className="text-xs text-zinc-500 font-mono">
                Your Public Profile Preview
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PublicProfileModal;
