import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Venue } from '../types';
import { VenueCard } from './VenueCard';

interface ExploreVenueListProps {
  venues: Venue[];
  isLoading: boolean;
  overpassError: any;
  profile: any;
  joinedCommunityIds: string[];
  scannedVenues: Record<string, boolean>;
  canValidateVenue: (v: Venue) => boolean;
  onSelectVenue: (v: Venue) => void;
  onValidateClick: (v: Venue) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const ExploreVenueList: React.FC<ExploreVenueListProps> = ({
  venues,
  isLoading,
  overpassError,
  profile,
  joinedCommunityIds,
  scannedVenues,
  canValidateVenue,
  onSelectVenue,
  onValidateClick,
  fireHaptic
}) => {
  return (
    <div className="space-y-2.5 text-left">
      {isLoading && (
        <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 text-[#3DDC6C] animate-spin" />
          <span className="text-xs text-[#8E8E93]">Searching nearby area for local data...</span>
        </div>
      )}

      {overpassError && (
        <div className="bg-[rgba(255,159,10,0.05)] border border-[rgba(255,159,10,0.2)] rounded-[14px] p-4 text-[#FF9F0A] flex gap-3 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 select-none text-left">
            <span className="font-black uppercase tracking-wider block">Connection Blocked</span>
            <p className="font-semibold leading-relaxed">
              Could not reach discovery service. Check your connection or try another category.
            </p>
          </div>
        </div>
      )}

      {!isLoading && !overpassError && venues.map((v) => (
        <VenueCard
          key={v.id}
          v={v}
          profile={profile}
          joinedCommunityIds={joinedCommunityIds}
          scannedVenues={scannedVenues}
          canValidateVenue={canValidateVenue}
          fireHaptic={fireHaptic}
          onClick={() => onSelectVenue(v)}
          onValidateClick={onValidateClick}
        />
      ))}

      {!isLoading && !overpassError && venues.length === 0 && (
        <div className="bg-[rgba(255,159,10,0.1)] border border-[rgba(255,159,10,0.3)] rounded-[14px] p-4 text-[#FF9F0A] text-center text-xs select-none leading-relaxed">
          No spots found nearby. Try a different category.
        </div>
      )}
    </div>
  );
};
