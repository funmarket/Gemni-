import React from 'react';
import { MessageSquare, Camera, Sparkles, MapPin, Shield, Award, DollarSign, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VibeGuardian, VibeBadge } from './types';
import { hasUserHandshake } from './services/vibeGuardianStorage';

interface GuardianCardProps {
  guardian: VibeGuardian;
  tab?: 'top' | 'pro' | 'local' | 'suggested';
  fireHaptic?: (type?: 'light' | 'medium' | 'selection') => void;
  currentUserProfile?: any;
  onSelect: (guardian: VibeGuardian) => void;
  onMessage: (guardian: VibeGuardian) => void;
  onHandshake: (guardian: VibeGuardian, actionType: 'hire' | 'vibe') => void;
  onExploreTrail: (trailTitleOrId: string) => void;
}

const BADGE_CONFIG: Record<VibeBadge, { icon: string; bg: string; text: string }> = {
  'Good Vibe': { icon: '⚡', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  'Chill Vibe': { icon: '🌊', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
  'Cool Vibe': { icon: '✨', bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-300' }
};

export const GuardianCard: React.FC<GuardianCardProps> = ({
  guardian,
  tab = 'top',
  fireHaptic,
  currentUserProfile,
  onSelect,
  onMessage,
  onHandshake,
  onExploreTrail
}) => {
  const userKey = currentUserProfile?.handle || currentUserProfile?.displayName || 'guest_user';
  const hasProofHandshake = hasUserHandshake(guardian.id, userKey);

  // Normalizing trails up to 5
  const trailsList = (guardian.trails && guardian.trails.length > 0)
    ? guardian.trails.slice(0, 5)
    : (guardian.favoriteTrails || []).slice(0, 5).map((t, idx) => ({ id: `tr-${idx}`, title: t }));

  return (
    <div
      onClick={() => onSelect(guardian)}
      className="shrink-0 w-[300px] sm:w-[320px] max-w-[85vw] min-w-[285px] bg-[#141218] hover:bg-[#1a1720] border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 space-y-3.5 shadow-lg transition-all duration-200 text-left cursor-pointer group relative overflow-hidden"
    >
      {/* Top row: Photo, info & role / price badge */}
      <div className="flex items-start gap-3.5">
        {/* App-verified selfie thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-purple-500/30 bg-zinc-900 group-hover:scale-105 transition-transform duration-300 shadow-md">
          <img
            src={guardian.selfieUrl}
            alt={guardian.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {/* App-taken selfie verification badge */}
          <div 
            title="Captured live with in-app camera (verified within 7 days)"
            className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-xs py-0.5 text-center flex items-center justify-center gap-0.5 text-[8px] font-mono font-bold text-emerald-400"
          >
            <Camera className="w-2.5 h-2.5 text-emerald-400" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Text information */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <h4 className="font-extrabold text-[15px] text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
              {guardian.name}
            </h4>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Pro Badge vs Local Legend Badge */}
              {guardian.type === 'pro' ? (
                <span className="bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Shield className="w-2.5 h-2.5 text-amber-400" />
                  Pro Guide
                </span>
              ) : (
                <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                  Local Legend
                </span>
              )}

              {/* Handshake Verified Black Icon Badge */}
              {hasProofHandshake && (
                <span 
                  title="Official proof that a real interaction happened through the app"
                  className="bg-black border border-white/25 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md"
                >
                  <span className="text-xs">🤝</span>
                  <span>Handshake</span>
                </span>
              )}
            </div>
          </div>

          {/* Location & Optional Age */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              {guardian.city}, {guardian.stateCountry}
            </span>
            {!guardian.hideAge && guardian.age && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 text-[11px] font-mono">{guardian.age} yrs</span>
              </>
            )}
          </div>

          {/* PRICING RULE FOR PRO GUARDIANS (Visible in advance, Option A Hourly OR Option B Flat) */}
          <div className="pt-0.5 flex items-center justify-between">
            {guardian.type === 'pro' ? (
              <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-[10.5px] font-black px-2.5 py-0.5 rounded-lg shadow-xs">
                <span>💰</span>
                <span>
                  {guardian.pricingType === 'hourly'
                    ? `${guardian.priceDisplay || `$${guardian.hourlyRate || 35}/hour`}`
                    : `${guardian.priceDisplay || `$${guardian.flatRate || 85} flat tour`}`}
                </span>
              </div>
            ) : (
              <span className="text-emerald-400 font-mono text-[10.5px] font-bold">
                ✨ Free Local Hangout (No Fee)
              </span>
            )}
          </div>

          {/* Social Proof Badges under name (Good Vibe, Chill Vibe, Cool Vibe) */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {guardian.earnedBadges.slice(0, 3).map((item) => {
              const cfg = BADGE_CONFIG[item.badge] || { icon: '✨', bg: 'bg-white/5 border-white/10', text: 'text-zinc-300' };
              return (
                <span
                  key={item.badge}
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1",
                    cfg.bg,
                    cfg.text
                  )}
                  title={`${item.count} users tagged ${item.badge}`}
                >
                  <span>{cfg.icon}</span>
                  <span className="font-semibold">{item.badge}</span>
                  <span className="opacity-70 font-bold">({item.count})</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Suggested Recommendation Box if in Suggested tab */}
      {tab === 'suggested' && guardian.suggestedBy && (
        <div className="bg-purple-950/20 border border-purple-500/15 rounded-xl p-2.5 text-xs text-purple-200/90 leading-relaxed space-y-1">
          <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono font-bold">
            <span>Recommended by {guardian.suggestedBy.author}</span>
            <span className="text-purple-400/70">{guardian.suggestedBy.role}</span>
          </div>
          <p className="italic text-[11.5px] text-zinc-300 font-sans">
            "{guardian.suggestedBy.note}"
          </p>
        </div>
      )}

      {/* Bio snippet */}
      <p className="text-xs text-zinc-300 font-normal leading-relaxed line-clamp-2">
        {guardian.bio}
      </p>

      {/* 2. VIBE TRAILS ON CARD (UP TO 5 TRAILS: TITLE + SMALL GREEN "Explore now" BUTTON ONLY) */}
      {trailsList.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-white/5">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
            Offered Vibe Trails ({trailsList.length}/5):
          </span>
          <div className="space-y-1.5">
            {trailsList.map((tr) => (
              <div
                key={tr.id || tr.title}
                className="bg-[#181520] border border-white/5 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* ONLY TRAIL TITLE DISPLAYED */}
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {tr.title}
                </span>

                {/* SMALL GREEN ROUNDED "Explore now" BUTTON */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExploreTrail(tr.title);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
                >
                  Explore now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer bar with Handshake Button + Stats & PRIMARY CTA: Message */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
        {/* Handshake action button: Hire (Pro) or Vibe (Local) */}
        <div className="flex items-center gap-2">
          {guardian.type === 'pro' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHandshake(guardian, 'hire');
              }}
              className={cn(
                "font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95",
                hasProofHandshake
                  ? "bg-black border border-white/20 text-white"
                  : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
              )}
            >
              <span className="text-sm">🤝</span>
              <span>{hasProofHandshake ? 'Hired 🤝' : 'Hire'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHandshake(guardian, 'vibe');
              }}
              className={cn(
                "font-mono text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95",
                hasProofHandshake
                  ? "bg-black border border-white/20 text-white"
                  : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
              )}
            >
              <span className="text-sm">🤝</span>
              <span>{hasProofHandshake ? 'Vibed 🤝' : 'Vibe'}</span>
            </button>
          )}

          <div className="text-[10px] font-mono text-zinc-400">
            {tab === 'top' || guardian.hiresCount > 0 ? (
              <span className="text-amber-400 font-bold">
                {guardian.hiresCount} hires
              </span>
            ) : null}
          </div>
        </div>

        {/* PRIMARY CTA: Message */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMessage(guardian);
          }}
          className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ml-auto"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Message</span>
        </button>
      </div>
    </div>
  );
};
