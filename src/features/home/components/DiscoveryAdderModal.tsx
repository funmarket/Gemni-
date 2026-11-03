import React, { useState } from 'react';
import { useHomeStorage } from '../services/homeStorage';

interface DiscoveryAdderModalProps {
  profile: any;
  triggerHaptic: (type: string) => void;
  triggerAlert: (title: string, message: string, type?: string) => void;
  profileCompCompleted: boolean;
  setProfileCompCompleted: (comp: boolean) => void;
  setLiveActivityFeed: React.Dispatch<React.SetStateAction<any[]>>;
  onCloseModal: () => void;
}

export const DiscoveryAdderModal: React.FC<DiscoveryAdderModalProps> = ({
  profile,
  triggerHaptic,
  triggerAlert,
  profileCompCompleted,
  setProfileCompCompleted,
  setLiveActivityFeed,
  onCloseModal,
}) => {
  const { getSimulatedProfile, saveSimulatedProfile } = useHomeStorage();

  // Internal form states
  const [profileCompName, setProfileCompName] = useState(profile?.displayName || 'Sarah J.');
  const [profileCompBio, setProfileCompBio] = useState('');
  const [profileCompVibe, setProfileCompVibe] = useState('Cozy');

  const [newActText, setNewActText] = useState('');
  const [newActLoc, setNewActLoc] = useState('');
  const [newActEmoji, setNewActEmoji] = useState('🎵');

  return (
    <div className="space-y-4">
      {/* Check if user profile is complete */}
      {!profileCompCompleted ? (
        /* profile completion interface */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!profileCompName || !profileCompBio) {
              triggerAlert("Incomplete Fields", "Please fill out your display name and bio details to complete your profile!", "warning");
              return;
            }
            triggerHaptic('heavy');
            
            setProfileCompCompleted(true);
            
            // Fallback to update localStorage manually without setProfile
            const simulatedProfile = getSimulatedProfile();
            if (simulatedProfile) {
              const updated = { 
                ...simulatedProfile, 
                displayName: profileCompName, 
                bio: profileCompBio, 
                favoriteVibe: profileCompVibe,
                isProfileCompleted: true 
              };
              saveSimulatedProfile(updated);
            }
            
            triggerAlert("🎉 Passport Signal Certified!", "Your profile is now marked as Completed. You are authorized to post Live Activities!");
          }}
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-250 text-slate-900 space-y-3 text-left"
        >
          <div className="space-y-1">
            <h4 className="font-black text-xs text-emerald-850 uppercase tracking-tight flex items-center gap-1">
              <span>🎒 Explorer Profile Info</span>
            </h4>
            <p className="text-[10px] text-zinc-650 leading-relaxed font-semibold">
              VibeQuest is designed for authentic human beings. Update your bio details to share your custom live spots with other explorers!
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Your Full Name / Display Name</label>
              <input 
                type="text"
                value={profileCompName}
                onChange={(e) => setProfileCompName(e.target.value)}
                placeholder="e.g. Sarah Jennings"
                className="w-full bg-white border border-emerald-200 text-slate-850 rounded-lg h-9 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Your Community Bio / Motto</label>
              <input 
                type="text"
                value={profileCompBio}
                onChange={(e) => setProfileCompBio(e.target.value)}
                placeholder="e.g. Vinyl and specialty tea lover exploring SOMA."
                className="w-full bg-white border border-emerald-200 text-slate-850 rounded-lg h-9 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Favorite Vibe Mode</label>
              <select 
                value={profileCompVibe}
                onChange={(e) => setProfileCompVibe(e.target.value)}
                className="w-full bg-white border border-emerald-200 text-slate-850 rounded-lg h-9 px-2 text-xs outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Cozy">Cozy / Snug</option>
                <option value="Chilled">Chilled / Slow</option>
                <option value="Warm">Warm / Acoustic</option>
                <option value="Sparkle">Sparkle / Hype</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase h-11 rounded-lg transition-all shadow-md cursor-pointer mt-2"
          >
            Complete & Verify Profile ✓
          </button>
        </form>
      ) : (
        /* activity submission form */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newActText || !newActLoc) {
              triggerAlert("Incomplete Fields", "Please supply an activity description and location!", "warning");
              return;
            }
            triggerHaptic('heavy');
            
            const newActivity = {
              id: `l-live-user-${Date.now()}`,
              text: newActText,
              emoji: newActEmoji,
              timestamp: Date.now(),
              location: newActLoc
            };
            
            setLiveActivityFeed(prev => [newActivity, ...prev]);
            
            // Reset form
            setNewActText('');
            setNewActLoc('');
            setNewActEmoji('🎵');
            onCloseModal();
            
            triggerAlert("📡 Live Spot Shared!", "Your Live Activity has been successfully shared and displayed on the feed.");
          }}
          className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 text-slate-800 space-y-3 text-left"
        >
          <div className="flex justify-between items-center bg-emerald-55 p-2.5 rounded-lg border border-emerald-100">
            <div>
              <span className="block text-[8px] font-mono uppercase text-emerald-800 font-bold">Authorized Account</span>
              <span className="block text-xs font-bold text-slate-800">👤 {profile?.displayName || profileCompName}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setProfileCompCompleted(false); // allows re-editing the completed state
              }}
              className="text-[9.5px] text-emerald-700 font-bold uppercase hover:underline"
            >
              Edit Profile
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">What are you doing live? (Activity Text)</label>
              <input 
                type="text"
                value={newActText}
                onChange={(e) => setNewActText(e.target.value)}
                placeholder="e.g. Drinking green tea on the outdoor terrace circle"
                className="w-full bg-white border border-zinc-200 text-slate-800 rounded-lg h-9 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Location / Zone</label>
                <input 
                  type="text"
                  value={newActLoc}
                  onChange={(e) => setNewActLoc(e.target.value)}
                  placeholder="e.g. SOMA, SF"
                  className="w-full bg-white border border-zinc-200 text-slate-800 rounded-lg h-9 px-3 text-xs outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block mb-1">Select Indicator Emoji</label>
                <select 
                  value={newActEmoji}
                  onChange={(e) => setNewActEmoji(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-slate-800 rounded-lg h-9 px-2 text-xs outline-none focus:border-emerald-555 font-medium font-mono"
                >
                  <option value="🎵">🎵 Music / Synth</option>
                  <option value="☕">☕ Cafe / Brew</option>
                  <option value="🎨">🎨 Art / Crafts</option>
                  <option value="🎸">🎸 Live Jam</option>
                  <option value="🍵">🍵 Tea Ceremony</option>
                  <option value="🌅">🌅 Sunset Walk</option>
                  <option value="🎭">🎭 Poetry / Theatre</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs uppercase h-11 rounded-lg transition-all shadow-md cursor-pointer mt-2"
          >
            Share Live Activity →
          </button>
        </form>
      )}
    </div>
  );
};
