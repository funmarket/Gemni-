import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AUTOCOMPLETE_SUGGESTIONS as autocompleteSuggestions, getTabActiveClass } from '../data/explorePresets';

interface ExploreHeaderProps {
  cityName?: string;
  coords?: { lat: number; lng: number } | null;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeTab?: string;
  selectedCategory?: string | null;
  handleTabSelect?: (tabId: string) => void;
  onLocationClick?: () => void;
  onSpawnFlash?: () => void;
  onOpenFilterDialog?: () => void;
  onSelectAutocomplete?: (s: { name: string; lat: number; lng: number }) => void;
  fireHaptic?: (style: 'light' | 'medium' | 'heavy') => void;
  // Legacy props tolerance so all callers remain compatible
  flashEvents?: any[];
  radarCharge?: number;
  onOpenFlashList?: () => void;
  onSelectFlash?: (flash: any) => void;
  onTriggerRandomFlash?: () => void;
}

const TABS = [
  { id: 'All', label: 'All' },
  { id: 'Food', emoji: '🍽️', label: 'Food' },
  { id: 'cafés', emoji: '☕', label: 'cafés' },
  { id: 'Culture', emoji: '🏛️', label: 'Culture' },
  { id: 'Art', emoji: '🎨', label: 'Art' },
  { id: 'Venues', emoji: '🏬', label: 'Venues' },
  { id: 'Hidden', emoji: '🔮', label: 'Hidden' }
];

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  cityName = 'Tunis, Tunisia',
  coords = null,
  searchQuery = '',
  setSearchQuery = () => {},
  activeTab = 'All',
  selectedCategory = null,
  handleTabSelect = () => {},
  onLocationClick = () => {},
  onSpawnFlash = () => {},
  onOpenFilterDialog = () => {},
  onSelectAutocomplete = () => {},
  fireHaptic = () => {},
  flashEvents = [],
  radarCharge = 100,
  onOpenFlashList = () => {},
  onSelectFlash = () => {},
  onTriggerRandomFlash = () => {},
}) => {
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  return (
    <div className="space-y-4">
      {/* Location and Spawn Flash Row */}
      <div className="flex justify-between items-center w-full">
        <button 
          type="button"
          onClick={onLocationClick}
          className="inline-flex items-center gap-1.5 bg-[#181f33]/40 border border-zinc-805/50 text-zinc-300 rounded-full py-1.5 px-4 hover:bg-[#181f33]/60 active:scale-95 transition-all outline-none cursor-pointer text-xs font-semibold bg-transparent"
        >
          <MapPin className="w-3.5 h-3.5 text-zinc-400 fill-zinc-400/10" />
          <span className="tracking-tight text-zinc-300">
            {cityName}
          </span>
        </button>

        <button
          type="button"
          onClick={onSpawnFlash}
          className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full py-1.5 px-3 hover:bg-red-500/20 active:scale-95 transition-all outline-none cursor-pointer text-[10px] font-black tracking-widest uppercase font-mono"
        >
          ⚡ SPAWN FLASH
        </button>
      </div>

      {/* Hero Title Block */}
      <div className="text-left space-y-2 px-0.5">
        <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
          Explore Local
        </h1>
        <p className="text-[14px] text-zinc-400 leading-relaxed max-w-sm font-semibold text-left">
          Discover amazing local businesses and hidden gems in {cityName}
        </p>
      </div>

      {/* Community / Small Business tags */}
      <div className="flex items-center justify-start gap-2.5 select-none text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#7c2d12]/20 text-orange-200 border border-orange-500/10 rounded-full px-4 py-2 text-[12px] font-bold tracking-wide">
          🗺️ Community First
        </div>
        <div className="inline-flex items-center gap-1.5 bg-zinc-800/40 text-zinc-300 border border-zinc-700/20 rounded-full px-4 py-2 text-[12px] font-bold tracking-wide">
          🏅 Small Business
        </div>
      </div>

      {/* Search Input with Autocomplete */}
      <div className="flex gap-2.5 w-full items-center select-none text-left">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search regional vibes (Google & Mapbox powered)"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 250)}
            className="w-full h-[52px] bg-[#181f32]/40 border border-zinc-850/50 text-white rounded-2xl pl-12 pr-4 text-[14px] leading-normal font-semibold focus:outline-none focus:border-blue-500/40 placeholder-zinc-500 transition-colors"
          />
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />

          {showSearchSuggestions && (searchQuery || '').trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-[#121115] border border-white/10 rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/5 max-h-[220px] overflow-y-auto">
              {autocompleteSuggestions
                .filter(s => {
                  const q = (searchQuery || '').toLowerCase();
                  return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
                })
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => {
                      fireHaptic('medium');
                      setShowSearchSuggestions(false);
                      onSelectAutocomplete(s);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer border-none bg-transparent outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="truncate text-left">
                        <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400 block">
                          {s.address}
                        </span>
                      </div>
                    </div>
                    
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded border shrink-0",
                      s.provider === 'Google'
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/15"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/15"
                    )}>
                      {s.provider}
                    </span>
                  </button>
                ))
              }
              {autocompleteSuggestions.filter(s => {
                const q = (searchQuery || '').toLowerCase();
                return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
              }).length === 0 && (
                <div className="p-4 text-center text-xs font-semibold text-zinc-500 font-mono bg-[#121115]">
                  No matches found on Google / Mapbox Places.
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => {
            fireHaptic('light');
            onOpenFilterDialog();
          }}
          className="w-[52px] h-[52px] shrink-0 bg-[#181f32]/40 border border-zinc-850/50 rounded-2xl flex items-center justify-center hover:bg-[#181f32]/65 hover:border-blue-500/25 active:scale-95 transition-all text-zinc-400 hover:text-white cursor-pointer outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* Horizontal Filter Tabs */}
      <div className="w-full overflow-x-auto select-none" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-2.5 pb-1 max-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  handleTabSelect(tab.id);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-[18px] py-[10px] text-[13px] font-bold rounded-full transition-all active:scale-95 cursor-pointer shrink-0 border font-display",
                  isActive 
                    ? getTabActiveClass(tab.id)
                    : "bg-white border-black/10 text-secondary dark:bg-[#181f32]/30 dark:border-zinc-800/40 dark:text-zinc-300"
                )}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
