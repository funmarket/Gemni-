import { useState, useEffect } from 'react';
import { safeLocalStorage } from '../../../shared/services/storage/safeLocalStorage';
import { INITIAL_UPCOMING_ACTIVITIES } from '../data/homeHelpers';
import { useHomeStorage } from '../services/homeStorage';
import { socialContentDomain } from '@/domains/d12_social_content';

const INITIAL_EVENTS_LIST = [
  { id: 'ev-5', name: 'Live Rooftop Oud Trio Session', loc: 'Medina Terrace, Tunis', tag: 'music', date: 'Live Now', type: 'live', addedBy: 'Dar El Medina' },
  { id: 'ev-2', name: 'Ambient Synth Audio Lab', loc: 'Oakland, CA', tag: 'music', date: '11/14/2026', type: 'upcoming', addedBy: 'Business Audio Lab' },
  { id: 'ev-4', name: 'Dolores Sunset Acoustic Jam', loc: 'Dolores Park, SF', tag: 'music', date: '11/06/2026', type: 'upcoming', addedBy: 'Sunset Collective' },
  { id: 'ev-1', name: 'Haight Swap Meet Assembly', loc: 'Golden Gate, SF', tag: 'art', date: '11/04/2026', type: 'upcoming', addedBy: 'Vinyl Assembly' }
];

export const useHomePersistence = ({ triggerHaptic, triggerAlert, updateProfilePoints }: any) => {
  const {
    getClaimedDiscoveries,
    saveClaimedDiscoveries,
    getVibeStepCompleted,
    saveVibeStepCompleted,
    getEventsList,
    saveEventsList: storageSaveEventsList,
    getCustomPosts,
    saveCustomPosts: storageSaveCustomPosts
  } = useHomeStorage();

  const [favoritedVenues, setFavoritedVenues] = useState<Record<string, boolean>>(() => 
    safeLocalStorage.getItem('vq_favorited_venues', {})
  );

  const [rsvpedEvents, setRsvpedEvents] = useState<Record<string, boolean>>(() => 
    safeLocalStorage.getItem('vq_rsvped_events', {})
  );

  const [postComments, setPostComments] = useState<Record<string, any[]>>(() => 
    safeLocalStorage.getItem('vq_post_comments', {})
  );

  const [ratingsAndReviews, setRatingsAndReviews] = useState<Record<string, any>>(() => 
    safeLocalStorage.getItem('vq_ratings_and_reviews', {})
  );

  const [claimedCoordinates, setClaimedCoordinates] = useState<Record<string, boolean>>(() => 
    safeLocalStorage.getItem('vq_claimed_coordinates', {})
  );

  const [upcomingActivities, setUpcomingActivities] = useState<any[]>(() => {
    return safeLocalStorage.getItem('vq_upcoming_activities', INITIAL_UPCOMING_ACTIVITIES);
  });

  const [activityResonances, setActivityResonances] = useState<Record<string, number>>({});

  // New persistent states migrated from HomeScreen
  const [claimedDiscoveries, setClaimedDiscoveries] = useState<Record<string, boolean>>(() => 
    getClaimedDiscoveries()
  );

  const [vibeStepCompleted, setVibeStepCompleted] = useState<boolean>(() => 
    getVibeStepCompleted()
  );

  const [customPosts, setCustomPosts] = useState<any[]>(() => 
    getCustomPosts()
  );

  // Load and sync Firestore social_posts with local custom posts
  useEffect(() => {
    let active = true;

    const syncPosts = async () => {
      try {
        const cloudPosts = socialContentDomain.getPosts();
        if (!active) return;

        const mappedCloud = (cloudPosts || []).map((post: any) => {
          let timeStr = 'Just now';
          if (post.timestamp) {
            const elapsed = Date.now() - post.timestamp;
            if (elapsed < 60000) {
              timeStr = 'Just now';
            } else if (elapsed < 3600000) {
              const mins = Math.floor(elapsed / 60000);
              timeStr = `${mins}m ago`;
            } else if (elapsed < 86400000) {
              const hrs = Math.floor(elapsed / 3600000);
              timeStr = `${hrs}h ago`;
            } else {
              timeStr = new Date(post.timestamp).toLocaleDateString();
            }
          }

          let zoneVal = 'COZY';
          const textLower = (post.feeling || '').toLowerCase();
          const venueLower = (post.venueName || '').toLowerCase();
          if (textLower.includes('chill') || textLower.includes('mellow')) zoneVal = 'CHILLED';
          else if (textLower.includes('creative') || textLower.includes('art')) zoneVal = 'CREATIVE';
          else if (textLower.includes('energy') || textLower.includes('beat') || textLower.includes('rave')) zoneVal = 'AMBER';
          else if (textLower.includes('play') || textLower.includes('fun')) zoneVal = 'WARM';

          return {
            id: post.id || `social-${post.timestamp || Date.now()}`,
            author: post.username ? (post.username.startsWith('@') ? post.username : `@${post.username}`) : '@anonymous',
            avatar: post.avatar || post.emoji || '✨',
            avatarUrl: null,
            text: post.feeling || '',
            votes: post.votes || 1,
            time: timeStr,
            image: post.imageUri || null,
            zone: zoneVal,
            timestamp: post.timestamp || Date.now()
          };
        });

        const localPosts = getCustomPosts();
        const seenIds = new Set();
        const merged: any[] = [];

        for (const p of localPosts) {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            merged.push(p);
          }
        }

        for (const p of mappedCloud) {
          if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            merged.push(p);
          }
        }

        merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setCustomPosts(merged);
      } catch (err) {
        console.warn('Failed to merge Firestore social_posts into HomeFeed:', err);
      }
    };

    syncPosts();
    const interval = setInterval(syncPosts, 6000); // Polling every 6s

    const handleNewPost = () => {
      if (active) syncPosts();
    };
    window.addEventListener('vq-post-created', handleNewPost);
    window.addEventListener('storage', handleNewPost);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('vq-post-created', handleNewPost);
      window.removeEventListener('storage', handleNewPost);
    };
  }, []);

  const [eventsList, setEventsList] = useState<any[]>(() => 
    getEventsList(INITIAL_EVENTS_LIST)
  );

  const saveUpcomingActivities = (activities: any[]) => {
    setUpcomingActivities(activities);
    safeLocalStorage.setItem('vq_upcoming_activities', activities);
  };

  const toggleFavoriteVenue = (venueId: string) => {
    if (triggerHaptic) triggerHaptic('medium');
    const isNowFavorited = !favoritedVenues[venueId];
    const updated = { ...favoritedVenues, [venueId]: isNowFavorited };
    setFavoritedVenues(updated);
    safeLocalStorage.setItem('vq_favorited_venues', updated);
  };

  const toggleRsvp = (eventId: string, forceStatus?: boolean) => {
    if (triggerHaptic) triggerHaptic('medium');
    const isNowRsvped = forceStatus !== undefined ? forceStatus : !rsvpedEvents[eventId];
    const updated = { ...rsvpedEvents, [eventId]: isNowRsvped };
    setRsvpedEvents(updated);
    safeLocalStorage.setItem('vq_rsvped_events', updated);
  };

  const savePostComments = (updated: Record<string, any[]>) => {
    setPostComments(updated);
    safeLocalStorage.setItem('vq_post_comments', updated);
  };

  const saveRatingsAndReviews = (updated: any) => {
    setRatingsAndReviews(updated);
    safeLocalStorage.setItem('vq_ratings_and_reviews', updated);
  };

  const boostActivityResonance = (activityId: string) => {
    if (triggerHaptic) triggerHaptic('heavy');
    setActivityResonances(prev => ({
       ...prev,
       [activityId]: (prev[activityId] || 0) + 1
    }));
  };

  const claimCoordinate = (id: string, points: number) => {
    if (claimedCoordinates[id]) {
      if (triggerAlert) triggerAlert("Already Logged", "You have already collected VQ Points for this coordinate.", "info");
      return;
    }
    if (triggerHaptic) triggerHaptic('heavy');
    const updated = { ...claimedCoordinates, [id]: true };
    setClaimedCoordinates(updated);
    safeLocalStorage.setItem('vq_claimed_coordinates', updated);
    
    if (updateProfilePoints) updateProfilePoints(points);
    if (triggerAlert) triggerAlert("📍 Coordinates Verified", `You secured ${points} VQ Points for discovering this location.`);
  };

  const claimDiscovery = (id: string, points: number) => {
    if (claimedDiscoveries[id]) {
      if (triggerAlert) triggerAlert("Already Logged", "You have already collected VQ points for this discovery anomaly.", "info");
      return;
    }
    if (triggerHaptic) triggerHaptic('heavy');
    const updated = { ...claimedDiscoveries, [id]: true };
    setClaimedDiscoveries(updated);
    saveClaimedDiscoveries(updated);

    if (updateProfilePoints) updateProfilePoints(points);
    if (triggerAlert) triggerAlert("🌌 Anomaly Charted", `Secured anomaly id: ${id}. The vibes are expanding. +${points} Points.`, "success");
  };

  const saveEventsList = (newList: any[]) => {
    setEventsList(newList);
    storageSaveEventsList(newList);
  };

  const saveCustomPosts = (newPosts: any[]) => {
    setCustomPosts(newPosts);
    storageSaveCustomPosts(newPosts);
  };

  const completeVibeStep = () => {
    setVibeStepCompleted(true);
    saveVibeStepCompleted(true);
  };

  return {
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
    claimDiscovery,
    claimedDiscoveries,
    vibeStepCompleted,
    completeVibeStep,
    customPosts,
    saveCustomPosts,
    eventsList,
    saveEventsList
  };
};

