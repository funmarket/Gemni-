import React from 'react';
import { ExploreHeatmap } from '@/components/explore/ExploreHeatmap';
import { Venue } from '../types';

interface VenueHeatmapProps {
  venues: Venue[];
  userCoords: { lat: number; lng: number } | null;
  selectedVenue: Venue | null;
  onSelectVenue: (v: Venue | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
  flashEvents: any[];
  onSelectFlashEvent: (fe: any) => void;
  selectedFlashEvent: any | null;
}

export const VenueHeatmap: React.FC<VenueHeatmapProps> = ({
  venues,
  userCoords,
  selectedVenue,
  onSelectVenue,
  isLoading,
  onRefresh,
  flashEvents,
  onSelectFlashEvent,
  selectedFlashEvent,
}) => {
  return (
    <ExploreHeatmap
      venues={venues as any}
      userCoords={userCoords}
      selectedVenue={selectedVenue as any}
      onSelectVenue={onSelectVenue as any}
      isLoading={isLoading}
      onRefresh={onRefresh}
      flashEvents={flashEvents}
      onSelectFlashEvent={onSelectFlashEvent}
      selectedFlashEvent={selectedFlashEvent}
    />
  );
};

export default VenueHeatmap;
