import { useState, useEffect, useMemo } from 'react';
import { venueCheckInStore } from '../../../services/venueCheckInStore';

export const useHomeCheckInFeed = ({ profile, following, mutualMatches }: any) => {
  const [allCheckIns, setAllCheckIns] = useState(() => venueCheckInStore.getCheckIns());

  useEffect(() => {
    const interval = setInterval(() => {
      setAllCheckIns([...venueCheckInStore.getCheckIns()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentVibe = useMemo(() => {
    const myLastCheckIn = allCheckIns.find(ci => ci.userId === (profile?.id || 'current_user'));
    return myLastCheckIn?.vibe || 'Cozy';
  }, [allCheckIns, profile]);

  const venueCards = useMemo(() => {
    const followedUserIds = new Set(following.map((f: any) => f.followed_id));
    const matchUserIds = new Set(mutualMatches.map((m: any) => m.challenger_id === profile?.id ? m.challenged_id : m.challenger_id));

    const followedAndMatchCheckIns = allCheckIns.filter(ci => {
      if (ci.userId === (profile?.id || 'current_user')) return false;
      return followedUserIds.has(ci.userId) || matchUserIds.has(ci.userId);
    });

    const checkInsByVenue: Record<string, { venueName: string; rating: number; vibe: string; visitors: { avatar: string; userName: string; userId: string; }[] }> = {};

    followedAndMatchCheckIns.forEach(ci => {
      if (!checkInsByVenue[ci.venueId]) {
        checkInsByVenue[ci.venueId] = {
          venueName: ci.venueName,
          rating: ci.rating,
          vibe: ci.vibe,
          visitors: []
        };
      }
      if (!checkInsByVenue[ci.venueId].visitors.some(v => v.userId === ci.userId)) {
        checkInsByVenue[ci.venueId].visitors.push({
          avatar: ci.userAvatar,
          userName: ci.userName,
          userId: ci.userId
        });
      }
    });

    return Object.entries(checkInsByVenue).map(([venueId, data]) => ({
      venueId,
      ...data
    }));
  }, [allCheckIns, following, mutualMatches, profile]);

  return {
    allCheckIns,
    currentVibe,
    venueCards
  };
};
