/**
 * Repository: CheckIn Repository
 * Supabase persistence for Activity & Place Check-Ins.
 */

import { supabase } from '../supabase/supabaseClient';
import { venueCheckInStore } from '../../services/venueCheckInStore';
import { placesDomain } from '@/domains/d05_places';

export interface DBCheckIn {
  id?: string;
  user_id: string;
  venue_id: string;
  venue_name: string;
  vibe: string;
  rating: number;
  timestamp?: string;
}

export const checkInRepository = {
  async logCheckIn(
    userId: string,
    venueId: string,
    venueName: string,
    vibe: string,
    rating: number
  ): Promise<{ success: boolean; data?: DBCheckIn; error?: unknown }> {
    const id = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();

    const checkInRecord: DBCheckIn = {
      id,
      user_id: userId,
      venue_id: venueId,
      venue_name: venueName,
      vibe,
      rating,
      timestamp,
    };

    // 1. Store in memory store
    venueCheckInStore.addCheckIn({
      userId,
      userName: `@user_${userId.substring(0, 5)}`,
      userAvatar: '🎒',
      venueId,
      venueName,
      vibe,
      rating,
    });

    // 2. Domain check-in
    try {
      placesDomain.checkIn(venueId);
    } catch {
      // already recorded today
    }

    // 3. Persist to Supabase activity stream
    try {
      await supabase.from('activity').upsert({
        id,
        type: 'VENUE_CHECKIN',
        message: `Verified check-in at ${venueName} (${vibe})`,
        user_id: userId,
        venue_id: venueId,
        timestamp,
      });
    } catch (err) {
      console.warn('Supabase activity stream notice:', err);
    }

    return { success: true, data: checkInRecord };
  },

  async getCheckInsForUser(userId: string): Promise<DBCheckIn[]> {
    try {
      const { data, error } = await supabase
        .from('activity')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          venue_id: d.venue_id || 'venue_unknown',
          venue_name: d.message || 'Venue',
          vibe: 'Verified',
          rating: 5,
          timestamp: d.timestamp,
        }));
      }
    } catch {
      // Fallback
    }

    const raw = venueCheckInStore.getCheckInsForUser(userId);
    return raw.map((c) => ({
      id: c.id,
      user_id: c.userId,
      venue_id: c.venueId,
      venue_name: c.venueName,
      vibe: c.vibe,
      rating: c.rating,
      timestamp: c.timestamp,
    }));
  },
};
