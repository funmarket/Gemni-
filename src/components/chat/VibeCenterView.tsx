import React, { useState, useEffect } from 'react';
import { Camera, MessageCircle, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth';
import { matchingDomain, VibePullRequest, MutualVibeMatch } from '@/domains/d17_matching';
import { socialGraphDomain } from '@/domains/d03_social_graph';
import { VibeHubTabs, VibeTabType } from '../explore/VibeHubTabs';
import { VibeComposer } from './VibeComposer';
import { VibeChatThread } from './VibeChatThread';
import { DriftView } from './DriftView';
import { GossipFeedTab } from '@/features/chat/components/vibe-hub/GossipFeedTab';
import { OrbitFollowingTab } from '@/features/chat/components/vibe-hub/OrbitFollowingTab';
import { EchoFollowersTab } from '@/features/chat/components/vibe-hub/EchoFollowersTab';
import { PullsInboxTab } from '@/features/chat/components/vibe-hub/PullsInboxTab';
import { MutualVibesTab } from '@/features/chat/components/vibe-hub/MutualVibesTab';

export const VibeCenterView: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'current_user';
  const currentUsername = user?.displayName || 'traveler';
  const currentUserAvatar = '🦁';

  const [activeTab, setActiveTab] = useState<VibeTabType>('Gossip');
  const [showComposer, setShowComposer] = useState<boolean>(false);
  const [tabFade, setTabFade] = useState<boolean>(false);

  // Active 1:1 Chat state
  const [activeChat, setActiveChat] = useState<{
    matchId: string;
    username: string;
    avatar: string;
    vibeScore: number;
  } | null>(null);

  // Domain D17 & D03 states
  const [pulls, setPulls] = useState<VibePullRequest[]>(() => matchingDomain.getPendingPulls());
  const [mutualVibes, setMutualVibes] = useState<MutualVibeMatch[]>(() =>
    matchingDomain.getMutualVibes()
  );
  const [graphCounts, setGraphCounts] = useState(() => socialGraphDomain.getCounts());

  useEffect(() => {
    const unsubMatching = matchingDomain.subscribe(() => {
      setPulls(matchingDomain.getPendingPulls());
      setMutualVibes(matchingDomain.getMutualVibes());
    });
    const unsubSocial = socialGraphDomain.subscribe(() => {
      setGraphCounts(socialGraphDomain.getCounts());
    });

    return () => {
      unsubMatching();
      unsubSocial();
    };
  }, []);

  const handleTabChange = (target: VibeTabType) => {
    if (target === activeTab) return;
    setTabFade(true);
    setTimeout(() => {
      setActiveTab(target);
      setTabFade(false);
    }, 100);
  };

  const handleOpenDirectChat = (userId: string, username: string, avatar: string, score: number = 85) => {
    setActiveChat({
      matchId: userId,
      username,
      avatar,
      vibeScore: score,
    });
  };

  const handleAcceptPull = (pullId: string) => {
    const matched = matchingDomain.acceptPull(pullId);
    if (matched) {
      setActiveChat({
        matchId: matched.matchedUserId,
        username: matched.matchedName,
        avatar: matched.matchedAvatar,
        vibeScore: matched.compatibilityScore,
      });
    }
  };

  const handlePassPull = (pullId: string) => {
    matchingDomain.passPull(pullId);
  };

  return (
    <div className="flex-grow bg-[#0C0B0E] text-white flex flex-col font-sans select-none relative h-full overflow-hidden">
      {/* 1:1 Chat Thread View Overlay */}
      {activeChat ? (
        <VibeChatThread
          matchId={activeChat.matchId}
          username={activeChat.username}
          avatar={activeChat.avatar}
          vibeScore={activeChat.vibeScore}
          onBack={() => setActiveChat(null)}
        />
      ) : (
        <div className="flex flex-col h-full overflow-hidden justify-between">
          <div className="flex-grow overflow-y-auto no-scrollbar flex flex-col pb-6">
            {/* Vibe Share Primary Action CTA */}
            <div className="flex justify-center px-4 sm:px-5 pt-4 sm:pt-6 pb-2 shrink-0">
              <button
                onClick={() => setShowComposer(true)}
                className="relative flex items-center justify-between w-full max-w-[380px] h-[64px] sm:h-[72px] bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0B] rounded-full border-[2.2px] border-[#D4AF37] p-1 shadow-[0_4px_25px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                id="share-vibe-cta"
              >
                <div className="absolute left-[-2px] w-[58px] h-[58px] sm:w-[66px] sm:h-[66px] rounded-full bg-white border-[3px] border-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
                  <Camera className="w-[26px] h-[26px] sm:w-[32px] sm:h-[32px] text-black stroke-[2.25]" />
                </div>
                <div className="w-full text-center">
                  <span
                    className="text-[20px] sm:text-[25px] font-bold text-white tracking-wide font-sans select-none"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    Vibe Share
                  </span>
                </div>
                <div className="absolute right-[-2px] w-[58px] h-[58px] sm:w-[66px] sm:h-[66px] rounded-full bg-white border-[3px] border-[#D4AF37] shadow-[0_2px_12px_rgba(0,0,0,0.4)] flex items-center justify-center transition-transform group-hover:scale-105">
                  <MessageCircle className="w-[26px] h-[26px] sm:w-[32px] sm:h-[32px] text-black stroke-[2.25]" />
                </div>
              </button>
            </div>

            {/* Artistic Inspiration Quote */}
            <div className="mx-3 sm:mx-5 my-2 relative bg-[#1A181C] border border-white/5 rounded-[16px] py-4 sm:py-5 px-4 sm:px-5 text-center select-none shadow-none">
              <div className="relative z-10 flex flex-col items-center justify-center">
                <p className="font-romantic text-[15px] sm:text-[19px] text-[#FBEBA7] leading-relaxed tracking-wide text-center font-medium px-2">
                  “Out beyond ideas of wrongdoing and rightdoing,
                  <br />
                  there is a field. I’ll meet you there.”
                </p>
                <span className="text-[9px] uppercase tracking-[0.16em] text-zinc-500 mt-2 font-bold font-lato">
                  — Rumi
                </span>
              </div>
            </div>

            {/* Sticky Navigation Tabs */}
            <div className="sticky top-0 z-30 bg-[#0C0B0E]/95 backdrop-blur-md pt-1 pb-1 border-b border-white/5">
              <VibeHubTabs
                activeTab={activeTab}
                onChangeTab={handleTabChange}
                pullsCount={pulls.length}
                vibesCount={mutualVibes.length}
                echoCount={graphCounts.echoCount}
                orbitCount={graphCounts.orbitCount}
              />
            </div>

            {/* Active Tab View */}
            <div
              className="flex-1 mt-3 transition-opacity duration-150"
              style={{ opacity: tabFade ? 0 : 1 }}
            >
              {activeTab === 'Gossip' && (
                <GossipFeedTab
                  currentUserId={currentUserId}
                  currentUsername={currentUsername}
                  currentUserAvatar={currentUserAvatar}
                  onOpenChat={(id, name, av) => handleOpenDirectChat(id, name, av)}
                />
              )}

              {activeTab === 'Drift' && (
                <DriftView
                  currentUserProfile={{
                    id: currentUserId,
                    username: currentUsername,
                    avatar: currentUserAvatar,
                    interests: ['Art', 'Coffee', 'Music'],
                    vibes: 'Curious explorer',
                  } as any}
                  allProfiles={socialGraphDomain.getAllProfiles().map((p) => ({
                    id: p.id,
                    username: p.handle,
                    avatar: p.avatar,
                    interests: ['Art', 'Culture'],
                    vibes: p.bio,
                  } as any))}
                  onSelectUser={(peer) => handleOpenDirectChat(peer.id, peer.username, peer.avatar)}
                  isFollowingUser={(id) => socialGraphDomain.isFollowing(id)}
                  onFollowToggle={(id) => {
                    if (socialGraphDomain.isFollowing(id)) {
                      socialGraphDomain.unfollow(id);
                    } else {
                      socialGraphDomain.follow(id);
                    }
                  }}
                  onSendChallenge={(chId, prompt) => {
                    matchingDomain.sendPullRequest(
                      chId,
                      'usr_peer',
                      'Explorer',
                      '⚡',
                      'FRIENDSHIP',
                      prompt || 'Wants to synthesize vibe frequencies.'
                    );
                  }}
                />
              )}

              {activeTab === 'Vibes' && (
                <div className="px-3 sm:px-5">
                  <MutualVibesTab
                    vibes={mutualVibes}
                    onOpenChat={(vibe) =>
                      handleOpenDirectChat(
                        vibe.matchedUserId,
                        vibe.matchedName,
                        vibe.matchedAvatar,
                        vibe.compatibilityScore
                      )
                    }
                  />
                </div>
              )}

              {activeTab === 'Orbit' && (
                <OrbitFollowingTab onGoDrift={() => handleTabChange('Drift')} />
              )}

              {activeTab === 'Echo' && (
                <EchoFollowersTab onGoDrift={() => handleTabChange('Drift')} />
              )}

              {activeTab === 'Pulls' && (
                <div className="px-3 sm:px-5">
                  <PullsInboxTab
                    pulls={pulls}
                    onAcceptPull={handleAcceptPull}
                    onPassPull={handlePassPull}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ephemeral Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <VibeComposer
            onClose={() => setShowComposer(false)}
            onSuccess={async () => {
              setShowComposer(false);
              setActiveTab('Gossip');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VibeCenterView;
