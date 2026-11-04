import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { usePushNotifications } from '@/lib/pushNotifications';
import { vqLedger } from '@/domains/d20_vq_ledger';

// Types & Custom Hooks
import { Venue, VibeTrail } from '@/features/explore/types';
import { useExploreRadar } from '@/features/explore/hooks/useExploreRadar';
import { useVenueSearch } from '@/features/explore/hooks/useVenueSearch';
import { useVibeTrails } from '@/features/explore/hooks/useVibeTrails';
import { useCommunityDirectory } from '@/features/share-good-vibes/hooks/useCommunityDirectory';

// Extracted Subcomponents
import { ExploreProximityBanner } from '@/features/explore/components/ExploreProximityBanner';
import { ExploreHeader } from '@/features/explore/components/ExploreHeader';
import { ExploreSecretsBanner } from '@/features/explore/components/ExploreSecretsBanner';
import { ExploreRadarCard } from '@/features/explore/components/ExploreRadarCard';
import { ExploreVenueList } from '@/features/explore/components/ExploreVenueList';
import { ExploreCategoriesGrid } from '@/features/explore/components/ExploreCategoriesGrid';
import { ExploreDiagnosticModal } from '@/features/explore/components/ExploreDiagnosticModal';
import { VenueHeatmap } from '@/features/explore/components/VenueHeatmap';
import { VibeTrailsSection } from '@/features/explore/components/VibeTrailsSection';
import { VibeGuardiansSection } from '@/features/explore/components/VibeGuardians/VibeGuardiansSection';
import { ExploreScreenModals } from '@/features/explore/components/ExploreScreenModals';

interface ExploreScreenProps {
  initialSearch?: string;
  initialCategory?: string;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ 
  initialSearch = '', 
  initialCategory = '' 
}) => {
  const { user, profile, updateProfilePoints } = useAuth();
  const { joinedCommunityIds } = useCommunityDirectory(user, updateProfilePoints);
  const { 
    settings: notifSettings, 
    updateSettings: updateNotifSettings, 
    requestBrowserPermission, 
    permissionStatus 
  } = usePushNotifications();

  // 1. Radar Engine (Overpass, GPS, Caching, Flash events)
  const {
    coords,
    setCoords,
    cityName,
    setCityName,
    venues,
    isLoading,
    overpassError,
    radarCharge,
    queryOverpassAPI,
    handlePingRadar,
    flashEvents,
    setFlashEvents,
    triggerRandomFlashEvent,
  } = useExploreRadar();

  // 2. Search & Categories Engine
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    selectedCategory,
    handleTabSelect,
    handleCategorySelect,
    filteredVenues,
  } = useVenueSearch(venues, initialSearch, initialCategory, coords, queryOverpassAPI);

  // 3. Vibe Trails & Tours
  const { 
    trails, 
    createTrail, 
    toggleSaveTrail 
  } = useVibeTrails(user?.uid, profile?.handle);

  // 4. Modals & Local State
  const [selectedTrail, setSelectedTrail] = useState<VibeTrail | null>(null);
  const [adoptingTrail, setAdoptingTrail] = useState<VibeTrail | null>(null);
  const [createModalIsTour, setCreateModalIsTour] = useState(false);
  const [showCreateTrailModal, setShowCreateTrailModal] = useState(false);
  const [scannedVenues, setScannedVenues] = useState<Record<string, boolean>>({});
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [validatingVenue, setValidatingVenue] = useState<Venue | null>(null);
  const [activeFlashModal, setActiveFlashModal] = useState<any | null>(null);
  const [showFlashListModal, setShowFlashListModal] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [proximityDismissed, setProximityDismissed] = useState<Record<string, boolean>>({});

  // 5. Scroll / Gesture Detection for Sheets
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const getScrollHideStyles = () => {
    return isScrolling ? { opacity: 0, pointerEvents: 'none' as const } : { opacity: 1 };
  };

  // 6. Device Haptics
  const fireHaptic = (style: 'light' | 'medium' | 'heavy') => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        if (style === 'light') navigator.vibrate(10);
        else if (style === 'medium') navigator.vibrate(20);
        else if (style === 'heavy') navigator.vibrate([30, 50, 30]);
      }
    } catch {}
  };

  // 7. Check-in & Point Minting
  const handleVerifyVenue = (venue: Venue) => {
    if (scannedVenues[venue.id]) return;
    setScannedVenues(prev => ({ ...prev, [venue.id]: true }));
    updateProfilePoints(50);
    vqLedger.recordCheckIn('current_user', venue.name, venue.id);
    fireHaptic('heavy');
  };

  const canValidateVenue = (venue: Venue) => {
    if (!venue.lat || !venue.lon || !coords) return false;
    const dLat = (venue.lat - coords.lat) * 111.32;
    const dLon = (venue.lon - coords.lng) * 40075 * Math.cos((coords.lat * Math.PI) / 180) / 360;
    const distMeters = Math.sqrt(dLat * dLat + dLon * dLon) * 1000;
    return distMeters <= 50;
  };

  const handleAdoptTrail = (trail: VibeTrail) => {
    fireHaptic('heavy');
    setAdoptingTrail(trail);
    setCreateModalIsTour(false);
    setShowCreateTrailModal(true);
  };

  const handleHireGuardianFromTrail = (guardian: any, trail: VibeTrail) => {
    fireHaptic('medium');
    window.dispatchEvent(new CustomEvent('vq:hireGuardian', {
      detail: {
        guardian,
        prompt: `Hi! I found your curated trail "${trail.name}" and would love to hire you to guide us through this itinerary.`
      }
    }));
  };

  const handleOpenTrailByRef = (trailTitleOrId: string) => {
    fireHaptic('light');
    const matched = trails.find(t => t.id === trailTitleOrId || t.name.toLowerCase().includes(trailTitleOrId.toLowerCase()));
    if (matched) {
      setSelectedTrail(matched);
    }
  };

  return (
    <div 
      onScroll={handleScroll}
      className="flex-1 bg-[#09080C] text-white p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-24 select-none font-sans overflow-y-auto"
    >
      {/* 1. Proximity Banner */}
      <ExploreProximityBanner
        venues={venues}
        coords={coords}
        scannedVenues={scannedVenues}
        proximityDismissed={proximityDismissed}
        onDismiss={(id) => setProximityDismissed(prev => ({ ...prev, [id]: true }))}
        onValidate={(venue) => {
          fireHaptic('heavy');
          setValidatingVenue(venue);
        }}
        fireHaptic={fireHaptic}
      />

      {/* 2. Header & Live Flash Bar */}
      <ExploreHeader
        coords={coords}
        cityName={cityName}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        selectedCategory={selectedCategory}
        handleTabSelect={handleTabSelect}
        flashEvents={flashEvents}
        radarCharge={radarCharge}
        onOpenFlashList={() => {
          fireHaptic('light');
          setShowFlashListModal(true);
        }}
        onSelectFlash={(flash) => {
          fireHaptic('medium');
          setActiveFlashModal(flash);
        }}
        onTriggerRandomFlash={triggerRandomFlashEvent}
        onSpawnFlash={triggerRandomFlashEvent}
        onSelectAutocomplete={(item) => {
          setCoords({ lat: item.lat, lng: item.lng });
          setCityName(item.name);
          queryOverpassAPI(item.lat, item.lng, selectedCategory || 'Cafés');
        }}
        fireHaptic={fireHaptic}
      />

      {/* 3. Secrets / Highlights Banner */}
      <ExploreSecretsBanner
        flashEvents={flashEvents}
        onOpenFlashList={() => {
          fireHaptic('light');
          setShowFlashListModal(true);
        }}
        onSpawnFlash={triggerRandomFlashEvent}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        fireHaptic={fireHaptic}
      />

      {/* 4. Interactive Live Venue Map */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
        <VenueHeatmap
          venues={filteredVenues}
          userCoords={coords}
          coords={coords}
          selectedVenue={selectedVenue}
          onSelectVenue={setSelectedVenue}
          isLoading={isLoading}
          onRefresh={() => {
            if (coords) queryOverpassAPI(coords.lat, coords.lng, selectedCategory || 'Cafés');
          }}
          flashEvents={flashEvents}
          onSelectFlashEvent={setActiveFlashModal}
          selectedFlashEvent={activeFlashModal}
        />
      </div>

      {/* 5. Vibe Trails & Tours Section */}
      <VibeTrailsSection
        trails={trails}
        userId={user?.uid}
        authorName={profile?.handle}
        currentUserProfile={profile}
        onSelectTrail={setSelectedTrail}
        onToggleSave={toggleSaveTrail}
        onCreateTrail={createTrail}
        onAdoptTrail={handleAdoptTrail}
        onHireGuardian={handleHireGuardianFromTrail}
        onRequestCreateTrail={(isTour) => {
          setCreateModalIsTour(Boolean(isTour));
          setAdoptingTrail(null);
          setShowCreateTrailModal(true);
        }}
        userCoords={coords}
        fireHaptic={fireHaptic}
      />

      {/* 6. Discovery Radar Card */}
      <ExploreRadarCard
        radarCharge={radarCharge}
        onPing={handlePingRadar}
        fireHaptic={fireHaptic}
      />

      {/* 7. Vibe Guardians Directory */}
      <VibeGuardiansSection
        currentUserProfile={profile}
        fireHaptic={fireHaptic}
        onOpenTrail={handleOpenTrailByRef}
      />

      {/* 8. Venue Cards Result Feed */}
      <ExploreVenueList
        venues={filteredVenues}
        isLoading={isLoading}
        overpassError={overpassError}
        profile={profile}
        joinedCommunityIds={joinedCommunityIds}
        scannedVenues={scannedVenues}
        canValidateVenue={canValidateVenue}
        onSelectVenue={setSelectedVenue}
        onValidateClick={setValidatingVenue}
        fireHaptic={fireHaptic}
      />

      {/* 9. Categories Grid & Vibe Suggestions Banner */}
      <ExploreCategoriesGrid
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onOpenSuggestionModal={() => {
          fireHaptic('medium');
          setShowSuggestionModal(true);
        }}
        fireHaptic={fireHaptic}
      />

      {/* 10. Suggestion & Diagnostics Modal */}
      <ExploreDiagnosticModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        coords={coords}
        getScrollHideStyles={getScrollHideStyles}
        modalRef={modalRef}
        fireHaptic={fireHaptic}
      />

      {/* Modals Subsystem */}
      <ExploreScreenModals
        selectedVenue={selectedVenue}
        setSelectedVenue={setSelectedVenue}
        coords={coords}
        scannedVenues={scannedVenues}
        handleVerifyVenue={handleVerifyVenue}
        canValidateVenue={canValidateVenue}
        validatingVenue={validatingVenue}
        setValidatingVenue={setValidatingVenue}
        fireHaptic={fireHaptic}
        profile={profile}
        getScrollHideStyles={getScrollHideStyles}
        modalRef={modalRef}
        setScannedVenues={setScannedVenues}
        activeFlashModal={activeFlashModal}
        setActiveFlashModal={setActiveFlashModal}
        setCoords={setCoords}
        updateProfilePoints={updateProfilePoints}
        setFlashEvents={setFlashEvents}
        showFlashListModal={showFlashListModal}
        setShowFlashListModal={setShowFlashListModal}
        flashEvents={flashEvents}
        isListExpanded={isListExpanded}
        setIsListExpanded={setIsListExpanded}
        permissionStatus={permissionStatus}
        requestBrowserPermission={requestBrowserPermission}
        notifSettings={notifSettings}
        updateNotifSettings={updateNotifSettings}
        selectedTrail={selectedTrail}
        setSelectedTrail={setSelectedTrail}
        userId={user?.uid}
        toggleSaveTrail={toggleSaveTrail}
        handleAdoptTrail={handleAdoptTrail}
        handleHireGuardianFromTrail={handleHireGuardianFromTrail}
        setCityName={setCityName}
        queryOverpassAPI={queryOverpassAPI}
        selectedCategory={selectedCategory}
        showCreateTrailModal={showCreateTrailModal}
        setShowCreateTrailModal={setShowCreateTrailModal}
        setAdoptingTrail={setAdoptingTrail}
        adoptingTrail={adoptingTrail}
        createModalIsTour={createModalIsTour}
        createTrail={createTrail}
      />
    </div>
  );
};

export default ExploreScreen;
