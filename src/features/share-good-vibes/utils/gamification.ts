import { VenueCheckIn } from '../../../services/venueCheckInStore';

export interface MayorInfo {
  userId: string;
  userName: string;
  userAvatar: string;
  checkInCount: number;
  isCurrentUser: boolean;
}

export interface VibeBadge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  unlocked: boolean;
  progress: number;
  totalNeeded: number;
}

// Simulated seed mayors for venues with low/no checkins to provide gamified onboarding competition
const SEED_MAYORS: Record<string, Omit<MayorInfo, 'isCurrentUser'>> = {
  'v-tealicious': { userId: 'analog_lens', userName: '@analog_lens', userAvatar: '📷', checkInCount: 3 },
  'v-grind': { userId: 'cyber_voyager', userName: '@cyber_voyager', userAvatar: '🦊', checkInCount: 4 },
  'v-bean': { userId: 'pixel_chef', userName: '@pixel_chef', userAvatar: '🍳', checkInCount: 3 },
  'v-summit': { userId: 'solara', userName: '@solara', userAvatar: '☀️', checkInCount: 2 }
};

// Computes the current Mayor for a venue based on check-ins
export function getVenueMayor(
  venueId: string,
  currentUserId: string,
  checkIns: VenueCheckIn[]
): MayorInfo {
  const venueCheckIns = checkIns.filter(ci => ci.venueId === venueId);
  
  if (venueCheckIns.length === 0) {
    // If we have a seeded mayor, use them
    if (SEED_MAYORS[venueId]) {
      const seed = SEED_MAYORS[venueId];
      return {
        ...seed,
        isCurrentUser: seed.userId === currentUserId
      };
    }
    // Generic default mayor fallback
    return {
      userId: 'ghost_scout',
      userName: '@ghost_scout',
      userAvatar: '👻',
      checkInCount: 1,
      isCurrentUser: false
    };
  }

  // Count check-ins per user
  const userCounts: Record<string, { userName: string; userAvatar: string; count: number }> = {};
  
  venueCheckIns.forEach(ci => {
    if (!userCounts[ci.userId]) {
      userCounts[ci.userId] = {
        userName: ci.userName,
        userAvatar: ci.userAvatar,
        count: 0
      };
    }
    userCounts[ci.userId].count += 1;
  });

  // Find user with maximum check-ins
  let mayorId = '';
  let maxCount = -1;
  let mayorName = '';
  let mayorAvatar = '';

  Object.entries(userCounts).forEach(([uid, info]) => {
    if (info.count > maxCount) {
      maxCount = info.count;
      mayorId = uid;
      mayorName = info.userName;
      mayorAvatar = info.userAvatar;
    }
  });

  // Check if there is a tie-breaker with our seeded mayor if seed has more
  if (SEED_MAYORS[venueId] && SEED_MAYORS[venueId].checkInCount > maxCount) {
    const seed = SEED_MAYORS[venueId];
    return {
      ...seed,
      isCurrentUser: seed.userId === currentUserId
    };
  }

  return {
    userId: mayorId,
    userName: mayorName,
    userAvatar: mayorAvatar,
    checkInCount: maxCount,
    isCurrentUser: mayorId === currentUserId
  };
}

// Calculates all user badges dynamically
export function getUserBadges(
  userId: string,
  checkIns: VenueCheckIn[],
  scannedVenues: Record<string, boolean>
): VibeBadge[] {
  const userCheckIns = checkIns.filter(ci => ci.userId === userId);
  
  // Count by category types
  const categoryCounts = {
    cozy: 0,      // café, coffee, tea
    chilled: 0,   // food, dining, restaurant
    hype: 0,      // night, bar, club
    quiet: 0,     // culture, museum, history
    inspiring: 0, // art, gallery, creative
    legendary: 0  // legendary rarity spots checked-in
  };

  userCheckIns.forEach(ci => {
    const v = (ci.vibe || '').toLowerCase();
    if (v.includes('cozy')) categoryCounts.cozy++;
    if (v.includes('chilled')) categoryCounts.chilled++;
    if (v.includes('hype')) categoryCounts.hype++;
    if (v.includes('quiet')) categoryCounts.quiet++;
    if (v.includes('inspiring')) categoryCounts.inspiring++;
    if (v.includes('verified')) {
      // Some verifications might include category count
    }
  });

  // Calculate legendary scans
  // We can count how many keys in scannedVenues are checked in
  const totalScans = Object.keys(scannedVenues).length;

  const badgesList: VibeBadge[] = [
    {
      id: 'badge-caffeine',
      name: 'Caffeine Fiend',
      emoji: '☕',
      description: 'Check in to 3 cozy cafes, tea rooms, or coffee shops.',
      category: 'Cozy',
      progress: Math.min(3, categoryCounts.cozy),
      totalNeeded: 3,
      unlocked: categoryCounts.cozy >= 3
    },
    {
      id: 'badge-gourmet',
      name: 'Gourmet Scout',
      emoji: '🍳',
      description: 'Check in to 2 chilled restaurants, diners, or bistros.',
      category: 'Chilled',
      progress: Math.min(2, categoryCounts.chilled),
      totalNeeded: 2,
      unlocked: categoryCounts.chilled >= 2
    },
    {
      id: 'badge-hype',
      name: 'Night Mayor',
      emoji: '🍷',
      description: 'Check in to 2 hype bars, pubs, or social night spots.',
      category: 'Hype',
      progress: Math.min(2, categoryCounts.hype),
      totalNeeded: 2,
      unlocked: categoryCounts.hype >= 2
    },
    {
      id: 'badge-culture',
      name: 'Culture Vulture',
      emoji: '🏛️',
      description: 'Check in to 2 cultural monuments, galleries, or historic spots.',
      category: 'Quiet',
      progress: Math.min(2, categoryCounts.quiet),
      totalNeeded: 2,
      unlocked: categoryCounts.quiet >= 2
    },
    {
      id: 'badge-vanguard',
      name: 'Vibe Vanguard',
      emoji: '👑',
      description: 'Perform check-ins at 5 or more spots across the city.',
      category: 'General',
      progress: Math.min(5, totalScans),
      totalNeeded: 5,
      unlocked: totalScans >= 5
    }
  ];

  return badgesList;
}

// Calculate check-in streak
export function getCheckInStreak(checkIns: VenueCheckIn[]): number {
  if (checkIns.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let streak = 0;
  const uniqueDays = new Set<string>();

  sorted.forEach(ci => {
    const dayStr = ci.timestamp.split('T')[0];
    uniqueDays.add(dayStr);
  });

  const daysArray = Array.from(uniqueDays).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (daysArray.length === 0) return 0;

  // Check if latest check-in is today or yesterday
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (daysArray[0] !== todayStr && daysArray[0] !== yesterdayStr) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let currentRef = new Date(daysArray[0]);
  streak = 1;

  for (let i = 1; i < daysArray.length; i++) {
    const prevDate = new Date(daysArray[i]);
    const diffTime = Math.abs(currentRef.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentRef = prevDate;
    } else {
      break;
    }
  }

  return streak;
}
