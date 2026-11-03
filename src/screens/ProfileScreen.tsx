import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, LogOut, Award, Shield, ChevronRight, Settings, Check, X, Compass, ArrowUp, Edit, MapPin
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ProfileView } from '@/components/profile/ProfileView';
import { BadgesShelf } from '@/features/profile/components/BadgesShelf';

export const ProfileScreen: React.FC = () => {
  const { profile, logout, updateProfilePoints } = useAuth();
  
  // States
  const [showEditModal, setShowEditModal] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState(false);

  const sections = [
    { label: "Sync Preferences", icon: Settings, color: "text-zinc-500" },
    { label: "Security Protocol", icon: Shield, color: "text-emerald-500" },
    { label: "Identity Verification", icon: Award, color: "text-[#f97316]" }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 text-left select-none relative">
      
      {/* 1. Centered Profile Header (Perfect match to Image 2) */}
      <header className="flex flex-col items-center gap-4.5 pt-4">
        
        {/* Silhouette avatar circle with green outline and glowing filter */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full" />
          <div className="relative w-32 h-32 rounded-full border-2 border-green-500 p-1 bg-black flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-zinc-500 relative">
              {profile?.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt={profile.displayName || profile.handle} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                /* Silhouette SVG drawing standard user silhouette precisely */
                <svg 
                  className="w-20 h-20 text-zinc-400 mt-4" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Display Details */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {profile?.displayName || profile?.handle || 'Profile'}
          </h2>
          <p className="text-xs text-zinc-500 font-semibold font-mono">
            @{profile?.handle || 'username'}
          </p>
        </div>

        {/* Edit Profile capsule - Clean Material/Google filled tonal style */}
        <button 
          onClick={() => setShowEditModal(true)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-sm font-semibold px-5 py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:scale-102 transition-all cursor-pointer"
        >
          <span>📝</span> Edit Profile
        </button>

      </header>

      {/* 2. Connected status card (Plum/Dark Violet - Perfect Match to Image 2 Card) */}
      <div className="bg-[#1f102c] border border-purple-500/15 rounded-3xl p-5 flex items-center justify-between text-left shadow-[0_4px_20px_rgba(168,85,247,0.06)]">
        
        <div className="space-y-2 flex-1 pr-4">
          <div className="flex items-center gap-2 text-purple-300">
            <span className="text-base">🧭</span>
            <h4 className="font-extrabold text-sm text-purple-100">
              Voyager
            </h4>
          </div>
          <p className="text-xs text-purple-200/80 leading-normal font-normal">
            {upgradeStatus 
              ? "Access status: Elite - Global Node verification active"
              : "Wallet connected - Marketplace access enabled"
            }
          </p>
        </div>

        {/* Upgrade / Elevation key (Semi-opaque filled tonal, rounded-2xl) */}
        <button 
          onClick={() => {
            setUpgradeStatus(!upgradeStatus);
            if (!upgradeStatus) {
              updateProfilePoints(100);
              alert("Rank elevated to Elite Voyager! Received +100 VQ loyalty shards.");
            }
          }}
          className={cn(
            "text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm select-none hover:scale-102 font-mono shrink-0",
            upgradeStatus
              ? "bg-[#10b981]/90 hover:bg-[#10b981]"
              : "bg-purple-500/95 hover:bg-purple-500"
          )}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>{upgradeStatus ? "Elite" : "Upgrade"}</span>
        </button>

      </div>

      {/* 2.5 Cultural Passport Badges Shelf */}
      <BadgesShelf />

      {/* 3. Navigation List Preferences */}
      <div className="space-y-3">
        {sections.map((item, i) => (
          <button 
            key={i} 
            onClick={() => alert(`Accessing security protocol sector: ${item.label}`)}
            className="w-full bg-[#0b0c0e] border border-zinc-900 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className={cn("w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          </button>
        ))}
      </div>

      {/* 4. Terminate Session Button */}
      <button 
        onClick={logout} 
        className="w-full h-14 bg-red-500/10 hover:bg-red-500/15 border border-red-500/15 rounded-2xl flex items-center justify-center gap-2.5 text-red-500 hover:text-red-400 font-extrabold uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Terminate Node Session
      </button>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <ProfileView 
                onSuccess={() => setShowEditModal(false)}
                onCancel={() => setShowEditModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
