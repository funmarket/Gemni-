import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MapPin, Phone, Globe, MessageSquare, ChevronRight, Award, PenTool } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

interface AppReview {
  id: string;
  placeId: string;
  placeName: string;
  rating: number;
  comment: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

interface PlaceDetailModalProps {
  place: {
    id: string;
    name: string;
    address: string;
    rating: number;
    userRatingCount: number;
    phone?: string;
    website?: string;
    types?: string[];
    googleReviews?: any[];
  };
  profile: any;
  updateProfilePoints?: (pts: number) => void;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  profile,
  updateProfilePoints,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'community'>('google');
  
  // App Reviews State
  const [appReviews, setAppReviews] = useState<AppReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Add Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch App Reviews from Supabase
  const fetchAppReviews = async () => {
    setIsLoadingReviews(true);
    setReviewsError(null);
    try {
      const { data, error } = await supabase
        .from('place_reviews')
        .select('*')
        .eq('place_id', place.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const reviewsList: AppReview[] = data.map((d: any) => ({
          id: d.id,
          placeId: d.place_id || d.placeId || '',
          placeName: d.place_name || d.placeName || '',
          rating: Number(d.rating) || 5,
          comment: d.comment || '',
          authorId: d.author_id || d.authorId || '',
          authorName: d.author_name || d.authorName || 'Anonymous Explorer',
          createdAt: d.created_at || d.createdAt || new Date().toISOString(),
        }));
        setAppReviews(reviewsList);
      } else {
        // Fallback to local storage if empty or unmigrated
        const cached = localStorage.getItem(`vq_local_reviews_${place.id}`);
        if (cached) {
          setAppReviews(JSON.parse(cached));
        }
      }
    } catch (err: any) {
      console.warn('Failed to load place reviews from cloud, using offline fallback:', err);
      try {
        const cached = localStorage.getItem(`vq_local_reviews_${place.id}`);
        if (cached) {
          setAppReviews(JSON.parse(cached));
        }
      } catch (_) {}
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchAppReviews();
  }, [place.id]);

  // Handle Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const authorName = profile?.displayName || profile?.handle || 'Vibe Explorer';
    const authorId = profile?.uid || profile?.id || 'guest_node_1337';
    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const reviewPayload = {
      id: reviewId,
      place_id: place.id,
      place_name: place.name,
      rating: newRating,
      comment: newComment.trim(),
      author_id: authorId,
      author_name: authorName,
      created_at: nowIso,
    };

    try {
      await supabase.from('place_reviews').upsert(reviewPayload);
    } catch (err) {
      console.warn('Supabase place review notice:', err);
    }

    const newReview: AppReview = {
      id: reviewId,
      placeId: place.id,
      placeName: place.name,
      rating: newRating,
      comment: newComment.trim(),
      authorId,
      authorName,
      createdAt: nowIso,
    };
    
    // Update local state immediately
    setAppReviews((prev) => [newReview, ...prev]);
      
      // Cache locally
      try {
        const updated = [newReview, ...appReviews];
        localStorage.setItem(`vq_local_reviews_${place.id}`, JSON.stringify(updated));
      } catch (_) {}

      // Award gamification points
      if (updateProfilePoints) {
        updateProfilePoints(25); // +25 VQ Points for submitting a review
      }

      setSubmitSuccess(true);
      setNewComment('');
      setNewRating(5);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.warn('Firestore review failed, using offline fallback', err);
      // Offline fallback
      const fallbackId = `offline_rev_${Date.now()}`;
      const newReview: AppReview = {
        id: fallbackId,
        ...reviewPayload
      };
      const updated = [newReview, ...appReviews];
      setAppReviews(updated);
      try {
        localStorage.setItem(`vq_local_reviews_${place.id}`, JSON.stringify(updated));
      } catch (_) {}

      if (updateProfilePoints) {
        updateProfilePoints(25);
      }

      setSubmitSuccess(true);
      setNewComment('');
      setNewRating(5);
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get a matching Unsplash image based on types for premium visual experience
  const getCategoryImage = () => {
    const types = place.types || [];
    if (types.includes('cafe') || types.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80';
    }
    if (types.includes('restaurant') || types.includes('food')) {
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
    }
    if (types.includes('bar') || types.includes('night_club')) {
      return 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=600&q=80';
    }
    if (types.includes('museum') || types.includes('art_gallery')) {
      return 'https://images.unsplash.com/photo-1574007557239-acf6863bc375?auto=format&fit=crop&w=600&q=80';
    }
    if (types.includes('park') || types.includes('tourist_attraction')) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80';
  };

  // Safe Google Map reviews array
  const googleReviews = place.googleReviews || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
      />

      {/* Modal Card Container */}
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg bg-[#0c0d12] border-t sm:border border-zinc-800/80 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] text-left z-10"
      >
        {/* Header Hero Image Section */}
        <div className="relative h-44 sm:h-48 shrink-0">
          <img 
            src={getCategoryImage()} 
            alt={place.name} 
            className="w-full h-full object-cover brightness-[0.4]"
          />
          {/* Accent Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-black/30" />
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Place Category Indicator */}
          <div className="absolute bottom-4 left-6 flex flex-col gap-1">
            <span className="text-[10px] font-black tracking-widest text-[#3DDC6C] bg-emerald-950/40 border border-emerald-500/20 rounded-full px-2.5 py-0.5 uppercase inline-block w-fit">
              📍 DISCOVERED VENUE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-1">
              {place.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Ratings Summary Banner */}
          <div className="bg-[#12141c] border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xl font-mono font-black text-white">{place.rating || '4.8'}</span>
                <span className="text-xs font-bold text-zinc-500">/ 5.0</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Standard Google Maps rating index
              </p>
            </div>
            <div className="text-right">
              <span className="block text-sm font-black text-white font-mono">
                {place.userRatingCount?.toLocaleString() || '1,240'}
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                Total Reviews
              </span>
            </div>
          </div>

          {/* Address & Contact Info List */}
          <div className="space-y-2.5 text-xs text-zinc-300 font-semibold">
            <div className="flex items-start gap-3 p-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{place.address}</span>
            </div>
            {place.phone && (
              <div className="flex items-center gap-3 p-1">
                <Phone className="w-4 h-4 text-[#3DDC6C] shrink-0" />
                <span>{place.phone}</span>
              </div>
            )}
            {place.website && (
              <div className="flex items-center gap-3 p-1">
                <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                <a 
                  href={place.website} 
                  target="_blank" 
                  referrerPolicy="no-referrer" 
                  className="text-cyan-400 hover:underline transition-all cursor-pointer truncate"
                >
                  {place.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
          </div>

          {/* Review Tabs Navigation */}
          <div className="border-b border-zinc-800/80 flex">
            <button 
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3 text-center text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === 'google' 
                  ? 'border-[#3DDC6C] text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Google Reviews ({googleReviews.length})
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className={`flex-1 py-3 text-center text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                activeTab === 'community' 
                  ? 'border-[#3DDC6C] text-white' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              App Reviews ({appReviews.length})
            </button>
          </div>

          {/* Tab Content Panels */}
          <div>
            {activeTab === 'google' ? (
              <div className="space-y-4">
                {googleReviews.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 space-y-2">
                    <span className="text-2xl">💬</span>
                    <p className="text-xs font-medium">No Google reviews returned for this location.</p>
                  </div>
                ) : (
                  googleReviews.map((rev, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 bg-[#111218] border border-zinc-900 rounded-2xl space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {rev.authorAttribution?.photoUri ? (
                            <img 
                              src={rev.authorAttribution.photoUri} 
                              alt={rev.authorAttribution.displayName} 
                              className="w-7 h-7 rounded-full object-cover border border-white/5"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                              👤
                            </div>
                          )}
                          <div>
                            <h4 className="text-[11.5px] font-black text-white">
                              {rev.authorAttribution?.displayName || 'Anonymous Contributor'}
                            </h4>
                            <span className="text-[9px] text-zinc-500 font-bold block">
                              {rev.relativePublishTimeDescription || 'Recently'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                          ★ {rev.rating}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                        {rev.text?.text || rev.text || 'No review message left.'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Submit New Review Form */}
                <form 
                  onSubmit={handleSubmitReview}
                  className="bg-[#12141c] border border-zinc-800/40 rounded-2xl p-4.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-[#3DDC6C]" />
                      Submit Community Vibe
                    </span>
                    <span className="text-[9.5px] font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/20">
                      +25 VQ Points
                    </span>
                  </div>

                  {/* Stars Selector */}
                  <div className="flex gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-2xl cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= newRating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Textarea comment */}
                  <div className="space-y-1.5">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="How's the vibe? Describe the scene, sound, or service..."
                      maxLength={1000}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#3DDC6C]/50 h-20 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submission Row */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-zinc-500 font-bold">
                      Posting as <span className="text-zinc-300 font-black">{profile?.displayName || 'Sarah J.'}</span>
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="bg-[#3DDC6C] hover:bg-[#32c25c] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black font-extrabold text-[11px] uppercase tracking-wider h-8.5 px-4.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Review'}
                    </button>
                  </div>

                  {/* Feedback Message */}
                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center text-[10.5px] text-emerald-400 font-extrabold tracking-wide uppercase pt-1"
                      >
                        🎉 Vibe secured! +25 VQ points added.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* App Reviews List */}
                <div className="space-y-4">
                  {isLoadingReviews ? (
                    <div className="text-center py-6 text-zinc-500 text-xs font-bold">
                      Syncing community matrix...
                    </div>
                  ) : appReviews.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 space-y-2">
                      <span className="text-2xl">🏡</span>
                      <p className="text-xs font-black uppercase tracking-tight">No local reports yet</p>
                      <p className="text-[10px] text-zinc-600 font-medium">Be the first to leave a community star rating and comment!</p>
                    </div>
                  ) : (
                    appReviews.map((rev) => (
                      <div 
                        key={rev.id} 
                        className="p-4 bg-zinc-900/25 border border-zinc-850 rounded-2xl space-y-2 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-[11.5px] font-black text-[#3DDC6C] flex items-center gap-1">
                              {rev.authorName}
                              <span className="text-[8px] bg-emerald-950/20 border border-emerald-900/30 text-[#3DDC6C] rounded px-1 uppercase tracking-wider">
                                Member
                              </span>
                            </h4>
                            <span className="text-[9px] text-zinc-500 font-bold block">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                            ★ {rev.rating}
                          </div>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Claim/Footer Section */}
        <div className="p-5 bg-zinc-950 border-t border-zinc-900/80 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-[#12131a] hover:bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 rounded-2xl h-11 flex items-center justify-center text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-all active:scale-[0.98]"
          >
            Close Portal
          </button>
        </div>
      </motion.div>
    </div>
  );
};
