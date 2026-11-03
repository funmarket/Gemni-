import React, { useState } from 'react';
import { Sparkles, MapPin, Heart, ChevronDown, ChevronUp, UserCheck, UserPlus, Send } from 'lucide-react';
import { UserProfile } from '../../types/socialGraph';

interface DiscoverCardProps {
  profile: UserProfile;
  currentUserProfile: UserProfile;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onSendChallenge: (prompt: string) => void;
}

// Haversine formula for geodistance
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Token intersection for local semantic similarity simulation
function getSemanticSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().match(/\w+/g) || [];
  const words2 = text2.toLowerCase().match(/\w+/g) || [];
  if (words1.length === 0 || words2.length === 0) return 0.5;

  const set2 = new Set(words2);
  const intersection = words1.filter(w => set2.has(w));
  
  // Cosine-like ratio with mild smoothing
  const rawSim = intersection.length / Math.sqrt(words1.length * words2.length);
  return Math.min(1, rawSim * 2.5 + 0.3); // Scale up to ensure realistic scores for related topics
}

export const DiscoverCard: React.FC<DiscoverCardProps> = ({
  profile,
  currentUserProfile,
  isFollowing,
  onFollowToggle,
  onSendChallenge,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [challengePrompt, setChallengePrompt] = useState('');
  const [promptSent, setPromptSent] = useState(false);

  // --- SCORE CALCULATION ENGINE ---
  // 1. Semantic Similarity (35%)
  const semSim = getSemanticSimilarity(currentUserProfile.vibes || '', profile.vibes || '');
  const semanticScore = Math.round(semSim * 100);

  // 2. Location proximity (25%) -> 100 max within 1km, degrading to 0 at 30km
  const dist = getHaversineDistance(
    currentUserProfile.latitude,
    currentUserProfile.longitude,
    profile.latitude,
    profile.longitude
  );
  const locationScore = Math.max(0, Math.round(100 - (dist * 3.33)));

  // 3. Jaccard Index Interests Overlap (20%)
  const myInterests = new Set(currentUserProfile.interests || []);
  const otherInterests = profile.interests || [];
  const sharedInterests = otherInterests.filter(i => myInterests.has(i));
  const unionInterests = new Set([...myInterests, ...otherInterests]);
  const interestJaccard = unionInterests.size > 0 ? sharedInterests.length / unionInterests.size : 0;
  const interestScore = Math.round(interestJaccard * 100);

  // 4. Overlap Activities (10%)
  const myActivities = new Set(currentUserProfile.activities || []);
  const otherActivities = profile.activities || [];
  const sharedActivities = otherActivities.filter(a => myActivities.has(a));
  const activityScore = myActivities.size > 0 ? Math.round((sharedActivities.length / myActivities.size) * 100) : 50;

  // 5. Match Preferences Alignment (10%)
  const otherPrefs = new Set(profile.preferred_match_types || []);
  const sharedPrefs = (currentUserProfile.preferred_match_types || []).filter(p => otherPrefs.has(p));
  const preferenceScore = sharedPrefs.length > 0 ? 100 : 30;

  // Weighted overall composite score (0 - 100)
  const compositeScore = Math.round(
    0.35 * semanticScore +
    0.25 * locationScore +
    0.20 * interestScore +
    0.10 * activityScore +
    0.10 * preferenceScore
  );

  const handleChallengeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengePrompt.trim()) return;
    onSendChallenge(challengePrompt);
    setChallengePrompt('');
    setPromptSent(true);
    setTimeout(() => setPromptSent(false), 3000);
  };

  return (
    <div className="bg-[#1C1C1E] border border-zinc-900/60 rounded-[16px] mx-3 sm:mx-5 mb-4 p-4 text-left shadow-lg overflow-hidden transition-all duration-300">
      
      {/* Primary header area: Avatar, username, distance and top-right MATCH SCORE */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl select-none">
            {profile.avatar}
          </div>
          <div>
            <h4 className="font-bold text-[16px] text-white">
              @{profile.username}
            </h4>
            <div className="flex items-center gap-1 text-[12px] text-zinc-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{dist.toFixed(1)} km away</span>
            </div>
          </div>
        </div>

        {/* Dynamic Vibe Matrix Accent Match score */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className="cursor-pointer bg-fuchsia-500/10 border border-fuchsia-500/30 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-fuchsia-500/20 active:scale-95 transition-all text-fuchsia-400 font-mono font-black text-[13px]"
        >
          <span>{compositeScore}% Match</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Profile short vibe text */}
      <p className="mt-3 text-[14px] text-zinc-300 italic font-normal leading-relaxed">
        &ldquo;{profile.vibes}&rdquo;
      </p>

      {/* Render categorical interests badges */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {profile.interests.map((interest) => {
          const isShared = myInterests.has(interest);
          return (
            <span
              key={interest}
              className={`text-[11px] px-2.5 py-1 rounded-[6px] font-medium tracking-wide uppercase transition-colors ${
                isShared 
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' 
                : 'bg-zinc-800/60 text-zinc-400 border border-transparent'
              }`}
            >
              {interest}
            </span>
          );
        })}
      </div>

      {/* Expanded breakdown panel and matching weights diagnostics */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-3.5 text-[12px] animate-fadeIn">
          <div className="text-[11px] uppercase font-black text-zinc-500 tracking-[0.08em]">
            Match Breakdown Tooltip
          </div>

          <div className="space-y-2 font-mono">
            {/* Semantic */}
            <div>
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>35% Semantic Proximity</span>
                <span className="text-zinc-200">{semanticScore}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${semanticScore}%` }} />
              </div>
            </div>

            {/* Geodistance */}
            <div>
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>25% Physical Location ({dist.toFixed(1)}km)</span>
                <span className="text-zinc-200">{locationScore}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${locationScore}%` }} />
              </div>
            </div>

            {/* Categorical Interests */}
            <div>
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>20% Interests Overlap</span>
                <span className="text-zinc-200">{interestScore}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500" style={{ width: `${interestScore}%` }} />
              </div>
            </div>

            {/* Joint activities */}
            <div>
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>10% Activity Overlap</span>
                <span className="text-zinc-200">{activityScore}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${activityScore}%` }} />
              </div>
            </div>

            {/* Preference alignment */}
            <div>
              <div className="flex justify-between text-zinc-400 text-[11px] mb-1">
                <span>10% Preference Alignment</span>
                <span className="text-zinc-200">{preferenceScore}%</span>
              </div>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${preferenceScore}%` }} />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 leading-relaxed font-sans pt-1">
            🎯 <strong>Result:</strong> {compositeScore}% total correspondence score. High similarity in late-night chill loops and custom workflow preferences.
          </div>
        </div>
      )}

      {/* Bottom operation footer row */}
      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between gap-3 font-sans">
        
        {/* Toggle Following relationship status list */}
        <button
          type="button"
          onClick={onFollowToggle}
          className={`px-3 py-2 rounded-[10px] text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
            isFollowing 
              ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
              : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
          }`}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              <span>Follow</span>
            </>
          )}
        </button>

        {/* CHALLENGE MATCH FORM */}
        <form onSubmit={handleChallengeSubmit} className="flex-1 flex gap-1.5">
          <input
            type="text"
            required
            value={challengePrompt}
            onChange={(e) => setChallengePrompt(e.target.value)}
            disabled={promptSent}
            placeholder={promptSent ? 'Challenge Sent! 🎯' : 'Synthesize Vibe Challenge...'}
            className="flex-1 text-[12px] bg-zinc-900/90 border border-zinc-800/80 rounded-[10px] px-3 py-2 text-white focus:outline-none focus:border-purple-500 placeholder-zinc-500 disabled:bg-zinc-900/40 disabled:text-emerald-400 font-medium"
          />
          <button
            type="submit"
            disabled={promptSent}
            className="bg-purple-900/30 hover:bg-purple-800/40 text-purple-400 border border-purple-800/40 px-3 py-2 rounded-[10px] active:scale-95 disabled:scale-100 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default DiscoverCard;
