import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { feedPosts } from '../data/homeHelpers';

interface HomeFeedTabsProps {
  activeWallTab: 'network' | 'local' | 'foryou';
  setActiveWallTab: (tab: 'network' | 'local' | 'foryou') => void;
  customPosts: any[];
  likedPosts: Record<string, boolean>;
  setLikedPosts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeCommentPostId: string | null;
  setActiveCommentPostId: (id: string | null) => void;
  postComments: Record<string, any[]>;
  commentInputTexts: Record<string, string>;
  setCommentInputTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  savePostComments: (comments: Record<string, any[]>) => void;
  profile: any;
  triggerHaptic: (type: string) => void;
  showToast: (msg: string) => void;
}

export const HomeFeedTabs: React.FC<HomeFeedTabsProps> = ({
  activeWallTab,
  setActiveWallTab,
  customPosts,
  likedPosts,
  setLikedPosts,
  activeCommentPostId,
  setActiveCommentPostId,
  postComments,
  commentInputTexts,
  setCommentInputTexts,
  savePostComments,
  profile,
  triggerHaptic,
  showToast
}) => {
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);

  const getPostAvatarUrl = (post: { userId?: string | null; avatarUrl?: string | null }) => {
    const isCurrentAuthor = Boolean(profile && post.userId
      && (post.userId === profile.id || `usr_${post.userId}` === profile.id || post.userId === profile.handle || (profile.id === 'usr_hannibal_1337' && post.userId === 'd45d581e-631c-45e1-a686-6f9d764aaf04')));
    return (isCurrentAuthor && profile?.photoUrl) ? profile.photoUrl : post.avatarUrl;
  };

  return (
    <div className="space-y-5 text-left pt-2">
      {/* Sleek Underlined Tab Header Menu */}
      <div className="flex border-b border-white/5 pb-1 gap-2">
        {[
          { id: 'network', label: 'My Network' },
          { id: 'local', label: 'Local Vibes' },
          { id: 'foryou', label: 'For You' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveWallTab(tab.id as 'network' | 'local' | 'foryou');
            }}
            className={cn(
              "flex-1 text-center py-2.5 text-xs font-black uppercase tracking-wider relative transition-all focus:outline-none cursor-pointer",
              activeWallTab === tab.id 
                ? "text-[#eab308]" 
                : "text-zinc-500 hover:text-zinc-350"
            )}
          >
            {tab.label}
            {activeWallTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#eab308] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Connected Feed List containing High-Fidelity Cover Images */}
      {(() => {
        const combined = [
          ...(activeWallTab === 'local' || activeWallTab === 'network' ? customPosts : []),
          ...feedPosts[activeWallTab]
        ];
        const displayedPosts = isFeedExpanded ? combined : combined.slice(0, 5);
        const hasMore = combined.length > 5;

        return (
          <div className="space-y-6">
            {displayedPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-[#131116] border border-white/5 rounded-[26px] p-4.5 space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)] text-left relative overflow-hidden group"
              >
              {/* Cover photo */}
              {post.image && (
                <div className="w-full aspect-[4/3] rounded-[18px] overflow-hidden relative border border-white/5 shadow-inner">
                  <img 
                    src={post.image} 
                    alt={post.text} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  {/* Absolute zone tag */}
                  {post.zone && (
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-md uppercase tracking-wider font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eab308] animate-pulse" />
                      {post.zone}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    {/* User profile picture circle on the left */}
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                      {getPostAvatarUrl(post) ? (
                        <img 
                          src={getPostAvatarUrl(post)} 
                          alt={post.author} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-[15px]">{post.avatar}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#FBEBA7] text-[13.5px] tracking-tight leading-none">{post.author}</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">{post.time}</p>
                    </div>
                  </div>
                  
                  <span className="bg-amber-500/10 border border-amber-500/20 text-[#eab308] font-mono text-[9px] font-black rounded-lg px-2 py-1 uppercase tracking-widest leading-none">
                    Verified Sync
                  </span>
                </div>

                <p className="text-[13px] text-zinc-100 font-normal leading-relaxed">
                  {post.text}
                </p>

                {/* Social action loops bar */}
                <div className="flex flex-col gap-3 pt-3.5 border-t border-white/5 select-none text-left">
                  <div className="flex items-center gap-6 font-mono text-[11px] text-zinc-400">
                    <button 
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const newValue = !likedPosts[post.id];
                        setLikedPosts(p => ({ ...p, [post.id]: newValue }));
                        showToast(newValue ? "❤️ Added to your Liked Vibe Signals" : "Removed Liked Vibe Signal");
                      }}
                      className={cn("flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer", likedPosts[post.id] && "text-rose-500 hover:text-rose-400")}
                    >
                      <Heart className={cn("w-4 h-4", likedPosts[post.id] && "fill-rose-500 text-rose-500")} />
                      {likedPosts[post.id] ? post.votes + 1 : post.votes}
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id);
                      }}
                      className={cn("flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer", activeCommentPostId === post.id && "text-amber-500")}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {(postComments[post.id] || []).length} { (postComments[post.id] || []).length === 1 ? 'Comment' : 'Comments' }
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const shareUrl = `${window.location.origin}/post/${post.id}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            showToast("🔗 Post link copied securely to clipboard!");
                          }).catch(() => {
                            showToast("🔗 Copied share link: " + shareUrl);
                          });
                        } else {
                          showToast("🔗 Copied share link: " + shareUrl);
                        }
                      }}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Share
                    </button>
                  </div>

                  {/* Inline comment drawer view */}
                  {activeCommentPostId === post.id && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-3 mt-1.5 duration-200 animate-in fade-in-50 slide-in-from-top-2">
                      <span className="block text-[9px] font-mono uppercase tracking-widest text-amber-500 font-extrabold">
                        💬 Secure Communications Block ({ (postComments[post.id] || []).length })
                      </span>
                      
                      {/* List of existing comments */}
                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {(!postComments[post.id] || postComments[post.id].length === 0) ? (
                          <p className="text-[10.5px] italic text-zinc-500 font-mono">No encrypted responses left on this signal. Be the first!</p>
                        ) : (
                          postComments[post.id].map((comm) => (
                            <div key={comm.id} className="text-xs space-y-1.5 border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-extrabold text-[#FBEBA7] text-[11px]">{comm.author}</span>
                                <span className="text-[9px] text-zinc-500">{comm.time}</span>
                              </div>
                              <p className="text-zinc-300 font-sans leading-relaxed text-[11.5px]">{comm.text}</p>
                              
                              {/* Threaded nested replies */}
                              {comm.replies && comm.replies.length > 0 && (
                                <div className="pl-3 border-l-2 border-amber-500/30 space-y-1.5 mt-1.5 ml-1">
                                  {comm.replies.map((reply: any) => (
                                    <div key={reply.id} className="text-[11px] bg-zinc-900/70 border border-white/5 rounded-lg p-1.5">
                                      <div className="flex items-center justify-between font-mono text-[9.5px]">
                                        <span className="font-bold text-amber-300">{reply.author}</span>
                                        <span className="text-zinc-500">{reply.time}</span>
                                      </div>
                                      <p className="text-zinc-200 text-[11px] mt-0.5 leading-snug">{reply.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setCommentInputTexts(prev => ({ ...prev, [post.id]: `${comm.author} ` }));
                                }}
                                className="text-[10px] text-zinc-400 hover:text-amber-400 font-mono font-bold transition-colors cursor-pointer mt-0.5 inline-block"
                              >
                                Reply
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Input post box */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const txt = commentInputTexts[post.id] || '';
                          if (!txt.trim()) return;
                          triggerHaptic('medium');
                          
                          const newComm = {
                            id: `c-${Date.now()}`,
                            author: profile?.displayName ? `@${profile.displayName.toLowerCase().replace(/\s+/g, '_')}` : '@explorer_voyager',
                            avatar: '🎒',
                            text: txt,
                            time: 'Just now'
                          };
                          
                          const updatedList = [...(postComments[post.id] || []), newComm];
                          const updatedMap = {
                            ...postComments,
                            [post.id]: updatedList
                          };
                          savePostComments(updatedMap);
                          setCommentInputTexts(prev => ({ ...prev, [post.id]: '' }));
                          showToast("💬 Response deployed onto secure signal feed!");
                        }}
                        className="flex gap-2"
                      >
                        <input 
                          type="text"
                          placeholder="Write secure signal response..."
                          value={commentInputTexts[post.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCommentInputTexts(prev => ({ ...prev, [post.id]: val }));
                          }}
                          className="flex-1 bg-zinc-900/80 border border-white/10 rounded-lg h-9 px-3 text-xs outline-none focus:border-amber-500 text-white font-sans placeholder-zinc-500"
                        />
                        <button 
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-black font-mono font-black text-[10px] uppercase tracking-wider px-3.5 h-9 rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}

          {/* Expand / Collapse feed toggle */}
          {hasMore && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsFeedExpanded(!isFeedExpanded);
                }}
                className="w-full bg-[#1b1820] hover:bg-[#25212c] border border-white/10 hover:border-amber-500/30 text-zinc-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {isFeedExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                    <span>Collapse Feed (Showing all {combined.length} posts)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                    <span>Expand Feed (+{combined.length - 5} more posts)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      );
    })()}

    </div>
  );
};
