/**
 * Repository: VibePost Repository
 * Authoritative Supabase persistence for VibeChecks and VibeFlashes.
 */

import { supabase } from '../supabase/supabaseClient';

export interface VibeCheckRecord {
  id?: string;
  challenger_id: string;
  challenged_id: string;
  prompt: string;
  status: string;
  created_at: number;
  expires_at: number;
  response_photo_uri?: string;
  response_front_photo_uri?: string;
  challenger_reaction?: string;
}

const SEED_CHECKS: VibeCheckRecord[] = [
  {
    id: 'vc_seed_001',
    challenger_id: 'user_yassine',
    challenged_id: 'current_user',
    prompt: 'Show your current view in the historic Medina!',
    status: 'pending',
    created_at: Date.now() - 3600000,
    expires_at: Date.now() + 86400000,
  }
];

export const vibePostRepository = {
  async getAllChecks(): Promise<VibeCheckRecord[]> {
    try {
      const { data } = await supabase.from('vibe_checks').select('*');
      if (data && data.length > 0) {
        return data as VibeCheckRecord[];
      }
    } catch {
      // Fallback to seeds on offline or initial load
    }
    return [...SEED_CHECKS];
  },

  async insertCheck(record: VibeCheckRecord): Promise<VibeCheckRecord> {
    const id = record.id || `vc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: VibeCheckRecord = {
      ...record,
      id,
    };
    try {
      await supabase.from('vibe_checks').upsert(newRecord);
    } catch (err) {
      console.warn('Supabase vibe_checks insert notice:', err);
    }
    return newRecord;
  },

  async updateCheckStatus(id: string, status: string): Promise<void> {
    try {
      await supabase.from('vibe_checks').update({ status }).eq('id', id);
    } catch (err) {
      console.warn('Supabase vibe_checks status update notice:', err);
    }
  },

  async updateCheckResponse(id: string, updates: Partial<VibeCheckRecord>): Promise<void> {
    try {
      await supabase.from('vibe_checks').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase vibe_checks response update notice:', err);
    }
  },
};
