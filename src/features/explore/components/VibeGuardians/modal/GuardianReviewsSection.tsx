import React, { useState } from 'react';
import { Award, Send, CheckCircle2 } from 'lucide-react';
import { VibeGuardian, VibeBadge } from '../types';
import { addReviewToGuardian } from '../services/vibeGuardianStorage';

interface GuardianReviewsSectionProps {
  guardian: VibeGuardian;
  hasProofHandshake: boolean;
  userKey: string;
  currentUserProfile?: any;
  onReviewsUpdated?: () => void;
}

const AVAILABLE_BADGES: { badge: VibeBadge; icon: string; label: string; color: string }[] = [
  { badge: 'Good Vibe', icon: '⚡', label: 'Good Vibe', color: 'border-amber-500/30 text-amber-300 bg-amber-500/10' },
  { badge: 'Chill Vibe', icon: '🌊', label: 'Chill Vibe', color: 'border-blue-500/30 text-blue-300 bg-blue-500/10' },
  { badge: 'Cool Vibe', icon: '✨', label: 'Cool Vibe', color: 'border-purple-500/30 text-purple-300 bg-purple-500/10' },
];

export const GuardianReviewsSection: React.FC<GuardianReviewsSectionProps> = ({
  guardian,
  hasProofHandshake,
  userKey,
  currentUserProfile,
  onReviewsUpdated,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<VibeBadge>('Good Vibe');
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewNote.trim()) return;

    setReviewError(null);
    setSubmittingReview(true);
    const authorName = currentUserProfile?.displayName || 'Fellow Explorer';
    const authorHandle = currentUserProfile?.handle ? `@${currentUserProfile.handle}` : '@explorer_node';

    const res = addReviewToGuardian(
      guardian.id,
      {
        author: authorName,
        authorHandle,
        badge: selectedBadge,
        note: reviewNote.trim().slice(0, 111),
      },
      userKey
    );

    setSubmittingReview(false);

    if (!res.success) {
      setReviewError(res.error || 'Cannot submit review without handshake proof.');
      return;
    }

    setReviewNote('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
    if (onReviewsUpdated) {
      onReviewsUpdated();
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-white/5">
      <div className="flex items-center justify-between">
        <h5 className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Handshake-Gated Reviews ({guardian.reviews?.length || 0})</span>
        </h5>
        <span className="text-[10px] font-mono text-zinc-500">Max 111 chars</span>
      </div>

      {guardian.reviews && guardian.reviews.length > 0 ? (
        <div className="space-y-2">
          {guardian.reviews.map((rev) => (
            <div key={rev.id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.author}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  {rev.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">"{rev.note}"</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 text-center text-xs text-zinc-500">
          No reviews yet. Complete a Handshake to share the first review!
        </div>
      )}

      {/* Review Submission Form */}
      {hasProofHandshake ? (
        <form onSubmit={handleReviewSubmit} className="space-y-3 p-4 bg-zinc-950 rounded-2xl border border-white/10">
          <span className="text-xs font-mono font-bold text-zinc-400 block">Submit Verified Review</span>

          <div className="flex gap-2">
            {AVAILABLE_BADGES.map((b) => (
              <button
                key={b.badge}
                type="button"
                onClick={() => setSelectedBadge(b.badge)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  selectedBadge === b.badge ? b.color : 'bg-zinc-900 border-white/5 text-zinc-400'
                }`}
              >
                {b.icon} {b.badge}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={2}
              maxLength={111}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Keep it authentic & concise (up to 111 characters)..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
            />
            <span className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-500">
              {111 - reviewNote.length}
            </span>
          </div>

          {reviewError && <p className="text-xs text-rose-400 font-mono">{reviewError}</p>}
          {reviewSuccess && (
            <p className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Review published successfully!
            </p>
          )}

          <button
            type="submit"
            disabled={submittingReview || !reviewNote.trim()}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Post Verified Review
          </button>
        </form>
      ) : (
        <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 text-[11px] text-zinc-500 text-center font-mono">
          🔒 Handshake required before reviews can be posted.
        </div>
      )}
    </div>
  );
};
