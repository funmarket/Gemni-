import React from 'react';
import { MapPin, Search } from 'lucide-react';

interface HomeHeaderProps {
  cityName: string;
  displayName: string;
  onNavigate?: (tab: string) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  cityName,
  displayName,
  onNavigate,
  triggerHaptic
}) => {
  return (
    <div className="flex items-center justify-between pt-1 select-none">
      <div 
        onClick={() => {
          triggerHaptic('light');
          onNavigate?.('explore');
        }}
        className="flex items-center gap-1.5 text-xs text-zinc-300 font-semibold cursor-pointer hover:text-white transition-colors"
      >
        <MapPin className="w-4 h-4 text-[#eab308]" />
        <span>{cityName || 'Choose Area...'}</span>
      </div>

      <div className="flex items-center gap-3.5 text-left">
        <Search 
          onClick={() => {
            triggerHaptic('light');
            onNavigate?.('explore');
          }}
          className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" 
        />
        <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 pl-3 pr-2.5 py-1.5 rounded-full">
          <span className="text-[12px] font-semibold text-zinc-300">{displayName}</span>
          <span className="relative flex h-5 w-5 bg-zinc-950 rounded-full items-center justify-center text-xs select-none">
            🎒
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#eab308] rounded-full border border-black animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
};
