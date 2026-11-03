import { useState, useEffect } from 'react';
import { Community } from '../types/shareGoodVibesTypes';
import { communityService } from '../services/communityService';
import { triggerHaptic } from '@/shared/services/device/haptics';

export const useCommunityDirectory = (user: any, updateProfilePoints: (pts: number) => Promise<void>) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [activeChatroomCommunity, setActiveChatroomCommunity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndSeedCommunities = async () => {
    setIsLoading(true);
    try {
      let listData = await communityService.listCommunities();
      if (listData.length === 0) {
        const seeds: Omit<Community, 'id'>[] = [
          {
            name: 'Dolores Park Sunset Jam Community',
            handle: 'dolores_jams',
            emoji: '🥁',
            members: 94,
            description: 'Connecting hand drummers, guitarists, and listeners who gather around the Dolores hilltops for sunset vibrations.',
            creator: '@tribesman',
            tag: 'love',
            category: 'Spontaneous Gatherings',
            latitude: 37.7596,
            longitude: -122.4269
          },
          {
            name: 'Valencia Coffee Walk Club',
            handle: 'coffee_walkers',
            emoji: '☕',
            members: 112,
            description: 'Spontaneous morning coffee strolls and quiet banter near local roasters around 18th to 24th streets.',
            creator: '@luna_scribe',
            tag: 'kindness',
            category: 'Daily Journeys',
            latitude: 37.7608,
            longitude: -122.4251
          },
          {
            name: 'Mission Zen Mindfulness Space',
            handle: 'mission_zen',
            emoji: '🧘',
            members: 68,
            description: 'Exchange of quiet meditation locations, shared silent sitting practice, and cozy neighborhood teas.',
            creator: '@cookie_hero',
            tag: 'help',
            category: 'Vibe Matching',
            latitude: 37.7523,
            longitude: -122.4184
          }
        ];
        const loadedSeeds: Community[] = [];
        for (const s of seeds) {
          const doc = await communityService.createCommunity(s);
          loadedSeeds.push(doc);
        }
        setCommunities(loadedSeeds);
      } else {
        setCommunities(listData);
      }

      if (user?.uid) {
        const joinedIds = await communityService.listJoinedCommunities(user.uid);
        setJoinedCommunityIds(joinedIds);
      }
    } catch (err) {
      console.error('Error handling community sync:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSeedCommunities();
  }, [user]);

  const handleJoinToggle = async (comm: Community) => {
    triggerHaptic('heavy');
    const isJoined = joinedCommunityIds.includes(comm.id);
    
    try {
      if (isJoined) {
        setJoinedCommunityIds(prev => prev.filter(id => id !== comm.id));
        setCommunities(prev => prev.map(c => c.id === comm.id ? { ...c, members: Math.max(0, c.members - 1) } : c));
        alert(`🚪 Left "${comm.name}". Keep radiating good vibes.`);
      } else {
        await communityService.joinCommunity(user?.uid || 'guest_node_1337', comm.id);
        setJoinedCommunityIds(prev => [...prev, comm.id]);
        setCommunities(prev => prev.map(c => c.id === comm.id ? { ...c, members: c.members + 1 } : c));
        await updateProfilePoints(10);
        alert(`🎉 Connected to local Vibe Circle "${comm.name}"! +10 VQ Authority Coordinates gained.`);
      }
    } catch (err) {
      console.error('Error toggling group member join status:', err);
    }
  };

  return {
    communities,
    setCommunities,
    joinedCommunityIds,
    setJoinedCommunityIds,
    selectedTagFilter,
    setSelectedTagFilter,
    showAllCommunities,
    setShowAllCommunities,
    activeChatroomCommunity,
    setActiveChatroomCommunity,
    isLoading,
    refetchCommunities: fetchAndSeedCommunities,
    handleJoinToggle
  };
};
