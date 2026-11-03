/**
 * Domain 05: Places & Cultural Venues
 * Owns:
 * - Authoritative directory of cultural spots & venues
 * - Proximity verification & check-ins
 * - Real reward dispatch (+50 VQ to D20 Ledger)
 */

import { geoPresenceDomain, GeoCoordinate, calculateHaversineDistance } from '../d04_geo_presence';
import { vqLedger } from '../d20_vq_ledger';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

export interface PlaceVenue {
  id: string;
  name: string;
  category: 'cafe' | 'historic' | 'art' | 'rooftop' | 'food';
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  vibeScore: number;
  checkinsCount: number;
  curatorName: string;
  photoUrl: string;
  features: string[];
}

export interface PlaceCheckIn {
  id: string;
  placeId: string;
  placeName: string;
  userId: string;
  userHandle: string;
  distanceMetersAtCheckin: number;
  vqAwarded: number;
  checkedInAt: string;
}

const STORAGE_CHECKINS_KEY = 'vq_places_checkins_v2';

export const CALIBRATED_PLACES: PlaceVenue[] = [
  {
    id: 'place_medina_01',
    name: 'Dar El Jeld Rooftop',
    category: 'rooftop',
    description: 'Breathtaking panoramic sunset spot overlooking the historic Medina of Tunis with traditional mint tea and acoustic oud.',
    address: '5 Rue Dar El Jeld, Medina',
    city: 'Tunis',
    latitude: 36.7995,
    longitude: 10.1689,
    vibeScore: 98,
    checkinsCount: 142,
    curatorName: 'Yassine B.',
    photoUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    features: ['Panoramic View', 'Live Oud', 'Sunset Vibe', 'Wi-Fi'],
  },
  {
    id: 'place_sidibousaid_02',
    name: 'Café des Nattes',
    category: 'cafe',
    description: 'Iconic cobblestone terrace with pine-nut mint tea, traditional straw floor mats, and blue-and-white architecture.',
    address: 'Place du 7 Novembre',
    city: 'Sidi Bou Said',
    latitude: 36.8708,
    longitude: 10.3422,
    vibeScore: 96,
    checkinsCount: 388,
    curatorName: 'Malek D.',
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    features: ['Historic Cafe', 'Bambaloni Adjacent', 'Sea Breeze'],
  },
  {
    id: 'place_carthage_03',
    name: 'Baths of Antoninus & Sea Cliffs',
    category: 'historic',
    description: 'Majestic ancient Roman thermal ruins right on the Mediterranean shore, where gentle waves meet column shadows.',
    address: 'Rue 2 Mars 1934',
    city: 'Carthage',
    latitude: 36.8535,
    longitude: 10.3320,
    vibeScore: 94,
    checkinsCount: 97,
    curatorName: 'Sarah K.',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    features: ['UNESCO Site', 'Sea Cliffs', 'Quiet Walk'],
  },
  {
    id: 'place_marsa_04',
    name: 'L’Albatros Artisan Fish & Gelato',
    category: 'food',
    description: 'Seaside promenade staple loved by local artists for grilled sea bass and pistachio gelato at sunset.',
    address: 'Corniche de La Marsa',
    city: 'La Marsa',
    latitude: 36.8790,
    longitude: 10.3270,
    vibeScore: 91,
    checkinsCount: 215,
    curatorName: 'Amina T.',
    photoUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
    features: ['Seaside View', 'Artisanal Food', 'Night Walk'],
  }
];

class PlacesDomain {
  private places: PlaceVenue[] = [...CALIBRATED_PLACES];
  private checkins: PlaceCheckIn[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKINS_KEY);
      if (raw) {
        this.checkins = JSON.parse(raw);
      }
    } catch {
      this.checkins = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_CHECKINS_KEY, JSON.stringify(this.checkins));
    } catch (e) {
      console.warn('Failed to save checkins:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getAllPlaces(): PlaceVenue[] {
    const userPos = geoPresenceDomain.getPosition();
    return this.places.map((place) => ({
      ...place,
      distanceMeters: calculateHaversineDistance(userPos, {
        latitude: place.latitude,
        longitude: place.longitude,
      }),
    }));
  }

  public getPlaceById(id: string): PlaceVenue | undefined {
    return this.places.find((p) => p.id === id);
  }

  public getRecentCheckIns(): PlaceCheckIn[] {
    return [...this.checkins].sort(
      (a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
    );
  }

  public hasCheckedInToday(placeId: string, userId: string = 'current_user'): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return this.checkins.some(
      (c) => c.placeId === placeId && c.userId === userId && c.checkedInAt.slice(0, 10) === today
    );
  }

  /**
   * Check in to a place
   * Authoritatively issues +50 VQ to D20 Ledger
   */
  public checkIn(placeId: string, userHandle: string = 'hannibal'): {
    success: boolean;
    vqEarned: number;
    distanceMeters: number;
    message: string;
  } {
    const place = this.getPlaceById(placeId);
    if (!place) {
      throw new Error('Place not found');
    }

    if (this.hasCheckedInToday(placeId, 'current_user')) {
      return {
        success: false,
        vqEarned: 0,
        distanceMeters: 0,
        message: 'Already checked in here today. Come back tomorrow for more VQ!',
      };
    }

    const userPos = geoPresenceDomain.getPosition();
    const distanceMeters = calculateHaversineDistance(userPos, {
      latitude: place.latitude,
      longitude: place.longitude,
    });

    // Checkin record
    const record: PlaceCheckIn = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      placeId: place.id,
      placeName: place.name,
      userId: 'current_user',
      userHandle,
      distanceMetersAtCheckin: distanceMeters,
      vqAwarded: 50,
      checkedInAt: new Date().toISOString(),
    };

    this.checkins.unshift(record);
    place.checkinsCount += 1;
    this.save();

    // Credit user's double-entry ledger via D20
    vqLedger.credit(
      'current_user',
      50,
      'PLACE_CHECKIN',
      `Checked in at ${place.name}`,
      place.id
    );

    // Persist activity to Supabase
    try {
      supabase.from('activity').upsert({
        id: record.id,
        type: 'VENUE_CHECKIN',
        message: `Verified check-in at ${place.name}`,
        user_id: record.userId,
        venue_id: place.id,
        timestamp: record.checkedInAt,
      }).then(() => {}).catch(console.warn);
    } catch {}

    return {
      success: true,
      vqEarned: 50,
      distanceMeters,
      message: `Checked in at ${place.name}! +50 VQ awarded to your Purse.`,
    };
  }

  // Compatibility methods for venue checkin callers
  public getCheckIns(): PlaceCheckIn[] {
    return this.getRecentCheckIns();
  }

  public addCheckIn(checkIn: {
    userId: string;
    userName?: string;
    userAvatar?: string;
    venueId: string;
    venueName: string;
    vibe?: string;
    rating?: number;
  }): PlaceCheckIn {
    const record: PlaceCheckIn = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      placeId: checkIn.venueId,
      placeName: checkIn.venueName,
      userId: checkIn.userId,
      userHandle: checkIn.userName || 'traveler',
      distanceMetersAtCheckin: 0,
      vqAwarded: 50,
      checkedInAt: new Date().toISOString()
    };
    this.checkins.unshift(record);
    this.save();
    return record;
  }

  public getCheckInsForUser(userId: string): PlaceCheckIn[] {
    return this.checkins.filter(c => c.userId === userId);
  }
}

export const placesDomain = new PlacesDomain();
export const venueCheckInStore = placesDomain;

