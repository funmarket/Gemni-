import React from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExploreRadarCardProps {
  radarCharge: number;
  onPing: () => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ExploreRadarCard: React.FC<ExploreRadarCardProps> = ({
  radarCharge,
  onPing,
  fireHaptic
}) => {
  return (
    <div className="bg-[#1A181C] rounded-[16px] border border-white/5 p-5 space-y-4 text-left">
      <div className="flex justify-between items-center transition-all">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#3DDC6C]" />
          <span className="font-bold text-[16px] text-white">Discovery Radar</span>
        </div>
        <span className="text-[13px] text-white font-medium">Charge: {radarCharge}%</span>
      </div>

      <div className="w-full h-1 bg-[#3A3A3C] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#3DDC6C] transition-all duration-500 ease-out"
          style={{ width: `${radarCharge}%` }}
        />
      </div>

      <button
        type="button"
        disabled={radarCharge < 100}
        onClick={() => {
          fireHaptic('heavy');
          onPing();
        }}
        className={cn(
          "w-full py-3.5 text-center text-[14px] font-bold rounded-full transition-all active:scale-[0.98] cursor-pointer outline-none border",
          radarCharge < 100 
            ? "bg-[#1A181C] text-zinc-500 border-white/5 cursor-not-allowed opacity-50"
            : "bg-emerald-950/25 text-emerald-300 border-emerald-500/25 hover:bg-emerald-950/40"
        )}
      >
        {radarCharge < 100 ? "Charging Sensors..." : "PING for Discoveries"}
      </button>
    </div>
  );
};
