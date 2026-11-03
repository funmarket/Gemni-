import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVenuePhoto, venueDescriptions } from '../data/homeHelpers';
import { openDeviceMap } from '@/shared/browser/openExternalMap';

interface HomeLocalGemsSectionProps {
  favoritedVenues: Record<string, boolean>;
  toggleFavoriteVenue: (id: string) => void;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  onNavigate?: (tab: string, search?: string) => void;
}

const LOCAL_GEMS = [
  { id: 'v-3', name: 'Sightglass Coffee Courtyard', cat: 'Cafe / Roastery', rating: '★ 4.9' },
  { id: 'v-5', name: 'Clarion Alley Art Block', cat: 'Gallery / Murals', rating: '★ 4.8' },
  { id: 'v-1', name: 'Local Tealicious Garden', cat: 'Tea / Terrace', rating: '★ 4.7' }
];

export const HomeLocalGemsSection: React.FC<HomeLocalGemsSectionProps> = ({
  favoritedVenues,
  toggleFavoriteVenue,
  triggerHaptic,
  onNavigate
}) => {
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);

  return (
    <div className="vibe-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-vibe-primary shrink-0" />
          <h3 className="text-xs font-black text-primary uppercase tracking-wider leading-none font-display">
            Local Gems
          </h3>
        </div>
        <span 
          onClick={() => onNavigate?.('explore')} 
          className="text-vibe-primary hover:underline cursor-pointer text-sm font-mono font-bold"
        >
          →
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LOCAL_GEMS.map((venue) => {
          const venuePhoto = getVenuePhoto(venue.id);
          const isExpanded = expandedVenueId === venue.id;
          const isFavorited = favoritedVenues[venue.id];
          const details = venueDescriptions[venue.id] || { desc: '', vibe: '', hours: '', links: '' };

          return (
            <div 
              key={venue.id} 
              onClick={() => {
                triggerHaptic('light');
                setExpandedVenueId(isExpanded ? null : venue.id);
              }}
              className="vibe-card overflow-hidden text-left flex flex-col group transition-all cursor-pointer hover:brightness-110"
            >
              <div className="w-full h-24 overflow-hidden relative border-b border-outline">
                <img src={venuePhoto} alt={venue.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {isFavorited && (
                  <span className="absolute top-2 right-2 bg-vibe-secondary text-white text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                    <Heart className="w-3.5 h-3.5 fill-white text-white" /> Saved
                  </span>
                )}
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-extrabold text-[11.5px] text-primary uppercase tracking-tight font-display">{venue.name}</h4>
                    <span className="text-[10px] font-mono font-black text-amber-500 shrink-0">{venue.rating}</span>
                  </div>
                  <p className="text-[10px] font-mono text-secondary block tracking-tight uppercase mt-0.5">{venue.cat}</p>
                </div>

                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2.5 border-t border-outline mt-2 text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-[10.5px] text-secondary leading-normal font-medium break-words whitespace-normal text-left">{details.desc}</p>
                    
                    <div className="space-y-1 bg-elevated p-2.5 rounded-lg border border-outline font-mono text-[9.5px]">
                      <div className="flex items-center gap-1.5 text-primary">
                        <span className="text-[11px]">⚡</span>
                        <span>Vibe: <strong className="text-vibe-primary">{details.vibe}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-secondary">
                        <span className="text-[11px]">🕒</span>
                        <span>Open: {details.hours}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                      <button
                        type="button"
                        onClick={() => toggleFavoriteVenue(venue.id)}
                        className="vibe-pill-btn-secondary text-[9px] w-full flex-1 gap-1"
                      >
                        <Heart className={cn("w-3 h-3", isFavorited ? "fill-vibe-secondary text-vibe-secondary" : "")} />
                        {isFavorited ? "Saved" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeviceMap(details.links, venue.name)}
                        className="vibe-pill-btn-primary text-[9px] w-full flex-1 gap-1"
                      >
                        Navigate
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
