import { useState } from 'react';

export const useHomeFeedActions = ({ triggerHaptic, showToast }: any) => {
  const [activeWallTab, setActiveWallTab] = useState<'network' | 'local' | 'foryou'>('network');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [postTipped, setPostTipped] = useState<Record<string, number>>({});

  const handleLikePost = (postId: string, currentVotes: number) => {
    triggerHaptic?.('light');
    const isLiked = !likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
    if (showToast) {
      showToast(isLiked ? "❤️ Added to your Liked Vibe Signals" : "Removed Liked Vibe Signal");
    }
  };

  const handleTipPost = (postId: string, amount: number) => {
    triggerHaptic?.('heavy');
    setPostTipped(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + amount
    }));
    if (showToast) {
      showToast(`💸 Dispatched a ${amount} VQ Tip onto signal ${postId}!`);
    }
  };

  return {
    activeWallTab,
    setActiveWallTab,
    likedPosts,
    setLikedPosts,
    postTipped,
    setPostTipped,
    handleLikePost,
    handleTipPost
  };
};
