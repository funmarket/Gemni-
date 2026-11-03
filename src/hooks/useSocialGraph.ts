import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { socialGraphStore } from '../services/socialGraphStore';
import { UserProfile, FollowRelationship } from '../types/socialGraph';

export function useSocialGraph() {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'current_user';

  const [following, setFollowing] = useState<FollowRelationship[]>([]);
  const [followers, setFollowers] = useState<FollowRelationship[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  const reloadGraph = () => {
    setFollowing(socialGraphStore.getFollowing(currentUserId));
    setFollowers(socialGraphStore.getFollowers(currentUserId));
    setAllProfiles(socialGraphStore.getProfiles());
  };

  useEffect(() => {
    reloadGraph();

    // Listen to potential changes
    const interval = setInterval(reloadGraph, 2000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const follow = (targetId: string) => {
    socialGraphStore.followUser(currentUserId, targetId);
    reloadGraph();
  };

  const unfollow = (targetId: string) => {
    socialGraphStore.unfollowUser(currentUserId, targetId);
    reloadGraph();
  };

  const isFollowingUser = (targetId: string) => {
    return socialGraphStore.isFollowing(currentUserId, targetId);
  };

  const updateMyProfile = (updates: Partial<UserProfile>) => {
    socialGraphStore.updateProfile(currentUserId, updates);
    reloadGraph();
  };

  const getMyProfile = (): UserProfile => {
    const existing = socialGraphStore.getProfile(currentUserId);
    if (existing) return existing;

    // Create a default initial user profile if they don't have one
    return socialGraphStore.updateProfile(currentUserId, {
      id: currentUserId,
      username: user?.displayName || 'vibes_pioneer',
      avatar: '👽',
      interests: ['coffee', 'lofi', 'tech', 'vinyl'],
      vibes: 'curator of microtonal spaces, mechanical keyboard builder and midnight coding loops',
      activities: ['coding', 'record shopping'],
      likes: ['keyboards', 'midnight espresso'],
      dislikes: ['meetings', 'cold pizza'],
      preferred_match_types: ['friendship', 'colleagues', 'romance'],
      latitude: 36.8065,
      longitude: 10.1815,
      personalityStyle: {
        energy: 'calm',
        planning: 'structured',
        social: 'introvert',
        routine: 'habitual',
      },
      sportsActivities: ['running', 'cycling'],
      frequentPlaces: ['Sightglass Coffee', 'Bardo Ottoman Palace Gate'],
      relationshipGoals: 'long_term',
      optInPolarRomance: true,
      optInSocialActivity: true,
    });
  };

  return {
    following,
    followers,
    allProfiles,
    follow,
    unfollow,
    isFollowingUser,
    updateMyProfile,
    getMyProfile,
    reloadGraph,
  };
}
export default useSocialGraph;
