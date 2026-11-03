import React from 'react';
import { cn } from '@/lib/utils';
import { getDevicePosition } from '@/shared/services/device/geolocation';
import { scrollToCommunities } from '@/shared/browser/scrollToElement';

interface ShareFilterButtonsProps {
  selectedTagFilter: 'love' | 'kindness' | 'help' | null;
  setSelectedTagFilter: (f: 'love' | 'kindness' | 'help' | null) => void;
  nearbyVibesOnly: boolean;
  setNearbyVibesOnly: (v: boolean) => void;
  setCurrentUserLat: (lat: number) => void;
  setCurrentUserLng: (lng: number) => void;
  setShowAllCommunities: (v: boolean) => void;
  setShowCreateCommunity: (v: boolean) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ShareFilterButtons: React.FC<ShareFilterButtonsProps> = ({
  selectedTagFilter,
  setSelectedTagFilter,
  nearbyVibesOnly,
  setNearbyVibesOnly,
  setCurrentUserLat,
  setCurrentUserLng,
  setShowAllCommunities,
  setShowCreateCommunity,
  triggerHaptic
}) => {
  return (
    <div className="space-y-2 pt-5 border-t border-white/5 mt-4 w-full">
      {/* Row 1: Curated Theme Category Filters */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {(['love', 'kindness', 'help'] as const).map((filter) => (
          <button 
            key={filter}
            onClick={() => {
              triggerHaptic('light');
              setSelectedTagFilter(selectedTagFilter === filter ? null : filter);
              setNearbyVibesOnly(false);
            }}
            className={cn(
              "text-center justify-center inline-flex items-center py-2 px-1 text-[8px] min-[375px]:text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider cursor-pointer border rounded-xl transition-all duration-200 whitespace-nowrap",
              selectedTagFilter === filter
                ? filter === 'love' ? "bg-rose-500 border-rose-400 text-white shadow-lg"
                  : filter === 'kindness' ? "bg-amber-500 border-amber-400 text-white shadow-lg"
                  : "bg-emerald-500 border-emerald-400 text-white shadow-lg"
                : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
            )}
          >
            {filter === 'love' && '💖 Pure Heart'}
            {filter === 'kindness' && '🤗 Friendly Spark'}
            {filter === 'help' && '🧘 Shared Moments'}
          </button>
        ))}
      </div>

      {/* Row 2: Fast Proximity & Group Actions Matrix */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {/* Nearby Vibes button */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            const nextVal = !nearbyVibesOnly;
            setNearbyVibesOnly(nextVal);
            setSelectedTagFilter(null);
            if (nextVal) {
              getDevicePosition()
                .then((pos) => {
                  setCurrentUserLat(pos.latitude);
                  setCurrentUserLng(pos.longitude);
                })
                .catch(() => {});
            }
          }}
          className={cn(
            "text-center justify-center inline-flex items-center py-2 px-1 text-[8px] min-[375px]:text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider cursor-pointer border rounded-xl transition-all duration-200 whitespace-nowrap gap-1",
            nearbyVibesOnly
              ? "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20"
              : "bg-white/5 border-white/5 text-zinc-100 hover:bg-white/10"
          )}
        >
          📍 Nearby Vibes
        </button>

        {/* Communities button */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setShowAllCommunities(true);
            getDevicePosition()
              .then((pos) => {
                setCurrentUserLat(pos.latitude);
                setCurrentUserLng(pos.longitude);
              })
              .catch(() => {});
            setTimeout(() => {
              scrollToCommunities();
            }, 150);
          }}
          className="text-center justify-center inline-flex items-center py-2 px-1 text-[8px] min-[375px]:text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider cursor-pointer border rounded-xl transition-all duration-200 whitespace-nowrap bg-white/5 border-white/5 text-zinc-100 hover:bg-white/10 active:scale-95 gap-1"
        >
          👥 Communities
        </button>

        {/* Create Community button */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setShowCreateCommunity(true);
          }}
          className="text-center justify-center inline-flex items-center py-2 px-1 text-[8px] min-[375px]:text-[9px] sm:text-[10.5px] font-bold uppercase tracking-wider cursor-pointer border rounded-xl transition-all duration-200 whitespace-nowrap bg-white/5 border-white/5 text-zinc-100 hover:bg-white/10 active:scale-95 gap-1"
        >
          ➕ Create Community
        </button>
      </div>
    </div>
  );
};
