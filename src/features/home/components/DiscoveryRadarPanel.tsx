import React, { useState } from 'react';
import { Radio, Star, MapPin, Compass, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/lib/auth';
import { PlaceDetailModal } from './PlaceDetailModal';

interface DiscoveryRadarPanelProps {
  isLoading: boolean;
  useRadarPing: () => void;
  discoveryRadar: any[];
  onNavigate?: (tab: string, search?: string, category?: string) => void;
}

export const DiscoveryRadarPanel: React.FC<DiscoveryRadarPanelProps> = ({
  isLoading,
  useRadarPing,
  discoveryRadar,
  onNavigate
}) => {
  const { profile, updateProfilePoints } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);

  const getRarityColor = (rarity: 'hidden' | 'trending' | 'legendary') => {
    switch (rarity) {
      case 'legendary': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'trending': return 'text-orange-400 border-orange-500/20 bg-orange-500/5';
      case 'hidden':
      default: return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    }
  };

  return (
    <div 
      className="bg-[#0b0c10] border-2 border-gray-800 p-5 rounded-[2rem] space-y-4 text-left select-none relative"
      style={{ boxShadow: 'none' }}
    >
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#3DDC6C]/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-[#3DDC6C] animate-pulse" />
          </div>
          <h3 className="text-base font-black text-white tracking-wide">Discovery Radar</h3>
        </div>
        <span className="bg-[#3DDC6C] px-3 py-1 rounded-full text-black font-extrabold text-[10px] tracking-wider uppercase">
          10 KM GPS SCAN
        </span>
      </div>

      {/* DETAILED HELPER TEXT */}
      <p className="text-[11px] text-zinc-400 leading-normal font-medium">
        Scan the nearby electromagnetic waves for cultural hotspots. The radar utilizes live Google places & GPS coordinates to pinpoint high-resonance locations.
      </p>

      {/* ACTION ROW */}
      <div className="pt-1">
        <button
          type="button"
          onClick={useRadarPing}
          disabled={isLoading}
          className="w-full bg-[#ffcb2b] hover:bg-[#ebd726] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-black border-none rounded-2xl h-11 flex items-center justify-center text-[12px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning surrounding airspace...
            </span>
          ) : (
            '🔍 PING DISCOVERY RADAR'
          )}
        </button>
      </div>

      {/* DISCOVERED PLACES LIST */}
      <div className="pt-2">
        {discoveryRadar.length === 0 ? (
          <div className="border border-zinc-800/60 rounded-2xl p-6 text-center space-y-2 bg-[#12131a]/40">
            <Compass className="w-7 h-7 text-zinc-600 mx-auto animate-pulse" />
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">📡 Radar Standby</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
              Sonar is calibrated to find the <span className="text-[#3DDC6C] font-black">most checked-in places</span> around your current GPS coordinates. Hit PING to discover!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black text-zinc-500 uppercase tracking-wider px-1">
              <span>Discovered Places (Sorted by Most Reviewed)</span>
              <span className="text-[#3DDC6C]">10 KM RADIUS</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
              {discoveryRadar.map((place) => {
                const badgeColorClass = getRarityColor(place.rarity);
                
                return (
                  <div 
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="p-3.5 bg-[#12131a] border border-zinc-850 hover:border-[#3DDC6C]/40 rounded-2xl flex items-start justify-between cursor-pointer transition-all active:scale-[0.99] group text-left"
                  >
                    <div className="space-y-1 pr-2 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{place.emoji}</span>
                        <h4 className="font-extrabold text-[13px] text-white leading-tight tracking-tight group-hover:text-[#3DDC6C] transition-colors line-clamp-1">
                          {place.name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[9.5px] font-bold text-zinc-500">
                        <span className="flex items-center text-amber-400 gap-0.5">
                          ★ {place.rating}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[9px] text-zinc-450 uppercase">
                          {(place.userRatingCount || 0).toLocaleString()} reviews
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 line-clamp-1 font-medium">
                        {place.address}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between h-full space-y-2 shrink-0">
                      <span className="text-[9.5px] font-mono text-zinc-400 font-bold">
                        {place.distance}
                      </span>
                      
                      <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border ${badgeColorClass} uppercase tracking-widest leading-none`}>
                        {place.rarity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Place Detail & Review Modal Overlay */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal 
            place={selectedPlace}
            profile={profile}
            updateProfilePoints={updateProfilePoints}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
