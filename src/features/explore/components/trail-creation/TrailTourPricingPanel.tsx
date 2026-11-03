import React from 'react';
import { DollarSign, Shield, Users, Languages, CheckCircle2 } from 'lucide-react';

interface TrailTourPricingPanelProps {
  isUserPro: boolean;
  isLabeledAsTour: boolean;
  setIsLabeledAsTour: (v: boolean) => void;
  tourPrice: number;
  setTourPrice: (v: number) => void;
  tourDuration: string;
  setTourDuration: (v: string) => void;
  meetingPoint: string;
  setMeetingPoint: (v: string) => void;
  whatsIncludedInput: string;
  setWhatsIncludedInput: (v: string) => void;
  languagesInput: string;
  setLanguagesInput: (v: string) => void;
  cancellationPolicy: string;
  setCancellationPolicy: (v: string) => void;
}

export const TrailTourPricingPanel: React.FC<TrailTourPricingPanelProps> = ({
  isUserPro,
  isLabeledAsTour,
  setIsLabeledAsTour,
  tourPrice,
  setTourPrice,
  tourDuration,
  setTourDuration,
  meetingPoint,
  setMeetingPoint,
  whatsIncludedInput,
  setWhatsIncludedInput,
  languagesInput,
  setLanguagesInput,
  cancellationPolicy,
  setCancellationPolicy
}) => {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
            ⭐
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
              Commercial Tour Service (TOUR-001)
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              {isUserPro 
                ? 'Only eligible Pro Guardians may publish guided commercial tours with upfront pricing.'
                : 'Free Trail mode active. Become a verified Pro Guardian to offer paid guided tours.'}
            </p>
          </div>
        </div>

        {isUserPro && (
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Offer Tour</span>
            <input
              type="checkbox"
              checked={isLabeledAsTour}
              onChange={(e) => setIsLabeledAsTour(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </label>
        )}
      </div>

      {isLabeledAsTour && isUserPro && (
        <div className="bg-[#1A181C] border border-white/10 rounded-2xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                Price Per Guest (TND / Local)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={tourPrice}
                  onChange={(e) => setTourPrice(parseFloat(e.target.value) || 0)}
                  placeholder="85"
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
                <DollarSign className="w-4 h-4 text-zinc-500 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                Tour Duration
              </label>
              <input
                type="text"
                value={tourDuration}
                onChange={(e) => setTourDuration(e.target.value)}
                placeholder="e.g. 4 Hours"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Meeting Point Instructions
            </label>
            <input
              type="text"
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="e.g. Complimentary hotel pickup or meet at Bab El Bhar entrance"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              What's Included (comma separated)
            </label>
            <input
              type="text"
              value={whatsIncludedInput}
              onChange={(e) => setWhatsIncludedInput(e.target.value)}
              placeholder="Skip-the-line admissions, Artisan tea, Guided walkthrough"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Languages Spoken
            </label>
            <input
              type="text"
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
              placeholder="Arabic, French, English"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              Cancellation & Direct Seller Policy
            </label>
            <input
              type="text"
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              placeholder="Free cancellation up to 24 hours before tour starts"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
