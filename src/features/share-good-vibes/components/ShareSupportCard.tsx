import React from 'react';
import { HeartHandshake } from 'lucide-react';

interface ShareSupportCardProps {
  onBackNode: () => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ShareSupportCard: React.FC<ShareSupportCardProps> = ({
  onBackNode,
  triggerHaptic
}) => {
  return (
    <div className="bg-[#042014]/40 border border-emerald-500/20 rounded-3xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 w-full">
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-montserrat text-[14px] font-extrabold tracking-widest uppercase text-emerald-400/95 flex items-center gap-1">
            <HeartHandshake className="w-4 h-4 text-emerald-400" /> Support the Pulse
          </h4>
          <p className="text-[17px] text-emerald-100/90 leading-tight">
            Sponsor small Pulse servers and keep local discovery open & non-monetized.
          </p>
        </div>
        <div className="flex self-end sm:self-center shrink-0">
          <button 
            onClick={() => {
              triggerHaptic('medium');
              onBackNode();
            }}
            className="bg-zinc-900 hover:bg-zinc-855 border border-emerald-500/30 text-emerald-300 font-montserrat px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
          >
            Back this node
          </button>
        </div>
      </div>
    </div>
  );
};
