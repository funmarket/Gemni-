-- ==============================================================================
-- VIBEQUEST GUARDIANS - SUPABASE SCHEMA MIGRATION
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PROFILES TABLE (D01 Identity & D02 Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    points INTEGER DEFAULT 0,
    streaks INTEGER DEFAULT 0,
    account_type TEXT DEFAULT 'vibe', -- 'vibe', 'pro', 'business'
    cultural_passport JSONB DEFAULT '[]'::jsonb,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VQ LEDGER TABLE (D20 Double-Entry Points & Reward Accounting)
CREATE TABLE IF NOT EXISTS public.vq_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_type TEXT DEFAULT 'user_wallet',
    direction TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason_code TEXT NOT NULL,
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vq_ledger_user ON public.vq_ledger(user_id, created_at DESC);

-- 3. VIBE TRAILS TABLE (D06 Curated Trails & Itineraries)
CREATE TABLE IF NOT EXISTS public.vibe_trails (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    story TEXT,
    address TEXT,
    category TEXT DEFAULT 'General',
    vibe_tags JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    author_id TEXT NOT NULL,
    author_name TEXT,
    city TEXT,
    stops JSONB DEFAULT '[]'::jsonb,
    total_stops INTEGER DEFAULT 1,
    total_estimated_minutes INTEGER DEFAULT 60,
    saves_count INTEGER DEFAULT 0,
    saved_by JSONB DEFAULT '[]'::jsonb,
    adoptions_count INTEGER DEFAULT 0,
    forked_from_trail_id TEXT,
    forked_from_author_name TEXT,
    is_tour BOOLEAN DEFAULT FALSE,
    tour_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vibe_trails_author ON public.vibe_trails(author_id);

-- 4. VIBE FLASHES TABLE (D18 33-Second Spontaneous Windows)
CREATE TABLE IF NOT EXISTS public.vibe_flashes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    window_start BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    response_photo_uri TEXT,
    response_front_photo_uri TEXT,
    response_latitude DOUBLE PRECISION,
    response_longitude DOUBLE PRECISION,
    response_timestamp BIGINT,
    created_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vibe_flashes_user ON public.vibe_flashes(user_id);

-- 5. VIBE CHECKS TABLE (D18 180-Second Reciprocal Camera Challenges)
CREATE TABLE IF NOT EXISTS public.vibe_checks (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    venue_id TEXT,
    venue_name TEXT,
    status TEXT DEFAULT 'pending',
    sender_photo_url TEXT,
    receiver_photo_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PLACE REVIEWS TABLE (D05 Place Community Reviews)
CREATE TABLE IF NOT EXISTS public.place_reviews (
    id TEXT PRIMARY KEY,
    place_id TEXT NOT NULL,
    place_name TEXT,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_place_reviews_place ON public.place_reviews(place_id, created_at DESC);

-- 7. SOCIAL POSTS TABLE (Live Feed & Community Gossip Moments)
CREATE TABLE IF NOT EXISTS public.social_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_uri TEXT,
    caption TEXT,
    venue_name TEXT,
    timestamp BIGINT,
    live_capture BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_posts_timestamp ON public.social_posts(created_at DESC);

-- 8. ACTIVITY STREAM TABLE (Real-time check-ins & badges)
CREATE TABLE IF NOT EXISTS public.activity (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    message TEXT,
    user_id TEXT NOT NULL,
    venue_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMMUNITY MEMBERS TABLE (D16 Local Circles)
CREATE TABLE IF NOT EXISTS public.community_members (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    community_id TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HANDSHAKES TABLE (D22 Authoritative Interactions)
CREATE TABLE IF NOT EXISTS public.handshakes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    guardian_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'hire' or 'vibe'
    status TEXT DEFAULT 'active', -- 'active' or 'expired'
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ/WRITE POLICIES FOR ANON CLIENT
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vq_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_flashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handshakes ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated users full select/insert/update access for the app
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'profiles', 
            'vq_ledger', 
            'vibe_trails', 
            'vibe_flashes', 
            'vibe_checks', 
            'place_reviews', 
            'social_posts', 
            'activity', 
            'community_members', 
            'handshakes'
        ])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Public access policy for %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
    END LOOP;
END $$;
