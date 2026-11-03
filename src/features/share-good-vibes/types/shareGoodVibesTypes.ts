export interface Community {
  id: string;
  name: string;
  handle: string;
  emoji: string;
  members: number;
  description: string;
  creator: string;
  tag: 'love' | 'kindness' | 'help';
  category: string;
  isPrivate?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LiveVibeActivity {
  id: string;
  text: string;
  sub: string;
  icon: string;
  expiresIn: string;
  vibeTag: string;
  user: string;
  compatibility: string;
  color: string;
  latitude: number;
  longitude: number;
}

export interface MoodFilter {
  id: string;
  name: string;
  description: string;
  vpack: string; // Vibe Pack pairing
  defaultIntensity: number;
  locationTheme: string; // Location-adaptability label
  icon: string; // Emoji representing the filter
  influenceKeyword: string; // Keyword triggering
}
