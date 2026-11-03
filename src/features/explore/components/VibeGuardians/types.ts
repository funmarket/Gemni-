export type GuardianType = 'pro' | 'local';

// Review badges strictly restricted to the 3 requested badges: Good Vibe, Chill Vibe, Cool Vibe
export type VibeBadge = 'Good Vibe' | 'Chill Vibe' | 'Cool Vibe';

export interface GuardianReview {
  id: string;
  author: string;
  authorHandle: string;
  badge: VibeBadge;
  note: string; // Max 111 chars
  createdAt: string;
}

export interface GuardianTrailItem {
  id: string;
  title: string;
  link?: string;
  flatPrice?: number;
}

export interface PreMadeTour {
  id: string;
  title: string;
  description: string;
  duration: string;
  whatsIncluded: string[];
  meetingPoint: string;
  pricingType: 'hourly' | 'flat';
  price: string; // e.g. "$35/hr" or "$85 flat"
  photos: string[];
  availableSlots?: string[]; // e.g. ["Tomorrow 10:00 AM", "Saturday 2:00 PM"]
}

export interface TourReservation {
  id: string;
  tourId: string;
  tourTitle: string;
  guardianId: string;
  userId: string;
  userName: string;
  date: string;
  timeSlot: string;
  partySize: number;
  note?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface VibeGuardian {
  id: string;
  name: string;
  handle: string;
  type: GuardianType;
  city: string;
  stateCountry: string;
  age?: number;
  hideAge?: boolean;
  
  // Selfie verification (7-day rule)
  selfieUrl: string;
  selfieCapturedAt: string; // ISO date string
  
  // Pro status & Pricing (One option only: hourly OR flat rate for Pro Guardians, never both)
  hasActiveProSubscription: boolean;
  hiresCount: number; // for Top Vibes sorting
  pricingType?: 'hourly' | 'flat';
  hourlyRate?: number; // Option A: e.g. 35
  flatRate?: number;   // Option B: e.g. 85
  priceDisplay?: string; // e.g. "$35/hr" or "$85 flat"
  
  // Details for Full Profile
  experience: string;
  hobbies: string[];
  
  // Up to 5 Vibe Trails on Card
  trails: GuardianTrailItem[];
  favoriteTrails?: string[]; // backward compatibility
  
  // Pre-made Tours
  preMadeTours?: PreMadeTour[];
  
  bio: string;
  
  // Social Proof & Badges
  earnedBadges: { badge: VibeBadge; count: number }[];
  reviews: GuardianReview[];
  
  // Handshake Proof System: List of user handles/ids who have a handshake with this guardian
  handshakes?: string[];
  
  // Suggested Tab metadata
  suggestedBy?: {
    author: string;
    note: string;
    role: string;
  };
  
  // Pro Guardian Hire Visibility Checkbox on trails
  showInHireSuggestions?: boolean;
  
  isCurrentUser?: boolean;
}

export interface GuardianChatMessage {
  id: string;
  guardianId: string;
  senderHandle: string;
  senderName: string;
  text: string;
  timestamp: string;
  isFromGuardian: boolean;
}
