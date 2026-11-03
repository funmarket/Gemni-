export interface PersonalityStyle {
  energy: 'high' | 'calm';
  planning: 'structured' | 'spontaneous';
  social: 'extrovert' | 'introvert';
  routine: 'habitual' | 'adventurous';
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  interests: string[];
  vibes: string;
  activities: string[];
  likes: string[];
  dislikes: string[];
  preferred_match_types: ('friendship' | 'colleagues' | 'romance')[];
  latitude: number;
  longitude: number;
  isOnline?: boolean;
  lastSeen?: number;

  // New Specialized Matching Engine Extensions
  personalityStyle?: PersonalityStyle;
  sportsActivities?: string[];
  frequentPlaces?: string[];
  relationshipGoals?: 'long_term' | 'casual' | 'marriage' | 'companionship';
  lastRomanceMatchDate?: number;
  lastSocialMatchDate?: number;
  optInPolarRomance?: boolean;
  optInSocialActivity?: boolean;
}

export interface FollowRelationship {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: number;
}

export interface VibeCheckRequest {
  id: string;
  challenger_id: string;
  challenged_id: string;
  prompt: string;
  status: 'pending' | 'responded' | 'confirmed' | 'ghosted';
  created_at: number;
  expires_at: number;
  response_photo_uri?: string | null;
  response_front_photo_uri?: string | null;
  response_latitude?: number | null;
  response_longitude?: number | null;
  response_timestamp?: number | null;
  challenger_reaction?: 'fire' | 'cap' | 'vibing' | null;
}

export interface RomancePolarMatch {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedProfile: UserProfile;
  createdAt: number;
  status: 'pending_review' | 'accepted' | 'passed';
  complementarityScore: number; // 0 to 100
  dimensions: {
    planning: string;
    energy: string;
    social: string;
    routine: string;
  };
  whyReport: {
    headline: string;
    description: string;
    growthOpportunities: string[];
    sharedFoundations: string[];
  };
  nextEligibleDate: number;
}

export interface SocialActivityMatch {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedProfile: UserProfile;
  createdAt: number;
  status: 'suggested' | 'connected' | 'dismissed';
  activityScore: number; // 0 to 100
  sharedSports: string[];
  sharedPlaces: string[];
  distanceKm: number;
  whyExplanation: string;
  nextEligibleDate: number;
}
