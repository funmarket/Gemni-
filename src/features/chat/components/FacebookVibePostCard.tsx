import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Send, CornerDownRight, X, Sparkles, MapPin, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SocialPost, PostComment, socialFeedService } from '@/services/socialFeedService';
import { cn } from '@/lib/utils';

interface FacebookVibePostCardProps {
  post: SocialPost;
  currentUsername?: string;
  currentUserAvatar?: string;
  onPressProfile?: (userId: string, username: string) => void;
  onShare?: (post: SocialPost) => void;
}

export const FacebookVibePostCard: React.FC<FacebookVibePostCardProps> = ({
  post,
  currentUsername = 'traveler',
  currentUserAvatar = '✨',
  onPressProfile,
  onShare,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [showComments, setShowComments] = useState<boolean>(true);
  const [commentText, setCommentText] = useState<string>('');
  const [replyingToComment, setReplyingToComment] = useState<{ id: string; author: string } | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [votesCount, setVotesCount] = useState<number>(post.votes || 1);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Load comments and like status
  const refreshComments = () => {
    const list = socialFeedService.getComments(post.id);
    setComments(list);
  };

  useEffect(() => {
    refreshComments();
    const likes = socialFeedService.getLikedPosts();
    setIsLiked(!!likes[post.id]);
    setVotesCount(post.votes || 1);

    const handleCommentUpdate = (e: any) => {
      if (e.detail?.postId === post.id) {
        refreshComments();
      }
    };

    const handleLikeUpdate = (e: any) => {
      if (e.detail?.postId === post.id) {
        setIsLiked(e.detail.liked);
        setVotesCount(e.detail.votes);
      }
    };

    window.addEventListener('vq-comment-updated', handleCommentUpdate);
    window.addEventListener('vq-like-updated', handleLikeUpdate);

    return () => {
      window.removeEventListener('vq-comment-updated', handleCommentUpdate);
      window.removeEventListener('vq-like-updated', handleLikeUpdate);
    };
  }, [post.id, post.votes]);

  const handleToggleLike = () => {
    const res = socialFeedService.toggleLike(post.id);
    setIsLiked(res.liked);
    setVotesCount(res.votes);
  };

  const handleAddCommentOrReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (replyingToComment) {
      socialFeedService.addReply(post.id, replyingToComment.id, {
        author: currentUsername,
        avatar: currentUserAvatar,
        text: commentText.trim(),
      });
      setReplyingToComment(null);
    } else {
      socialFeedService.addComment(post.id, {
        author: currentUsername,
        avatar: currentUserAvatar,
        text: commentText.trim(),
      });
    }

    setCommentText('');
    refreshComments();
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/vibe/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }).catch(() => {
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      });
    } else {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
    if (onShare) onShare(post);
  };

  const totalCommentCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="bg-[#141217] rounded-[24px] p-4 sm:p-5 mx-3 sm:mx-5 mb-4 border border-white/5 hover:border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.5)] transition-all text-left group">
      
      {/* 1. POST HEADER (Facebook style) */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div 
            onClick={() => onPressProfile && onPressProfile(post.userId, post.username)}
            className="relative w-11 h-11 shrink-0 bg-zinc-800 rounded-full flex items-center justify-center text-xl border border-white/10 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors"
          >
            {post.avatarUrl ? (
              <img 
                src={post.avatarUrl} 
                alt={post.author} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <span>{post.avatar || '✨'}</span>
            )}
            {post.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#30D158] border-2 border-[#141217] rounded-full ring-1 ring-[#30D158]/50" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span 
                onClick={() => onPressProfile && onPressProfile(post.userId, post.username)}
                className="font-bold text-[14.5px] text-white hover:text-amber-400 cursor-pointer transition-colors"
              >
                {post.author || `@${post.username}`}
              </span>
              {post.zone && (
                <span className="bg-amber-500/10 border border-amber-500/20 text-[#eab308] font-mono text-[9px] font-black rounded-md px-1.5 py-0.5 uppercase tracking-wider">
                  {post.zone}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
              <span>{post.time || 'Just now'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300 truncate max-w-[170px] sm:max-w-[260px]">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{post.emoji} {post.venueName || post.location || 'Local Node'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Share Icon */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer relative"
          title="Share Post"
        >
          <Share2 className="w-4 h-4" />
          {copiedToast && (
            <span className="absolute -top-7 right-0 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-in fade-in">
              Link copied!
            </span>
          )}
        </button>
      </div>

      {/* 2. POST CONTENT */}
      <div className="pt-3 pb-2 space-y-3">
        {(post.text || post.feeling) && (
          <p className="text-[14.5px] text-[#F3F3F6] font-normal leading-relaxed whitespace-pre-wrap select-text">
            {post.text || post.feeling}
          </p>
        )}

        {/* Photo / Media */}
        {(post.imageUri || post.image) && (
          <div className="relative rounded-[18px] overflow-hidden border border-white/5 bg-black/40 group/media">
            <img 
              src={post.imageUri || post.image || ''} 
              alt="Shared Vibe Context" 
              className="w-full max-h-[380px] object-cover group-hover/media:scale-[1.01] transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-mono font-black text-amber-400 tracking-wider uppercase flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live Capture
            </div>
          </div>
        )}
      </div>

      {/* 3. STATS BAR */}
      <div className="flex items-center justify-between py-2 text-[11px] font-mono text-zinc-400 border-b border-white/5 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">
            ❤️
          </span>
          <span>{votesCount} {votesCount === 1 ? 'like' : 'likes'}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {totalCommentCount} {totalCommentCount === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* 4. FACEBOOK-STYLE ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-1 py-1 text-xs font-bold text-zinc-300 border-b border-white/5 select-none">
        {/* Like */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer active:scale-95",
            isLiked ? "text-rose-400 font-extrabold" : "text-zinc-400 hover:text-white"
          )}
        >
          <Heart className={cn("w-4 h-4 transition-transform", isLiked && "fill-rose-500 text-rose-500 scale-110")} />
          <span>{isLiked ? 'Liked' : 'Like'}</span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={() => setShowComments(true)}
          className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer active:scale-95",
            showComments ? "text-amber-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* 5. FACEBOOK-STYLE THREADED COMMENTS & REPLIES SECTION */}
      {showComments && (
        <div className="pt-3 space-y-3">
          
          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-[12px] text-zinc-500 italic py-1">
                No comments yet. Start the conversation!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Top Comment Bubble */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
                      {comment.avatar || '✨'}
                    </div>

                    <div className="flex-1">
                      <div className="bg-[#1C1A21] border border-white/5 rounded-2xl px-3.5 py-2.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[12px] text-amber-200">
                            {comment.author}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {comment.time}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-zinc-200 leading-snug">
                          {comment.text}
                        </p>
                      </div>

                      {/* Reply button under comment */}
                      <div className="flex items-center gap-3 pl-2 pt-1 text-[11px] font-mono text-zinc-400">
                        <button
                          type="button"
                          onClick={() => setReplyingToComment({ id: comment.id, author: comment.author })}
                          className="hover:text-amber-400 font-bold transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Threaded Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-9 space-y-2 border-l border-white/5 ml-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">
                            {reply.avatar || '✨'}
                          </div>

                          <div className="flex-1 bg-[#18161D] border border-white/5 rounded-xl px-3 py-2 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-amber-300">
                                {reply.author}
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono">
                                {reply.time}
                              </span>
                            </div>
                            <p className="text-[12px] text-zinc-300 leading-snug">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Replying Banner Banner */}
          {replyingToComment && (
            <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-xs text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <CornerDownRight className="w-3.5 h-3.5" />
                Replying to <strong className="font-bold">{replyingToComment.author}</strong>
              </span>
              <button
                type="button"
                onClick={() => setReplyingToComment(null)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Comment/Reply Input Box */}
          <form onSubmit={handleAddCommentOrReply} className="flex items-center gap-2 pt-1">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-sm shrink-0">
              {currentUserAvatar}
            </div>

            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingToComment ? `Reply to ${replyingToComment.author}...` : "Write a comment..."}
              className="flex-1 bg-zinc-900/90 border border-white/10 rounded-full h-10 px-4 text-[12.5px] text-white placeholder-zinc-500 outline-none focus:border-amber-400 transition-colors"
            />

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-10 h-10 rounded-full bg-amber-500 disabled:bg-zinc-800 text-black disabled:text-zinc-600 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-md shadow-amber-500/10"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
