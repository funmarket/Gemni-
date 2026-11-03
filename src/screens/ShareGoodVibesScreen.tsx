import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { triggerHaptic } from '@/shared/services/device/haptics';
import { getDistanceInKm } from '@/shared/utils/distance';

// Challenges & Native hooks
import { useVibeCheck } from '@/native/useVibeCheck';
import { VibeCheckBanner } from '@/native/VibeCheckBanner';
import { VibeShotResponse } from '@/native/VibeShotResponse';
import { useVibeFlashWindow } from '@/native/useVibeFlashWindow';
import { VibeFlashShotResponse } from '@/native/VibeFlashShotResponse';
import { initialVibeEchoes } from '@/features/share-good-vibes/data/vibeData';

// Custom hooks
import { useUserGeoLocation } from '@/features/share-good-vibes/hooks/useUserGeoLocation';
import { useShareCamera } from '@/features/share-good-vibes/hooks/useShareCamera';
import { useCommunityDirectory } from '@/features/share-good-vibes/hooks/useCommunityDirectory';
import { useCommunityCreationFlow } from '@/features/share-good-vibes/hooks/useCommunityCreationFlow';
import { useLiveVibeFeed } from '@/features/share-good-vibes/hooks/useLiveVibeFeed';
import { useVibeChallenges } from '@/features/share-good-vibes/hooks/useVibeChallenges';

// Subcomponents
import { ShareHeroBanner } from '@/features/share-good-vibes/components/ShareHeroBanner';
import { ShareFilterButtons } from '@/features/share-good-vibes/components/ShareFilterButtons';
import { ShareLiveFeed } from '@/features/share-good-vibes/components/ShareLiveFeed';
import { ShareCompassGrid } from '@/features/share-good-vibes/components/ShareCompassGrid';
import { ShareSupportCard } from '@/features/share-good-vibes/components/ShareSupportCard';
import { VibeCirclesPanel } from '@/features/share-good-vibes/components/VibeCirclesPanel';
import { ShareGoodVibesModals } from '@/features/share-good-vibes/components/ShareGoodVibesModals';

export const ShareGoodVibesScreen: React.FC = () => {
  const { user, profile, updateProfilePoints } = useAuth();

  const {
    latitude: currentUserLat,
    longitude: currentUserLng,
    setLatitude: setCurrentUserLat,
    setLongitude: setCurrentUserLng,
  } = useUserGeoLocation();

  const { incomingPending } = useVibeCheck();
  const { activeFlash } = useVibeFlashWindow();
  const {
    activeCheckToRespond,
    setActiveCheckToRespond,
    activeFlashToRespond,
    setActiveFlashToRespond,
    handleRefuseChallenge,
  } = useVibeChallenges();

  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showShareVibeModal, setShowShareVibeModal] = useState(false);
  const [isHandleManuallyEdited, setIsHandleManuallyEdited] = useState(false);
  const [editingVibe, setEditingVibe] = useState<{ id: string; text: string } | null>(null);

  const {
    communities,
    joinedCommunityIds,
    handleJoinToggle,
    showAllCommunities,
    setShowAllCommunities,
    selectedTagFilter,
    setSelectedTagFilter,
    nearbyVibesOnly,
    setNearbyVibesOnly,
    setActiveChatroomCommunity,
  } = useCommunityDirectory(user, updateProfilePoints);

  const {
    newCommName,
    setNewCommName,
    newCommHandle,
    setNewCommHandle,
    newCommEmoji,
    setNewCommEmoji,
    newCommTag,
    setNewCommTag,
    newCommCat,
    setNewCommCat,
    customCategory,
    setCustomCategory,
    newCommDesc,
    setNewCommDesc,
    newCommPrivate,
    setNewCommPrivate,
    commLat,
    commLng,
    commAddress,
    setCommAddress,
    commGpsStatus,
    commHandleStatus,
    handleDeployCommunity,
  } = useCommunityCreationFlow(user, profile, updateProfilePoints, () =>
    setShowCreateCommunity(false)
  );

  const {
    vibeCaptureStep,
    setVibeCaptureStep,
    vibeCaptureTimestamp,
    setVibeCaptureTimestamp,
    vibeCapturedImage,
    setVibeCapturedImage,
    vibeCapturedFrontImage,
    setVibeCapturedFrontImage,
    isVibeVideo,
    setIsVibeVideo,
    vibeCaptureLat,
    setVibeCaptureLat,
    vibeCaptureLng,
    setVibeCaptureLng,
    newVibeLocation,
    setNewVibeLocation,
    isFlashActive,
    gpsStatus,
    setGpsStatus,
    frontPos,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleResetCamera,
    shareModalRef,
  } = useShareCamera();

  const { liveActivities, handlePublishVibe, handleEditVibe, handleDeleteVibe } =
    useLiveVibeFeed(user, profile);

  const [activeRadarTarget, setActiveRadarTarget] = useState<string | null>(null);
  const [joinedVibeIds, setJoinedVibeIds] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [newVibeNote, setNewVibeNote] = useState('');
  const [newVibeTag, setNewVibeTag] = useState('Chill');
  const [selectedVibeEmoji, setSelectedVibeEmoji] = useState('🧘');

  const [activeEchoVibe, setActiveEchoVibe] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);
  const [activeCircleVibe, setActiveCircleVibe] = useState<{
    name: string;
    category: string;
    description: string;
  } | null>(null);
  const [userEchoNote, setUserEchoNote] = useState('');
  const [attachPhotoToEcho, setAttachPhotoToEcho] = useState(false);
  const [echoCapturedImage, setEchoCapturedImage] = useState<string | null>(null);
  const [echoCapturedFrontImage, setEchoCapturedFrontImage] = useState<string | null>(null);
  const [echoCaptureTimestamp, setEchoCaptureTimestamp] = useState<number | null>(null);

  const [activeJoinVibe, setActiveJoinVibe] = useState<{
    id: string;
    text: string;
    user: string;
    vibeTag: string;
    icon?: string;
    backPhoto?: string | null;
  } | null>(null);
  const [userJoinNote, setUserJoinNote] = useState('');
  const [attachPhotoToJoin, setAttachPhotoToJoin] = useState(false);
  const [joinCapturedImage, setJoinCapturedImage] = useState<string | null>(null);
  const [joinCapturedFrontImage, setJoinCapturedFrontImage] = useState<string | null>(null);
  const [joinCaptureTimestamp, setJoinCaptureTimestamp] = useState<number | null>(null);

  const [vibeEchoes, setVibeEchoes] = useState(initialVibeEchoes);

  const getVibeDistance = (vibe: any) => {
    if (!currentUserLat || !currentUserLng || !vibe.latitude || !vibe.longitude) {
      return 0.5;
    }
    return getDistanceInKm(currentUserLat, currentUserLng, vibe.latitude, vibe.longitude);
  };

  const processedActivities = liveActivities.map((vibe) => {
    const dist = getVibeDistance(vibe);
    return {
      ...vibe,
      distanceValue: dist,
      displaySub: `${dist.toFixed(2)}km away`,
    };
  });

  const displayActivities = nearbyVibesOnly
    ? [...processedActivities].sort((a, b) => a.distanceValue - b.distanceValue)
    : processedActivities;

  const handleEchoPublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEchoVibe) return;

    handlePublishVibe(
      userEchoNote.trim() || `Echoed alignment with ${activeEchoVibe.name}!`,
      'Chill',
      activeEchoVibe.name,
      '🧘',
      echoCapturedImage,
      echoCapturedFrontImage,
      echoCaptureTimestamp,
      false,
      currentUserLat,
      currentUserLng,
      () => {
        updateProfilePoints(15);
        setActiveEchoVibe(null);
      }
    );
  };

  const handleConvertCircleToCommunity = (
    vibeName: string,
    categoryName: string,
    prefillDetails: string
  ) => {
    triggerHaptic('heavy');
    setNewCommCat(categoryName);
    setNewCommDesc(prefillDetails);
    setNewCommName(`${vibeName} Community`);
    setNewCommEmoji('👥');
    setNewCommHandle(`${vibeName.toLowerCase().replace(/\s+/g, '_')}_co`);
    setNewCommTag('love');
    setActiveCircleVibe(null);
    setShowCreateCommunity(true);
  };

  const filteredCommunities = selectedTagFilter
    ? communities.filter((c) => c.tag === selectedTagFilter)
    : communities;

  const sortedCommunities = [...filteredCommunities];

  const onJoinVibeStream = (activityId: string) => {
    triggerHaptic('medium');
    const vibe = liveActivities.find((v) => v.id === activityId);
    if (vibe) {
      setActiveJoinVibe(vibe);
      setUserJoinNote('');
      setAttachPhotoToJoin(false);
      setJoinCapturedImage(null);
      setJoinCapturedFrontImage(null);
      setJoinCaptureTimestamp(null);
    }
  };

  const handleJoinVibeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJoinVibe) return;
    setJoinedVibeIds((prev) => [...prev, activeJoinVibe.id]);
    setActiveJoinVibe(null);
  };

  const handleVibePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePublishVibe(
      newVibeNote,
      newVibeTag,
      newVibeLocation || 'Tunis',
      selectedVibeEmoji,
      vibeCapturedImage,
      vibeCapturedFrontImage,
      vibeCaptureTimestamp,
      isVibeVideo,
      vibeCaptureLat,
      vibeCaptureLng,
      () => {
        setShowShareVibeModal(false);
        handleResetCamera();
      }
    );
  };

  return (
    <div className="flex-1 bg-[#09080C] text-white p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-24 select-none font-sans">
      {/* 1. Header Banner */}
      <ShareHeroBanner
        onOpenShareModal={() => {
          triggerHaptic('medium');
          setShowShareVibeModal(true);
        }}
        triggerHaptic={triggerHaptic}
      />

      {/* 2. Filter & Navigation Pills */}
      <ShareFilterButtons
        selectedTagFilter={selectedTagFilter}
        setSelectedTagFilter={setSelectedTagFilter}
        nearbyVibesOnly={nearbyVibesOnly}
        setNearbyVibesOnly={setNearbyVibesOnly}
        currentUserLat={currentUserLat}
        currentUserLng={currentUserLng}
        setCurrentUserLat={setCurrentUserLat}
        setCurrentUserLng={setCurrentUserLng}
        setShowAllCommunities={setShowAllCommunities}
        setShowCreateCommunity={setShowCreateCommunity}
        triggerHaptic={triggerHaptic}
      />

      {/* 3. Live Spontaneous Feed */}
      <ShareLiveFeed
        activities={displayActivities}
        joinedVibeIds={joinedVibeIds}
        activeRadarTarget={activeRadarTarget}
        vibeEchoes={vibeEchoes}
        onEditVibe={(v) => setEditingVibe(v)}
        onDeleteVibe={(id) => handleDeleteVibe(id)}
        onOpenCircle={(v) => setActiveCircleVibe(v)}
        onJoinVibe={(id) => onJoinVibeStream(id)}
        triggerHaptic={triggerHaptic}
      />

      {/* 4. Compass Grid */}
      <ShareCompassGrid
        onOpenEcho={(vibe) => {
          setActiveEchoVibe(vibe);
          setUserEchoNote('');
          setAttachPhotoToEcho(false);
          setEchoCapturedImage(null);
        }}
        onOpenCircle={(vibe) => setActiveCircleVibe(vibe)}
        triggerHaptic={triggerHaptic}
      />

      {/* 5. Vibe Circles Panel */}
      <VibeCirclesPanel
        showAllCommunities={showAllCommunities}
        setShowAllCommunities={setShowAllCommunities}
        sortedCommunities={sortedCommunities}
        joinedCommunityIds={joinedCommunityIds}
        handleJoinToggle={handleJoinToggle}
        setActiveChatroomCommunity={setActiveChatroomCommunity}
        setShowCreateCommunity={setShowCreateCommunity}
        currentUserLat={currentUserLat}
        currentUserLng={currentUserLng}
        getDistanceInKm={getDistanceInKm}
        triggerHaptic={triggerHaptic}
        filteredCommunities={filteredCommunities}
      />

      {/* 6. Support Card */}
      <ShareSupportCard
        onBackNode={() => setShowDonationModal(true)}
        triggerHaptic={triggerHaptic}
      />

      {/* Consolidated Modal Subsystem */}
      <ShareGoodVibesModals
        showShareVibeModal={showShareVibeModal}
        setShowShareVibeModal={setShowShareVibeModal}
        vibeCaptureStep={vibeCaptureStep}
        setVibeCaptureStep={setVibeCaptureStep}
        vibeCaptureTimestamp={vibeCaptureTimestamp}
        setVibeCaptureTimestamp={setVibeCaptureTimestamp}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        vibeCapturedImage={vibeCapturedImage}
        setVibeCapturedImage={setVibeCapturedImage}
        vibeCapturedFrontImage={vibeCapturedFrontImage}
        setVibeCapturedFrontImage={setVibeCapturedFrontImage}
        isVibeVideo={isVibeVideo}
        setIsVibeVideo={setIsVibeVideo}
        vibeCaptureLat={vibeCaptureLat}
        setVibeCaptureLat={setVibeCaptureLat}
        vibeCaptureLng={vibeCaptureLng}
        setVibeCaptureLng={setVibeCaptureLng}
        newVibeLocation={newVibeLocation}
        setNewVibeLocation={setNewVibeLocation}
        isFlashActive={isFlashActive}
        gpsStatus={gpsStatus}
        setGpsStatus={setGpsStatus}
        frontPos={frontPos}
        handlePointerDown={handlePointerDown}
        handlePointerMove={handlePointerMove}
        handlePointerUp={handlePointerUp}
        handleVibePublishSubmit={handleVibePublishSubmit}
        handleResetCamera={handleResetCamera}
        newVibeNote={newVibeNote}
        setNewVibeNote={setNewVibeNote}
        newVibeTag={newVibeTag}
        setNewVibeTag={setNewVibeTag}
        selectedVibeEmoji={selectedVibeEmoji}
        setSelectedVibeEmoji={setSelectedVibeEmoji}
        shareModalRef={shareModalRef}
        activeEchoVibe={activeEchoVibe}
        setActiveEchoVibe={setActiveEchoVibe}
        userEchoNote={userEchoNote}
        setUserEchoNote={setUserEchoNote}
        attachPhotoToEcho={attachPhotoToEcho}
        setAttachPhotoToEcho={setAttachPhotoToEcho}
        echoCapturedImage={echoCapturedImage}
        setEchoCapturedImage={setEchoCapturedImage}
        echoCapturedFrontImage={echoCapturedFrontImage}
        setEchoCapturedFrontImage={setEchoCapturedFrontImage}
        echoCaptureTimestamp={echoCaptureTimestamp}
        setEchoCaptureTimestamp={setEchoCaptureTimestamp}
        handleEchoPublishSubmit={handleEchoPublishSubmit}
        activeJoinVibe={activeJoinVibe}
        setActiveJoinVibe={setActiveJoinVibe}
        userJoinNote={userJoinNote}
        setUserJoinNote={setUserJoinNote}
        attachPhotoToJoin={attachPhotoToJoin}
        setAttachPhotoToJoin={setAttachPhotoToJoin}
        joinCapturedImage={joinCapturedImage}
        setJoinCapturedImage={setJoinCapturedImage}
        joinCapturedFrontImage={joinCapturedFrontImage}
        setJoinCapturedFrontImage={setJoinCapturedFrontImage}
        joinCaptureTimestamp={joinCaptureTimestamp}
        setJoinCaptureTimestamp={setJoinCaptureTimestamp}
        handleJoinVibeSubmit={handleJoinVibeSubmit}
        activeCircleVibe={activeCircleVibe}
        setActiveCircleVibe={setActiveCircleVibe}
        vibeEchoes={vibeEchoes}
        setVibeEchoes={setVibeEchoes}
        handleConvertCircleToCommunity={handleConvertCircleToCommunity}
        showCreateCommunity={showCreateCommunity}
        setShowCreateCommunity={setShowCreateCommunity}
        newCommName={newCommName}
        setNewCommName={setNewCommName}
        isHandleManuallyEdited={isHandleManuallyEdited}
        setIsHandleManuallyEdited={setIsHandleManuallyEdited}
        newCommHandle={newCommHandle}
        setNewCommHandle={setNewCommHandle}
        commHandleStatus={commHandleStatus}
        newCommEmoji={newCommEmoji}
        setNewCommEmoji={setNewCommEmoji}
        newCommTag={newCommTag}
        setNewCommTag={setNewCommTag}
        newCommCat={newCommCat}
        setNewCommCat={setNewCommCat}
        customCategory={customCategory}
        setCustomCategory={setCustomCategory}
        commGpsStatus={commGpsStatus}
        commAddress={commAddress}
        setCommAddress={setCommAddress}
        commLat={commLat}
        commLng={commLng}
        newCommDesc={newCommDesc}
        setNewCommDesc={setNewCommDesc}
        newCommPrivate={newCommPrivate}
        setNewCommPrivate={setNewCommPrivate}
        handleDeployCommunity={handleDeployCommunity}
        showDonationModal={showDonationModal}
        setShowDonationModal={setShowDonationModal}
        updateProfilePoints={updateProfilePoints}
        editingVibe={editingVibe}
        setEditingVibe={setEditingVibe}
        handleEditVibe={handleEditVibe}
        triggerHaptic={triggerHaptic}
      />
    </div>
  );
};

export default ShareGoodVibesScreen;
