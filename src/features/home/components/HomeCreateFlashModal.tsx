import React from 'react';
import { motion } from 'motion/react';
import { X, Zap, Sparkles, MapPin, Shield, MessageSquare, Image, Trash2, Clock, Compass, Ticket, Car, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeCreateFlashModalProps {
  showCreateFlashModal: boolean;
  setShowCreateFlashModal: (val: boolean) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  handleCreateFlashEvent: (e: React.FormEvent) => void;
  createTitle: string;
  setCreateTitle: (val: string) => void;
  createDesc: string;
  setCreateDesc: (val: string) => void;
  createRules: string;
  setCreateRules: (val: string) => void;
  createComment: string;
  setCreateComment: (val: string) => void;
  createPhotos: string[];
  setCreatePhotos: React.Dispatch<React.SetStateAction<string[]>>;
  createDuration: number;
  setCreateDuration: (val: number) => void;
  createLocationOffset: string;
  setCreateLocationOffset: (val: string) => void;
  createEntryType: 'free' | 'paid';
  setCreateEntryType: (val: 'free' | 'paid') => void;
  createPrice: string;
  setCreatePrice: (val: string) => void;
  createParking: boolean;
  setCreateParking: (val: boolean) => void;
  createTransport: boolean;
  setCreateTransport: (val: boolean) => void;
  createReward: number;
  setCreateReward: (val: number) => void;
}

export const HomeCreateFlashModal: React.FC<HomeCreateFlashModalProps> = ({
  showCreateFlashModal,
  setShowCreateFlashModal,
  triggerHaptic,
  handleCreateFlashEvent,
  createTitle,
  setCreateTitle,
  createDesc,
  setCreateDesc,
  createRules,
  setCreateRules,
  createComment,
  setCreateComment,
  createPhotos,
  setCreatePhotos,
  createDuration,
  setCreateDuration,
  createLocationOffset,
  setCreateLocationOffset,
  createEntryType,
  setCreateEntryType,
  createPrice,
  setCreatePrice,
  createParking,
  setCreateParking,
  createTransport,
  setCreateTransport,
  createReward,
  setCreateReward,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[5px] p-4 overflow-y-auto">
      {/* Backdrop Dismiss */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={() => {
          triggerHaptic('light');
          setShowCreateFlashModal(false);
        }} 
      />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="bg-[#0f1320] border border-red-500/15 rounded-[28px] p-6 max-w-md w-full relative shadow-[0_12px_40px_rgba(0,0,0,0.6)] select-none text-left max-h-[90vh] overflow-y-auto custom-scrollbar space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ff4e5e] shrink-0 animate-pulse" />
            <h3 className="font-extrabold text-xl text-white tracking-tight">
              Create Secret Flash
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowCreateFlashModal(false);
            }}
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent border-none outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateFlashEvent} className="space-y-4 text-left">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Secret Poker Game, Warehouse After Hours"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all placeholder:text-zinc-600 font-sans"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Secret Venue / Description
            </label>
            <textarea
              required
              rows={2}
              placeholder="Provide description. What is happening and where is the general zone?"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all placeholder:text-zinc-600 font-sans resize-none text-left"
            />
          </div>

          {/* Rules */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Taboo Rules (Secret Protocol)
            </label>
            <input
              type="text"
              placeholder="e.g. Password is 'Antigravity', BYOB, No photos allowed"
              value={createRules}
              onChange={(e) => setCreateRules(e.target.value)}
              className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all placeholder:text-zinc-600 font-sans"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Vibe Comment / Tips
            </label>
            <input
              type="text"
              placeholder="e.g. Dress code: casual black. Password is required at the backdoor."
              value={createComment}
              onChange={(e) => setCreateComment(e.target.value)}
              className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all placeholder:text-zinc-600 font-sans"
            />
          </div>

          {/* Photo Upload Area */}
          <div className="space-y-2">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Secret Spot Photos (Up to 4)
            </label>
            
            {/* Image Grid Previews */}
            {createPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2 animate-in fade-in duration-200">
                {createPhotos.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-[#161b2b] group">
                    <img src={src} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setCreatePhotos(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-black text-red-400 hover:text-red-300 transition-all cursor-pointer border-none outline-none"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {createPhotos.length < 4 && (
              <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-[#ff4e5e]/40 rounded-xl py-4 px-3 cursor-pointer bg-[#161b2b]/50 hover:bg-[#161b2b] transition-all group">
                <Image className="w-5 h-5 text-zinc-500 group-hover:text-[#ff5f6e] transition-colors mb-1" />
                <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 font-medium text-center">
                  Upload Photo ({createPhotos.length}/4)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const remainingSlots = 4 - createPhotos.length;
                    const filesToProcess = files.slice(0, remainingSlots);
                    
                    filesToProcess.forEach(file => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setCreatePhotos(prev => [...prev, reader.result as string].slice(0, 4));
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                    triggerHaptic('light');
                  }}
                />
              </label>
            )}
          </div>

          {/* Duration & Location Offset Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/40 pt-3">
            {/* Duration Selector */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Board Duration
              </label>
              <select
                value={createDuration}
                onChange={(e) => setCreateDuration(Number(e.target.value))}
                className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-3 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all cursor-pointer font-sans"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={120}>2 Hours</option>
                <option value={240}>4 Hours</option>
                <option value={480}>8 Hours</option>
                <option value={1440}>24 Hours</option>
              </select>
            </div>

            {/* Geolocation Offset Option */}
            <div className="space-y-1.5">
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Target Proximity
              </label>
              <select
                value={createLocationOffset}
                onChange={(e) => setCreateLocationOffset(e.target.value)}
                className="w-full bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-3 py-3 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all cursor-pointer font-sans"
              >
                <option value="current">Current Location (0m)</option>
                <option value="200m_north">~200m North (Nearby Spot)</option>
                <option value="500m_east">~500m East (Local Park)</option>
                <option value="1km_west">~1km West (Downtown Area)</option>
                <option value="2km_south">~2km South (District Hub)</option>
                <option value="5km_north">~5km North (Scenic Viewpoint)</option>
                <option value="10km_east">~10km East (Secret Hideout)</option>
              </select>
            </div>
          </div>

          {/* Entry Pricing */}
          <div className="space-y-2 border-t border-zinc-800/40 pt-3">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Entry Fee Info
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCreateEntryType('free');
                }}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer",
                  createEntryType === 'free'
                    ? "bg-[#ff4e5e]/15 border-[#ff4e5e]/40 text-[#ff5f6e]"
                    : "bg-[#161b2b] border-zinc-800 text-zinc-400 hover:text-white"
                )}
              >
                Free Entry
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setCreateEntryType('paid');
                }}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer",
                  createEntryType === 'paid'
                    ? "bg-[#ff4e5e]/15 border-[#ff4e5e]/40 text-[#ff5f6e]"
                    : "bg-[#161b2b] border-zinc-800 text-zinc-400 hover:text-white"
                )}
              >
                Paid Entry
              </button>
            </div>
            {createEntryType === 'paid' && (
              <div className="flex items-center gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                <span className="text-zinc-500 text-xs font-semibold">$</span>
                <input
                  type="text"
                  required
                  placeholder="Price (e.g. 10)"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-32 bg-[#161b2b] border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs focus:border-[#ff4e5e]/60 focus:outline-none transition-all placeholder:text-zinc-600 font-sans"
                />
                <span className="text-zinc-500 text-[10px]">USD Entry Fee</span>
              </div>
            )}
          </div>

          {/* Amenities / Perks */}
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800/40 pt-3">
            <div className="space-y-1.5">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Parking Status
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setCreateParking(true); }}
                  className={cn(
                    "py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer outline-none border",
                    createParking 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-[#161b2b] border-zinc-800 text-zinc-500"
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setCreateParking(false); }}
                  className={cn(
                    "py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer outline-none border",
                    !createParking 
                      ? "bg-zinc-800/40 border-zinc-800 text-zinc-400" 
                      : "bg-[#161b2b] border-zinc-800 text-zinc-500"
                  )}
                >
                  No
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#ff4e5e]/80" /> Transit Close?
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setCreateTransport(true); }}
                  className={cn(
                    "py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer outline-none border",
                    createTransport 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                      : "bg-[#161b2b] border-zinc-800 text-zinc-500"
                  )}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setCreateTransport(false); }}
                  className={cn(
                    "py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer outline-none border",
                    !createTransport 
                      ? "bg-zinc-800/40 border-zinc-800 text-zinc-400" 
                      : "bg-[#161b2b] border-zinc-800 text-zinc-500"
                  )}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Quest Bounty Reward Select */}
          <div className="space-y-1.5 border-t border-zinc-800/40 pt-3">
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Reward Bounty VIBE points
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 500].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setCreateReward(pts);
                  }}
                  className={cn(
                    "py-2 rounded-xl text-xs font-extrabold transition-all border outline-none cursor-pointer",
                    createReward === pts
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                      : "bg-[#161b2b] border-zinc-800 text-zinc-500"
                  )}
                >
                  {pts} VIBE
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ff4e3a] to-[#ff7324] hover:brightness-110 text-white font-extrabold text-xs py-3.5 rounded-[18px] transition-all shadow-md active:scale-95 cursor-pointer outline-none border-none flex items-center justify-center gap-1.5"
            >
              Deploy Flash Alert! ⚡
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
export default HomeCreateFlashModal;
