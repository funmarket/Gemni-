import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSocialGraph } from '@/hooks/useSocialGraph';
import { useVibeCheck } from '@/hooks/useVibeCheck';

// Domain imports (strict architecture compliance)
import { vqLedger } from '@/domains/d20_vq_ledger';
import { activitiesDomain } from '@/domains/d10_activities';
import { eventsDomain } from '@/domains/d11_events';

// Extracted Subcomponents
import { HomeHeader } from '@/features/home/components/HomeHeader';
import { VibeCheckInsScroll } from '@/features/home/components/VibeCheckInsScroll';
import { HomeActiveAlertBanner } from '@/features/home/components/HomeActiveAlertBanner';
import { HomeFeedTabs } from '@/features/home/components/HomeFeedTabs';
import { LiveActivitiesPanel } from '@/features/home/components/LiveActivitiesPanel';
import { LiveEventsPanel } from '@/features/home/components/LiveEventsPanel';
import { DailyStreakQuest } from '@/features/home/components/DailyStreakQuest';
import { HomeCuratedCoordinates } from '@/features/home/components/HomeCuratedCoordinates';
import { HomeLocalGemsSection } from '@/features/home/components/HomeLocalGemsSection';
import { HomeVibeGuideCard } from '@/features/home/components/HomeVibeGuideCard';

// Hooks
import { useHomeFeedback } from '@/features/home/hooks/useHomeFeedback';
import { useHomeCheckInFeed } from '@/features/home/hooks/useHomeCheckInFeed';
import { useHomeStreak } from '@/features/home/hooks/useHomeStreak';
import { useHomePersistence } from '@/features/home/hooks/useHomePersistence';
import { useHomeActivityFeed } from '@/features/home/hooks/useHomeActivityFeed';
import { useHomeFlashEvents } from '@/features/home/hooks/useHomeFlashEvents';
import { useHomeFeedActions } from '@/features/home/hooks/useHomeFeedActions';
import { getAverageRating } from '@/features/home/utils/homeRatings';

interface HomeScreenProps {
  onNavigate?: (tab: string, search?: string, category?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { profile, updateProfilePoints } = useAuth();
  const { latitude, longitude, cityName, setManualLocation } = useGeolocation();
  const { following } = useSocialGraph();
  const { mutualMatches } = useVibeCheck();

  const { toastMessage, showToast, customAlert, setCustomAlert, triggerAlert, triggerHaptic } = useHomeFeedback();
  const { currentVibe, venueCards } = useHomeCheckInFeed({ profile, following, mutualMatches });
  const { streakCount, streakClaimed, handleClaimStreak } = useHomeStreak({ updateProfilePoints, triggerAlert });

  const { 
    favoritedVenues, 
    toggleFavoriteVenue, 
    rsvpedEvents, 
    toggleRsvp, 
    postComments, 
    savePostComments, 
    ratingsAndReviews, 
    saveRatingsAndReviews, 
    claimedCoordinates, 
    claimCoordinate, 
    upcomingActivities, 
    saveUpcomingActivities, 
    activityResonances, 
    boostActivityResonance, 
    customPosts, 
    eventsList, 
    saveEventsList 
  } = useHomePersistence({ triggerHaptic, triggerAlert, updateProfilePoints });

  const { liveActivityFeed, setLiveActivityFeed } = useHomeActivityFeed({ cityName, triggerHaptic });

  const {
    flashEvents,
    setShowFlashListModal,
    setShowCreateFlashModal,
  } = useHomeFlashEvents({
    profile,
    updateProfilePoints,
    latitude,
    longitude,
    triggerHaptic,
    triggerAlert
  });

  const {
    activeWallTab,
    setActiveWallTab,
    likedPosts,
    setLikedPosts,
  } = useHomeFeedActions({
    triggerHaptic,
    showToast
  });

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputTexts, setCommentInputTexts] = useState<Record<string, string>>({});
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [curatedExpanded, setCuratedExpanded] = useState(false);
  const [reviewPanelItemId, setReviewPanelItemId] = useState<string | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [reviewTextInput, setReviewTextInput] = useState<string>('');
  const [profileCompCompleted, setProfileCompCompleted] = useState(profile?.isProfileCompleted || false);

  const handleClaimStreakAuthoritative = () => {
    try {
      vqLedger.recordDailyStreak(profile?.id || 'current_user');
      handleClaimStreak();
    } catch (err: any) {
      triggerAlert('Daily Streak', err.message || 'Already claimed today.');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 font-sans text-left px-1 select-none">
      {/* 1. Location Header */}
      <HomeHeader
        cityName={cityName}
        displayName={profile?.displayName || 'Explorer'}
        onNavigate={onNavigate}
        triggerHaptic={triggerHaptic}
      />

      {/* 2. Check-Ins Carousel */}
      <VibeCheckInsScroll
        currentVibe={currentVibe}
        venueCards={venueCards}
        triggerHaptic={triggerHaptic}
        onNavigate={onNavigate}
      />

      {/* 3. Flash Event Active Banner */}
      <HomeActiveAlertBanner
        flashEvents={flashEvents}
        triggerHaptic={triggerHaptic}
        setShowFlashListModal={setShowFlashListModal}
        setShowCreateFlashModal={setShowCreateFlashModal}
      />

      {/* 4. Feeds: My Network | Local Vibes | For You */}
      <HomeFeedTabs
        activeWallTab={activeWallTab}
        setActiveWallTab={setActiveWallTab}
        customPosts={customPosts}
        likedPosts={likedPosts}
        setLikedPosts={setLikedPosts}
        activeCommentPostId={activeCommentPostId}
        setActiveCommentPostId={setActiveCommentPostId}
        postComments={postComments}
        commentInputTexts={commentInputTexts}
        setCommentInputTexts={setCommentInputTexts}
        savePostComments={savePostComments}
        profile={profile}
        triggerHaptic={triggerHaptic}
        showToast={showToast}
      />

      {/* 5. Live Activities Panel */}
      <LiveActivitiesPanel
        liveActivityFeed={liveActivityFeed}
        upcomingActivities={upcomingActivities}
        saveUpcomingActivities={saveUpcomingActivities}
        profile={profile}
        profileCompCompleted={profileCompCompleted}
        setProfileCompCompleted={setProfileCompCompleted}
        setLiveActivityFeed={setLiveActivityFeed}
        triggerAlert={triggerAlert}
        ratingsAndReviews={ratingsAndReviews}
        saveRatingsAndReviews={saveRatingsAndReviews}
        showToast={showToast}
        expandedActivityId={expandedActivityId}
        setExpandedActivityId={setExpandedActivityId}
        activityResonances={activityResonances}
        boostActivityResonance={boostActivityResonance}
        triggerHaptic={triggerHaptic}
        setModalType={() => {}}
        onNavigate={onNavigate}
      />

      {/* 6. Live Events Panel */}
      <LiveEventsPanel
        eventsList={eventsList}
        saveEventsList={saveEventsList}
        expandedEventId={expandedEventId}
        setExpandedEventId={setExpandedEventId}
        rsvpedEvents={rsvpedEvents}
        toggleRsvp={toggleRsvp}
        getAverageRating={getAverageRating}
        reviewPanelItemId={reviewPanelItemId}
        setReviewPanelItemId={setReviewPanelItemId}
        ratingInput={ratingInput}
        setRatingInput={setRatingInput}
        reviewTextInput={reviewTextInput}
        setReviewTextInput={setReviewTextInput}
        ratingsAndReviews={ratingsAndReviews}
        saveRatingsAndReviews={saveRatingsAndReviews}
        profile={profile}
        triggerHaptic={triggerHaptic}
        setModalType={() => {}}
        showToast={showToast}
        onNavigate={onNavigate}
        getSimulatedProfile={() => ({})}
        saveSimulatedProfile={() => {}}
        triggerAlert={triggerAlert}
      />

      {/* 7. Quest & Trails Consoles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
        <DailyStreakQuest
          streakCount={streakCount}
          streakClaimed={streakClaimed}
          handleClaimStreak={handleClaimStreakAuthoritative}
        />

        <div 
          onClick={() => {
            triggerHaptic('medium');
            onNavigate?.('explore');
          }}
          className="bg-[#121116] border border-zinc-900 hover:border-emerald-500/30 rounded-3xl p-5 space-y-3.5 shadow-xl text-left relative overflow-hidden group select-none flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="space-y-2 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl bg-zinc-900 border border-zinc-800 p-2.5 rounded-2xl flex items-center justify-center">
                  🧭
                </span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">Vibe Trails</h3>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">Multi-Stop Day Trips</p>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono border border-emerald-500/20">
                Explore Hub
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
              Curate and follow day-long circuits, adopt routes from fellow travelers, and launch navigation into Google Maps.
            </p>
          </div>

          <div className="w-full h-11 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 relative z-10 mt-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Discover Local Trails & Radar →
          </div>
        </div>
      </div>

      {/* 8. Heritage Coordinates */}
      <HomeCuratedCoordinates
        curatedExpanded={curatedExpanded}
        setCuratedExpanded={setCuratedExpanded}
        claimedCoordinates={claimedCoordinates}
        claimCoordinate={claimCoordinate}
        triggerHaptic={triggerHaptic}
        onNavigate={onNavigate}
      />

      {/* 9. Local Gems */}
      <HomeLocalGemsSection
        favoritedVenues={favoritedVenues}
        toggleFavoriteVenue={toggleFavoriteVenue}
        triggerHaptic={triggerHaptic}
        onNavigate={onNavigate}
      />

      {/* 10. VIBE Guide */}
      <HomeVibeGuideCard
        onOpenCompass={() => onNavigate?.('explore')}
        triggerHaptic={triggerHaptic}
        triggerAlert={triggerAlert}
        onNavigate={onNavigate}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#16141a] border border-amber-500/30 text-amber-100 px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-bold font-mono tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="w-2.5 h-2.5 bg-[#eab308] rounded-full animate-pulse shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
