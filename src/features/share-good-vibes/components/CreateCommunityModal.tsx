import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateCommunityModalProps {
  onClose: () => void;
  newCommName: string;
  setNewCommName: (val: string) => void;
  newCommHandle: string;
  setNewCommHandle: (val: string) => void;
  newCommEmoji: string;
  setNewCommEmoji: (val: string) => void;
  newCommTag: 'love' | 'kindness' | 'help';
  setNewCommTag: (val: 'love' | 'kindness' | 'help') => void;
  newCommCat: string;
  setNewCommCat: (val: string) => void;
  customCategory: string;
  setCustomCategory: (val: string) => void;
  newCommPrivate: boolean;
  setNewCommPrivate: (val: boolean) => void;
  commAddress: string;
  setCommAddress: (val: string) => void;
  commLat: number | null;
  commLng: number | null;
  commGpsStatus: 'idle' | 'fetching' | 'success' | 'failed' | string;
  commHandleStatus: 'idle' | 'checking' | 'valid' | 'invalid' | string;
  isHandleManuallyEdited: boolean;
  setIsHandleManuallyEdited: (val: boolean) => void;
  newCommDesc: string;
  setNewCommDesc: (val: string) => void;
  handleDeployCommunity: (e: React.FormEvent) => void;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  onClose,
  newCommName,
  setNewCommName,
  newCommHandle,
  setNewCommHandle,
  newCommEmoji,
  setNewCommEmoji,
  newCommTag,
  setNewCommTag,
  newCommCat,
  setNewCommCat,
  customCategory,
  setCustomCategory,
  newCommPrivate,
  setNewCommPrivate,
  commAddress,
  setCommAddress,
  commLat,
  commLng,
  commGpsStatus,
  commHandleStatus,
  isHandleManuallyEdited,
  setIsHandleManuallyEdited,
  newCommDesc,
  setNewCommDesc,
  handleDeployCommunity,
  triggerHaptic,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full max-w-sm text-left space-y-4 my-8"
      >
        <div className="flex justify-between items-center pb-2 border-b border-zinc-900 relative">
          <h3 className="font-bold text-[18px] text-zinc-100 uppercase tracking-tight flex items-center gap-2 pr-6">
            <Sparkles className="w-5 h-5 text-rose-500" /> Start Vibe Circle
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer absolute right-0 top-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleDeployCommunity} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Community Name</label>
            <input 
              type="text" 
              placeholder="e.g. Sunset drummers, Dolores Coffee" 
              value={newCommName}
              onChange={(e) => {
                const nameVal = e.target.value;
                setNewCommName(nameVal);
                if (!isHandleManuallyEdited) {
                  const autoHandle = nameVal
                    .toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '')
                    .substring(0, 30);
                  setNewCommHandle(autoHandle);
                }
              }}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Unique Handle</label>
              <span className="text-[10px] font-semibold">
                {commHandleStatus === 'checking' && <span className="text-zinc-400 animate-pulse">Checking...</span>}
                {commHandleStatus === 'valid' && <span className="text-emerald-400">✓ Community Handle Available</span>}
                {commHandleStatus === 'invalid' && <span className="text-rose-500">🛑 Handle Taken</span>}
              </span>
            </div>
            <div className="relative font-mono">
              <span className="absolute left-3.5 top-2.5 text-zinc-500 font-bold text-sm">@</span>
              <input 
                type="text" 
                placeholder="vibe_pulse_handle" 
                value={newCommHandle}
                onChange={(e) => {
                  setNewCommHandle(e.target.value);
                  setIsHandleManuallyEdited(true);
                }}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Emoji icon</label>
              <input 
                type="text" 
                placeholder="🌱" 
                value={newCommEmoji}
                onChange={(e) => setNewCommEmoji(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 text-center text-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kindness Focus</label>
              <select 
                value={newCommTag}
                onChange={(e) => setNewCommTag(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="love">Pure Heart 💖</option>
                <option value="kindness">Friendly 🤗</option>
                <option value="help">Shared Moments 🧘</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Community Coordination Genre</label>
            <select 
              value={newCommCat}
              onChange={(e) => {
                const val = e.target.value;
                setNewCommCat(val);
                const catEmojis: Record<string, string> = {
                  "Travel and Outdoor": "🌲",
                  "Social Activities": "🍕",
                  "Hobbies and Passions": "🧸",
                  "Sports and Fitness": "⚽",
                  "Health and Wellbeing": "🧠",
                  "Technology": "💻",
                  "Art and Culture": "🎨",
                  "Games": "🎮",
                  "Career and Business": "💼",
                  "Science and Education": "🧪",
                  "Other": "👥"
                };
                if (catEmojis[val]) {
                  setNewCommEmoji(catEmojis[val]);
                }
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="Travel and Outdoor">Travel and Outdoor 🌲</option>
              <option value="Social Activities">Social Activities 🍕</option>
              <option value="Hobbies and Passions">Hobbies and Passions 🧸</option>
              <option value="Sports and Fitness">Sports and Fitness ⚽</option>
              <option value="Health and Wellbeing">Health and Wellbeing 🧠</option>
              <option value="Technology">Technology 💻</option>
              <option value="Art and Culture">Art and Culture 🎨</option>
              <option value="Games">Games 🎮</option>
              <option value="Career and Business">Career and Business 💼</option>
              <option value="Science and Education">Science and Education 🧪</option>
              <option value="Other">Other (custom) 👥</option>
            </select>
          </div>

          {newCommCat === 'Other' && (
            <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Custom Category Name</label>
              <input 
                type="text" 
                placeholder="e.g. Cooking Club, Book Lovers" 
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required={newCommCat === 'Other'}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Community Coordinate (GPS Location)</label>
              <span className="text-[10px] font-semibold">
                {commGpsStatus === 'fetching' && <span className="text-zinc-400 animate-pulse">Detecting GPS...</span>}
                {commGpsStatus === 'success' && <span className="text-emerald-400">✓ Coordinates Locked</span>}
                {commGpsStatus === 'failed' && <span className="text-zinc-500">Fixed Fallback</span>}
              </span>
            </div>
            <input 
              type="text" 
              placeholder="e.g. Dolores Park, San Francisco, CA" 
              value={commAddress}
              onChange={(e) => setCommAddress(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            {commLat && commLng && (
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">
                Lat: {commLat.toFixed(4)}, Lng: {commLng.toFixed(4)}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Decoded Vision</label>
            <textarea 
              placeholder="Tell neighbors what this interest loop aims to align..." 
              rows={3}
              value={newCommDesc}
              onChange={(e) => setNewCommDesc(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 resize-none text-[13px]"
            />
          </div>

          <div className="flex items-center justify-between py-1 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-900">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-300">Invite-Only Community</p>
              <p className="text-[10px] text-zinc-500">Pre-verification required to enter</p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setNewCommPrivate(!newCommPrivate);
              }}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none relative",
                newCommPrivate ? "bg-rose-500" : "bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                newCommPrivate ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="flex gap-2.5 mt-2">
            <button 
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="flex-1 text-xs uppercase tracking-wider font-extrabold h-11 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-400 rounded-xl transition-all cursor-pointer border border-zinc-900"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={commHandleStatus !== 'valid' || !newCommName.trim()}
              className="flex-1 text-xs uppercase tracking-wider font-extrabold h-11 bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 active:scale-95 text-white rounded-xl disabled:opacity-40 transition-all cursor-pointer"
            >
              Create Circle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
