/**
 * Infrastructure Environment Configuration
 * Provides Supabase integration configuration.
 */

export const clientEnv = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://avdfessrhbsqwlfmbdau.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGZlc3NyaGJzcXdsZm1iZGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1Mjg2MzIsImV4cCI6MjEwOTEwNDYzMn0.z7hGDewgnotWNWt3ZJpjetTzynTAQHpkZjrSRoNFAEI',
};
