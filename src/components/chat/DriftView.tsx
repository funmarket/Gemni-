import React, { useState } from 'react';
import { Compass, Sparkles, Filter, Users, Send } from 'lucide-react';
import { UserProfile } from '../../types/socialGraph';

interface DriftViewProps {
  currentUserProfile: UserProfile;
  allProfiles: UserProfile[];
  onSelectUser: (user: any) => void;
  isFollowingUser: (id: string) => boolean;
  onFollowToggle: (id: string) => void;
  onSendChallenge: (challengedId: string, prompt: string) => void;
}

interface DriftCategory {
  title: string;
  desc: string;
  glowColor: string; // Tailwind glow border styling
  accentColor: string;
}

export const DriftView: React.FC<DriftViewProps> = ({
  currentUserProfile,
  allProfiles,
  onSelectUser,
  isFollowingUser,
  onFollowToggle,
  onSendChallenge,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DriftCategory | null>(null);
  const [challengePrompts, setChallengePrompts] = useState<{ [key: string]: string }>({});
  const [sentChallenges, setSentChallenges] = useState<{ [key: string]: boolean }>({});

  const categories: DriftCategory[] = [
    {
      title: 'Chill Vibes',
      desc: 'zero plans, maximum good energy. just exist together',
      glowColor: 'hover:shadow-[0_0_15px_rgba(45,212,191,0.25)] hover:border-teal-400/40',
      accentColor: '#2DD4BF',
    },
    {
      title: 'Sweat Vibes',
      desc: 'gym, run, flow, or sport — let’s sweat the same wavelength',
      glowColor: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:border-rose-400/40',
      accentColor: '#F43F5E',
    },
    {
      title: 'Lounge Vibes',
      desc: 'coffee shops, rooftops, vinyl & zero rush. pure cozy mode',
      glowColor: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-400/40',
      accentColor: '#F59E0B',
    },
    {
      title: 'Brain Vibes',
      desc: 'deep talks, wild ideas, 3am theories. brainrot besties welcome',
      glowColor: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:border-violet-400/40',
      accentColor: '#8B5CF6',
    },
    {
      title: 'Sunset Vibes',
      desc: 'golden hour walks, rooftop sits, chasing that orange sky glow',
      glowColor: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.25)] hover:border-orange-400/40',
      accentColor: '#F97316',
    },
    {
      title: 'Mellow Vibes',
      desc: 'slow mornings, soft playlists, doing nothing but feeling everything',
      glowColor: 'hover:shadow-[0_0_15px_rgba(14,165,233,0.25)] hover:border-sky-400/40',
      accentColor: '#0EA5E9',
    },
    {
      title: 'Echo Vibes',
      desc: 'instant click. same frequency. we just get each other',
      glowColor: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:border-emerald-400/40',
      accentColor: '#10B981',
    },
    {
      title: 'Zen Vibes',
      desc: 'breathwork, nature reset, calm your chaos together',
      glowColor: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.25)] hover:border-green-400/40',
      accentColor: '#22C55E',
    },
    {
      title: 'Groove Vibes',
      desc: 'music, dance, kitchen concerts — let’s move to the same beat',
      glowColor: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.25)] hover:border-pink-400/40',
      accentColor: '#EC7299',
    },
    {
      title: 'Pixel Vibes',
      desc: 'gaming sessions, late-night streams, digital world twins',
      glowColor: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:border-indigo-400/40',
      accentColor: '#6366F1',
    },
    {
      title: 'Quest Vibes',
      desc: 'spontaneous adventures, hidden spots, real-life side quests',
      glowColor: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:border-purple-400/40',
      accentColor: '#A855F7',
    },
    {
      title: 'Wander',
      desc: 'just wander away, get lost and lose yourself in an unplanned journey with random wanderers',
      glowColor: 'hover:shadow-[0_0_15px_rgba(251,113,133,0.25)] hover:border-rose-400/40',
      accentColor: '#FB7185',
    },
  ];

  // Map category keywords to scan potential profiles with overlapping descriptions or interests
  const getSimulatedMatchesForCategory = (category: DriftCategory) => {
    const keyword = category.title.split(' ')[0].toLowerCase();
    // Exclude current user
    return allProfiles.filter(p => {
      if (p.id === currentUserProfile.id) return false;
      const lowerVibe = (p.vibes || '').toLowerCase();
      const lowerInterests = (p.interests || []).join(' ').toLowerCase();
      return (
        lowerVibe.includes(keyword) ||
        lowerInterests.includes(keyword) ||
        lowerVibe.includes('chill') || // Default fallback to make sure list is never fully empty
        p.id === 'cyber_voyager' ||
        p.id === 'analog_lens'
      );
    });
  };

  const currentMatches = selectedCategory ? getSimulatedMatchesForCategory(selectedCategory) : [];

  const handleChallengeSubmit = (e: React.FormEvent, targetId: string) => {
    e.preventDefault();
    const prompt = challengePrompts[targetId] || `Synthesize vibe with me in the ${selectedCategory?.title} frequency?`;
    if (!prompt.trim()) return;

    onSendChallenge(targetId, prompt);
    setSentChallenges(prev => ({ ...prev, [targetId]: true }));
    setChallengePrompts(prev => ({ ...prev, [targetId]: '' }));

    setTimeout(() => {
      setSentChallenges(prev => ({ ...prev, [targetId]: false }));
    }, 4000);
  };

  return (
    <div className="flex flex-col text-left py-1 pb-4">
      
      {/* Subpage banner intro or active selection overlay */}
      {selectedCategory ? (
        <div className="px-3 sm:px-5 mb-5 pb-4 border-b border-zinc-900 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="px-3.5 py-1.5 rounded-[10px] bg-zinc-900 border border-zinc-800 text-[12px] font-bold text-zinc-400 active:scale-95 transition-all cursor-pointer"
            >
              Back to Drift Frequency List
            </button>
            <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Drifting Active</span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="font-romantic text-[28px] text-white leading-tight">
              {selectedCategory.title}
            </h2>
            <p className="font-montserrat-light text-[13px] text-zinc-400 mt-1 leading-relaxed">
              {selectedCategory.desc}
            </p>
          </div>

          <div className="mt-6">
            <div className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Drifters on this wavelength ({currentMatches.length})</span>
            </div>

            <div className="space-y-4">
              {currentMatches.map(profile => {
                const isFollowing = isFollowingUser(profile.id);
                const isSent = sentChallenges[profile.id];

                return (
                  <div
                    key={profile.id}
                    className="p-4 rounded-[14px] bg-[#111112] border border-zinc-900 flex flex-col gap-3 transition-all duration-300 hover:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{profile.avatar || '👽'}</span>
                        <div>
                          <h4 className="font-bold text-[14px] text-white">@{profile.username}</h4>
                          <p className="text-[11.5px] font-montserrat-light text-zinc-500 truncate max-w-[170px]">
                            {profile.vibes}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onFollowToggle(profile.id)}
                        className={`px-3 py-1.5 rounded-[9px] text-[11px] font-bold border transition-all ${
                          isFollowing
                            ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                            : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>

                    {/* Quick message request input */}
                    <form 
                      onSubmit={(e) => handleChallengeSubmit(e, profile.id)}
                      className="flex items-center gap-2 mt-1"
                    >
                      <input
                        type="text"
                        value={challengePrompts[profile.id] || ''}
                        onChange={(e) => setChallengePrompts(prev => ({ ...prev, [profile.id]: e.target.value }))}
                        disabled={isSent}
                        placeholder={isSent ? 'Vibe Check Sent! 💜' : `Drop into ${profile.username}'s frequency...`}
                        className="flex-1 bg-black border border-zinc-900 rounded-[10px] px-3 py-2 text-[12px] text-white focus:outline-none focus:border-zinc-700 font-montserrat-light placeholder-zinc-600 disabled:text-emerald-400"
                      />
                      <button
                        type="submit"
                        disabled={isSent}
                        className="p-2 rounded-[10px] bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 transition-all text-zinc-400 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 sm:px-5">
          {/* Header info */}
          <div className="mb-4">
            <h3 className="font-romantic text-[27px] text-white leading-tight">
              Shared Wavelengths
            </h3>
            <p className="font-montserrat-light text-[12.5px] text-zinc-400 leading-relaxed mt-0.5">
              Tune into a neighborhood wavelength to chat and drift along with fellow travelers sharing similar interests!
            </p>
          </div>

          {/* Elegant Sacramento + Montserrat Category grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {categories.map((cat) => (
              <div
                key={cat.title}
                onClick={() => setSelectedCategory(cat)}
                className={`group p-4 bg-[#0C0C0D] border border-zinc-900/60 rounded-[18px] cursor-pointer text-left transition-all duration-500 transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[128px] ${cat.glowColor}`}
              >
                <div>
                  <h4 className="font-sacramento text-[25px] text-white font-medium group-hover:scale-105 transition-all group-hover:text-glow duration-300 text-left leading-none">
                    {cat.title}
                  </h4>
                  <p className="font-montserrat-light text-[11px] text-zinc-500 mt-2 leading-relaxed tracking-wide font-light line-clamp-3">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <span 
                    className="w-1.5 h-1.5 rounded-full transition-all group-hover:scale-150 duration-300"
                    style={{ backgroundColor: cat.accentColor, boxShadow: `0 0 8px ${cat.accentColor}` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default DriftView;
