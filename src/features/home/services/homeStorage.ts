/**
 * Canonical Home Storage Adapter
 * Coordinates home feature storage requirements across canonical domains:
 * - D10 Activities (activitiesDomain)
 * - D11 Events (eventsDomain)
 * - D12 Social Content (socialContentDomain)
 * - D04 Geo Presence (geoPresenceDomain)
 * - D18 Challenges (challengesDomain)
 * - D20 Ledger (vqLedger)
 */

import { safeLocalStorage } from '../../../shared/services/storage/safeLocalStorage';
import { socialContentDomain } from '@/domains/d12_social_content';
import { activitiesDomain } from '@/domains/d10_activities';
import { eventsDomain } from '@/domains/d11_events';
import { vqLedger } from '@/domains/d20_vq_ledger';

export const useHomeStorage = () => {
  const getUpcomingActivities = () => safeLocalStorage.getItem('vq_upcoming_activities', []);
  const saveUpcomingActivities = (activities: any[]) => safeLocalStorage.setItem('vq_upcoming_activities', activities);

  const getRsvpedEvents = () => safeLocalStorage.getItem('vq_rsvped_events', {});
  const saveRsvpedEvents = (events: Record<string, boolean>) => safeLocalStorage.setItem('vq_rsvped_events', events);

  const getClaimedCoordinates = () => safeLocalStorage.getItem('vq_claimed_coordinates', {});
  const saveClaimedCoordinates = (coords: Record<string, boolean>) => safeLocalStorage.setItem('vq_claimed_coordinates', coords);

  const getPoints = () => vqLedger.getBalance('current_user') || 0;

  const getClaimedDiscoveries = () => safeLocalStorage.getItem('vq_claimed_discoveries', {});
  const saveClaimedDiscoveries = (discoveries: Record<string, boolean>) => safeLocalStorage.setItem('vq_claimed_discoveries', discoveries);

  const getVibeStepCompleted = () => safeLocalStorage.getItem('vq_vibe_step_completed', false);
  const saveVibeStepCompleted = (completed: boolean) => safeLocalStorage.setItem('vq_vibe_step_completed', completed);

  const getEventsList = (fallback: any[]) => safeLocalStorage.getItem('vq_events_list', fallback);
  const saveEventsList = (events: any[]) => safeLocalStorage.setItem('vq_events_list', events);

  const getCustomPosts = () => socialContentDomain.getCustomPosts();
  const saveCustomPosts = (posts: any[]) => {
    // If an array of posts is provided, persist the first or each to socialContentDomain
    if (Array.isArray(posts) && posts.length > 0) {
      posts.forEach(p => socialContentDomain.saveCustomPost(p));
    }
  };

  const getSimulatedProfile = () => safeLocalStorage.getItem('vq_simulated_profile', null);
  const saveSimulatedProfile = (profile: any) => safeLocalStorage.setItem('vq_simulated_profile', profile);
  
  return {
    getUpcomingActivities,
    saveUpcomingActivities,
    getRsvpedEvents,
    saveRsvpedEvents,
    getClaimedCoordinates,
    saveClaimedCoordinates,
    getPoints,
    getClaimedDiscoveries,
    saveClaimedDiscoveries,
    getVibeStepCompleted,
    saveVibeStepCompleted,
    getEventsList,
    saveEventsList,
    getCustomPosts,
    saveCustomPosts,
    getSimulatedProfile,
    saveSimulatedProfile
  };
};

export default useHomeStorage;
