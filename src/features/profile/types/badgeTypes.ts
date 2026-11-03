export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGENDARY';

export interface PassportBadge {
  id: string;
  title: string;
  category: 'curator' | 'explorer' | 'community';
  tier: BadgeTier;
  icon: string;
  description: string;
  unlockCriteria: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  pointsReward: number;
}

export const OFFICIAL_BADGES: PassportBadge[] = [
  {
    id: 'master_cartographer',
    title: 'Master Cartographer',
    category: 'curator',
    tier: 'GOLD',
    icon: '🧭',
    description: 'A master designer of complete day-long itineraries that guide fellow travelers.',
    unlockCriteria: 'Curate at least 2 verified multi-stop circuits with 3+ stops each.',
    unlocked: true,
    unlockedAt: '2026-10-24T18:30:00Z',
    progress: 100,
    pointsReward: 350
  },
  {
    id: 'viral_pathfinder',
    title: 'Viral Pathfinder',
    category: 'curator',
    tier: 'LEGENDARY',
    icon: '🔁',
    description: 'Your routes inspire the community; multiple explorers have adopted and remixed your circuits.',
    unlockCriteria: 'Have one of your trails adopted by 5 or more community explorers.',
    unlocked: true,
    unlockedAt: '2026-10-25T11:15:00Z',
    progress: 100,
    pointsReward: 500
  },
  {
    id: 'dawn_to_dusk',
    title: 'Dawn-to-Dusk Finisher',
    category: 'explorer',
    tier: 'GOLD',
    icon: '🌅',
    description: 'Walked the walk: Completed every single sequential stop on a multi-stop circuit in one day.',
    unlockCriteria: 'Complete all stops from morning to night on a verified Vibe Trail.',
    unlocked: false,
    progress: 75,
    pointsReward: 250
  },
  {
    id: 'discovery_remixer',
    title: 'Discovery Remixer',
    category: 'explorer',
    tier: 'SILVER',
    icon: '🌱',
    description: 'Bridged existing routes with fresh discoveries by appending newly found spots to adopted trails.',
    unlockCriteria: 'Adopt an existing community trail and append at least 1 new verified spot.',
    unlocked: true,
    unlockedAt: '2026-10-26T14:40:00Z',
    progress: 100,
    pointsReward: 200
  },
  {
    id: 'espresso_pilgrim',
    title: 'Espresso Pilgrim',
    category: 'explorer',
    tier: 'BRONZE',
    icon: '☕',
    description: 'A certified connoisseur of third-wave roasteries and hidden courtyard cafes.',
    unlockCriteria: 'GPS-validate visits to 3 distinct artisan cafe trail stops.',
    unlocked: true,
    unlockedAt: '2026-10-22T09:20:00Z',
    progress: 100,
    pointsReward: 100
  },
  {
    id: 'heritage_walker',
    title: 'Heritage Walker',
    category: 'explorer',
    tier: 'SILVER',
    icon: '🏛️',
    description: 'Deep cultural engagement: Explored ancient medinas, mosaic halls, and historic landmarks.',
    unlockCriteria: 'Validate visits to 3 cultural, museum, or architecture stops.',
    unlocked: false,
    progress: 66,
    pointsReward: 150
  },
  {
    id: 'midnight_nomad',
    title: 'Midnight Nomad',
    category: 'community',
    tier: 'BRONZE',
    icon: '🌙',
    description: 'Thrives after dark: Discovered underground music lounges and late-night culinary spots.',
    unlockCriteria: 'Check in at any nightlife or late-night trail stop after 23:00.',
    unlocked: false,
    progress: 40,
    pointsReward: 120
  }
];
