/**
 * Domain 12: Social Content & Gossip Feed (D12)
 * Single authoritative writer for social feed moments, gossip notes,
 * comments, replies, upvotes/likes, and live capture streams per Structure.md D12.
 */

import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface PostReply {
  id: string;
  commentId: string;
  author: string;
  avatar: string;
  userId?: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface PostComment {
  id: string;
  postId: string;
  author: string;
  avatar: string;
  userId?: string;
  text: string;
  time: string;
  timestamp: number;
  replies?: PostReply[];
}

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  author: string;
  avatar: string;
  avatarUrl?: string | null;
  text: string;
  feeling: string;
  imageUri?: string | null;
  image?: string | null;
  venueName: string;
  location: string;
  emoji: string;
  zone: string;
  isOnline?: boolean;
  votes: number;
  timestamp: number;
  createdAt: string;
  time?: string;
}

export type GossipPost = SocialPost & {
  authorId?: string;
  authorHandle?: string;
  authorName?: string;
  authorAvatar?: string;
  content?: string;
  photoUrl?: string;
  locationName?: string;
  cityName?: string;
  upvotesCount?: number;
  commentsCount?: number;
  isUpvoted?: boolean;
  tag?: 'food' | 'secret' | 'music' | 'story' | 'alert';
};

const STORAGE_KEY_POSTS = 'vq_social_posts';
const STORAGE_KEY_CUSTOM_POSTS = 'vq_custom_posts';
const STORAGE_KEY_COMMENTS = 'vq_post_comments';
const STORAGE_KEY_LIKES = 'vq_liked_posts';

const SEED_POSTS: SocialPost[] = [];

function formatTimeAgo(timestamp: number): string {
  const elapsed = Date.now() - timestamp;
  if (elapsed < 60000) return 'Just now';
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)}m ago`;
  if (elapsed < 86400000) return `${Math.floor(elapsed / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

class SocialContentDomain {
  private posts: SocialPost[] = [];
  private comments: Record<string, PostComment[]> = {};
  private likes: Record<string, boolean> = {};
  private readonly listeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  constructor() {
    this.load();
    this.syncFromSupabase();
  }

  private load(): void {
    try {
      const rawPosts = localStorage.getItem(STORAGE_KEY_POSTS);
      this.posts = rawPosts ? JSON.parse(rawPosts) : [];

      const rawComments = localStorage.getItem(STORAGE_KEY_COMMENTS);
      this.comments = rawComments ? JSON.parse(rawComments) : {};

      const rawLikes = localStorage.getItem(STORAGE_KEY_LIKES);
      this.likes = rawLikes ? JSON.parse(rawLikes) : {};
    } catch {
      this.posts = [];
    }
  }

  private async syncFromSupabase(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Query profiles to resolve handles, display names and avatar photos
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('id, handle, display_name, photo_url');

        const profileMap = new Map<string, { handle: string; displayName: string; photoUrl: string }>();
        if (profileRows) {
          for (const p of profileRows) {
            const entry = {
              handle: p.handle,
              displayName: p.display_name,
              photoUrl: p.photo_url || ''
            };
            profileMap.set(p.id, entry);
            profileMap.set(p.id.toLowerCase(), entry);
            const stripped = p.id.replace(/^usr_/, '');
            profileMap.set(stripped, entry);
            profileMap.set(stripped.toLowerCase(), entry);
            profileMap.set(p.handle, entry);
            profileMap.set(p.handle.toLowerCase(), entry);
          }

        }

        const remotePosts: SocialPost[] = data.map((d: any) => {
          const profile = profileMap.get(d.user_id) || profileMap.get(String(d.user_id).toLowerCase());
          const handle = profile?.handle || 'explorer'; // Never expose internal IDs as handles.
          return {
            id: d.id,
            userId: d.user_id,
            username: handle,
            author: `@${handle}`,
            avatar: '🎒',
            avatarUrl: profile?.photoUrl || null,
            text: d.caption || '',
            feeling: d.caption || '',
            imageUri: d.image_uri || null,
            image: d.image_uri || null,
            venueName: d.venue_name || 'Cultural Node',
            location: d.venue_name || 'Cultural Node',
            emoji: '✨',
            zone: 'COZY',
            isOnline: true,
            votes: 1,
            timestamp: d.timestamp || Date.now(),
            createdAt: d.created_at || new Date().toISOString(),
            time: formatTimeAgo(d.timestamp || Date.now())
          };
        });

        this.posts = remotePosts;
        this.savePosts();
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('Supabase social posts sync notice:', e);
    }
  }

  private savePosts(): void {
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(this.posts));
    } catch {}
  }

  private saveComments(): void {
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(this.comments));
    } catch {}
  }

  private saveLikes(): void {
    try {
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(this.likes));
    } catch {}
  }

  public getPosts(): SocialPost[] {
    return this.posts.map(p => ({
      ...p,
      time: formatTimeAgo(p.timestamp || Date.now())
    }));
  }

  public async createPost(params: {
    text: string;
    feeling?: string;
    imageUri?: string | null;
    venueName?: string;
    emoji?: string;
    username?: string;
    avatar?: string;
    userId?: string;
  }): Promise<SocialPost> {
    // Derive the author from the authenticated account and the existing verified
    // Auth-to-profile link, not from client-supplied userId or username.
    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || !authResult.user) throw new Error('Sign in before publishing a post.');
    const { data: link, error: linkError } = await supabase.from('s00_test_identity_links')
      .select('legacy_profile_id').eq('auth_user_id', authResult.user.id).maybeSingle();
    if (linkError) throw new Error('Cannot verify post author ownership.');
    const profileId = link?.legacy_profile_id || 'usr_' + authResult.user.id;
    const { data: ownerProfile, error: profileError } = await supabase.from('profiles')
      .select('id, handle, photo_url').eq('id', profileId).maybeSingle();
    if (profileError || !ownerProfile) throw new Error('Your account has no linked profile.');

    const now = Date.now();
    const cleanText = (params.text || params.feeling || '').trim();
    const cleanUser = ownerProfile.handle;
    const cleanAvatar = ownerProfile.photo_url || params.avatar || '✨';
    const cleanLocation = params.venueName?.trim() || 'Tunis Node';
    const cleanEmoji = params.emoji || '✨';
    const postId = `post_${now}_${Math.random().toString(36).substr(2, 6)}`;

    let zone = 'COZY';
    const lower = (cleanText + ' ' + cleanLocation).toLowerCase();
    if (lower.includes('chill') || lower.includes('coffee') || lower.includes('tea')) zone = 'CHILLED';
    else if (lower.includes('music') || lower.includes('art') || lower.includes('synth') || lower.includes('creative')) zone = 'CREATIVE';
    else if (lower.includes('rave') || lower.includes('energy') || lower.includes('party')) zone = 'AMBER';
    else if (lower.includes('sunset') || lower.includes('warm') || lower.includes('sun')) zone = 'WARM';

    const newPost: SocialPost = {
      id: postId,
      userId: ownerProfile.id,
      username: cleanUser,
      author: `@${cleanUser}`,
      avatar: cleanAvatar,
      avatarUrl: cleanAvatar.startsWith('http') ? cleanAvatar : null,
      text: cleanText,
      feeling: cleanText,
      imageUri: params.imageUri || null,
      image: params.imageUri || null,
      venueName: cleanLocation,
      location: cleanLocation,
      emoji: cleanEmoji,
      zone,
      isOnline: true,
      votes: 1,
      timestamp: now,
      createdAt: new Date(now).toISOString(),
      time: 'Just now'
    };

    // Only confirm and broadcast a post after Supabase has acknowledged the write.
    const { error: writeError } = await supabase.from('social_posts').insert({
      id: postId,
      user_id: ownerProfile.id,
      image_uri: newPost.imageUri || null,
      caption: cleanText.substring(0, 300),
      venue_name: cleanLocation.substring(0, 100),
      timestamp: now,
      live_capture: true,
    });
    if (writeError) throw new Error(writeError.message);

    this.posts.unshift(newPost);
    this.savePosts();
    this.notifyListeners();

    try {
      window.dispatchEvent(new CustomEvent('vq-post-created', { detail: newPost }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    return newPost;
  }

  public getComments(postId: string): PostComment[] {
    const list = this.comments[postId] || [];
    return list.map(c => ({
      ...c,
      time: formatTimeAgo(c.timestamp || Date.now()),
      replies: (c.replies || []).map(r => ({
        ...r,
        time: formatTimeAgo(r.timestamp || Date.now())
      }))
    }));
  }

  public addComment(postId: string, commentData: {
    author: string;
    avatar: string;
    text: string;
    userId?: string;
  }): PostComment {
    const now = Date.now();
    const newComment: PostComment = {
      id: `c_${now}_${Math.random().toString(36).substr(2, 5)}`,
      postId,
      author: commentData.author.startsWith('@') ? commentData.author : `@${commentData.author}`,
      avatar: commentData.avatar || '✨',
      userId: commentData.userId || commentData.author,
      text: commentData.text.trim(),
      time: 'Just now',
      timestamp: now,
      replies: []
    };

    const currentList = this.comments[postId] || [];
    this.comments[postId] = [...currentList, newComment];
    this.saveComments();
    this.notifyListeners();

    try {
      window.dispatchEvent(new CustomEvent('vq-comment-updated', { detail: { postId, comment: newComment } }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    return newComment;
  }

  public addReply(postId: string, commentId: string, replyData: {
    author: string;
    avatar: string;
    text: string;
    userId?: string;
  }): PostReply | null {
    const comments = this.comments[postId] || [];
    const target = comments.find(c => c.id === commentId);
    if (!target) return null;

    const now = Date.now();
    const newReply: PostReply = {
      id: `r_${now}_${Math.random().toString(36).substr(2, 5)}`,
      commentId,
      author: replyData.author.startsWith('@') ? replyData.author : `@${replyData.author}`,
      avatar: replyData.avatar || '✨',
      userId: replyData.userId || replyData.author,
      text: replyData.text.trim(),
      time: 'Just now',
      timestamp: now
    };

    target.replies = [...(target.replies || []), newReply];
    this.saveComments();
    this.notifyListeners();

    try {
      window.dispatchEvent(new CustomEvent('vq-comment-updated', { detail: { postId, commentId, reply: newReply } }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    return newReply;
  }

  public toggleLike(postId: string): { liked: boolean; votes: number } {
    const isCurrentlyLiked = !!this.likes[postId];
    const newLiked = !isCurrentlyLiked;
    this.likes[postId] = newLiked;
    this.saveLikes();

    let votes = 0;
    this.posts = this.posts.map(p => {
      if (p.id === postId) {
        const adjustedVotes = Math.max(0, (p.votes || 0) + (newLiked ? 1 : -1));
        votes = adjustedVotes;
        return { ...p, votes: adjustedVotes };
      }
      return p;
    });
    this.savePosts();
    this.notifyListeners();

    try {
      window.dispatchEvent(new CustomEvent('vq-like-updated', { detail: { postId, liked: newLiked, votes } }));
    } catch {}

    return { liked: newLiked, votes };
  }

  public getLikedPosts(): Record<string, boolean> {
    return this.likes;
  }

  public getCustomPosts(): any[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_POSTS);
      const posts = raw ? JSON.parse(raw) : [];
      return posts.filter((post: any) => {
        const ts = post.timestamp || parseFloat(post.id?.replace('vibe-', '')) || Date.now();
        return Date.now() - ts < 86400000;
      });
    } catch {
      return [];
    }
  }

  public saveCustomPost(hfPost: any): void {
    const postWithTs = {
      ...hfPost,
      timestamp: hfPost.timestamp || Date.now()
    };
    const existing = this.getCustomPosts();
    const updated = [postWithTs, ...existing.filter((p: any) => p.id !== postWithTs.id)];
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('vq-post-created', { detail: postWithTs }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  public deleteCustomPost(id: string): void {
    const existing = this.getCustomPosts();
    const updated = existing.filter((p: any) => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }

  public editCustomPost(id: string, text: string): void {
    const existing = this.getCustomPosts();
    const updated = existing.map((p: any) => p.id === id ? { ...p, text } : p);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_POSTS, JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }
}

export const socialContentDomain = new SocialContentDomain();
export const socialFeedService = socialContentDomain;

