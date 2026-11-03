export interface Venue {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number; // computed in km
  category: string;
  address: string;
  rating: number;
  visitors: number;
  pts: number;
  rarity: 'LEGENDARY' | 'RARE' | 'COMMON';
  emoji: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'sunset' | 'night' | 'anytime';

export interface TrailStop {
  id: string;
  order: number;
  placeName: string;
  address: string;
  lat: number;
  lng: number;
  timeOfDay: TimeOfDay;
  suggestedDurationMin?: number;
  proTip?: string;
  category?: string;
  photoUrl?: string;
}

export interface VibeTrail {
  id: string;
  name: string;
  story: string;
  address: string;
  category: string;
  vibeTags: string[];
  imageUrl?: string;
  latitude: number;
  longitude: number;
  authorId: string;
  authorName: string;
  createdAt: string;
  savesCount: number;
  savedBy: string[];
  photos?: string[];
  // Multi-stop itinerary extensions
  city?: string;
  stops?: TrailStop[];
  totalStops?: number;
  totalEstimatedMinutes?: number;
  // Trail Adoption / Forking extensions
  forkedFromTrailId?: string;
  forkedFromAuthorName?: string;
  adoptionsCount?: number;
  // Tour Extension (Exclusive to Pro Guardians)
  isTour?: boolean;
  tourDetails?: TourDetails;
}

export interface TourDetails {
  isTour?: boolean;
  tourTitle?: string;
  about?: string;
  duration?: string;
  price?: number;
  meetingPoint?: string;
  whatsIncluded?: string[];
  languages?: string[];
  ages?: string;
  accessibilityNotes?: string;
  whatToExpect?: string;
  cancellationPolicy?: string;
  startTimeNote?: string;
  guideGuardianId?: string;
  availableDates?: string[];
}

export interface CreateTrailInput {
  name: string;
  city?: string;
  story: string;
  address: string;
  category: string;
  vibeTags: string[];
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  stops?: TrailStop[];
  totalStops?: number;
  totalEstimatedMinutes?: number;
  photos?: string[];
  forkedFromTrailId?: string;
  forkedFromAuthorName?: string;
  isTour?: boolean;
  tourDetails?: TourDetails;
}
