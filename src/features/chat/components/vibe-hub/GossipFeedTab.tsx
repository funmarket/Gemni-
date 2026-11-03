import React, { useState, useEffect } from 'react';
import { socialContentDomain, GossipPost } from '@/domains/d12_social_content';
import { GossipInlineComposer } from '@/features/chat/components/GossipInlineComposer';
import { FacebookVibePostCard } from '@/features/chat/components/FacebookVibePostCard';
import { Radio } from 'lucide-react';

interface GossipFeedTabProps {
  currentUserId: string;
  currentUsername: string;
  currentUserAvatar: string;
  onOpenChat: (userId: string, username: string, avatar: string) => void;
}

export const GossipFeedTab: React.FC<GossipFeedTabProps> = ({
  currentUserId,
  currentUsername,
  currentUserAvatar,
  onOpenChat,
}) => {
  const [posts, setPosts] = useState<GossipPost[]>(() => socialContentDomain.getPosts());

  useEffect(() => {
    return socialContentDomain.subscribe(() => {
      setPosts(socialContentDomain.getPosts());
    });
  }, []);

  const handlePostCreated = (newPostData: any) => {
    socialContentDomain.addPost({
      authorId: currentUserId,
      authorHandle: currentUsername.replace('@', ''),
      authorName: currentUsername,
      authorAvatar: currentUserAvatar,
      content: newPostData.content || newPostData.caption || '',
      photoUrl: newPostData.imageUri || newPostData.photoUrl,
      locationName: newPostData.location || 'Tunis',
      cityName: 'Tunis',
      tag: 'story',
    });
  };

  return (
    <div className="space-y-4">
      {/* Direct Gossip & Photo Composer */}
      <GossipInlineComposer
        currentUsername={currentUsername}
        currentUserAvatar={currentUserAvatar}
        currentUserId={currentUserId}
        onPostCreated={handlePostCreated}
      />

      {/* Feed Status Header */}
      <div className="px-5 text-[11px] font-bold text-[#8E8894] uppercase tracking-[0.08em] flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          Vibe Signals & Gossip Feed (D12)
        </span>
        <span className="text-[10px] font-mono text-amber-400 font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Network
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="py-14 px-6 text-center space-y-4 flex flex-col items-center justify-center bg-[#131116] border border-white/5 rounded-2xl mx-3 sm:mx-5">
          <span className="text-[44px] block mt-1">✨</span>
          <h3 className="font-bold text-[16px] text-white">
            No connected vibe signals yet
          </h3>
          <p className="text-[13px] text-[#8E8E93] max-w-[260px] leading-relaxed mx-auto font-normal">
            Write a message or drop a hint above to share your first vibe with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <FacebookVibePostCard
              key={post.id}
              post={{
                id: post.id,
                userId: post.authorId,
                username: post.authorName,
                avatar: post.authorAvatar,
                content: post.content,
                imageUri: post.photoUrl,
                location: post.locationName,
                timestamp: new Date(post.createdAt).getTime(),
                likes: post.upvotesCount,
                liked: post.isUpvoted,
                comments: [],
              }}
              currentUsername={currentUsername}
              currentUserAvatar={currentUserAvatar}
              onPressProfile={() => onOpenChat(post.authorId, post.authorName, post.authorAvatar)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
