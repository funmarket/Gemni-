> **HISTORICAL PROPOSAL — SUPERSEDED FOR IMPLEMENTATION (2026-11-03).** This Gemini-generated document is retained as source/idea evidence only, not a current governing implementation plan. The current mission is to **repair the existing VQgemni React/Vite app**, not create an empty replacement. The approved `Master_Plan.md` now requires **S00 before S01**: preserve the visual/data baseline, create genuine **Supabase Auth test users** and linked D01/D02 profiles, attribute the existing sample posts/Trails/Guardians to those test accounts, migrate authorized images into Supabase Storage under D13, and prove the app remains populated and functional before refactoring monolithic scripts. The older claims below recommending unrestricted direct Supabase client writes, local-first dual-write as durable truth, unreviewed startup seeding, core-loop features ahead of content preservation or synthetic interactions as real events are **not** governing decisions. Follow the current Master Plan, Requirements, Structure and Database documents and later direct Product Owner instructions. This archival proposal is not proof that depicted backend behavior is actually deployed.

---

# Complete Supabase Migration & Domain Ownership Architecture

Transform VQgemni into a fully unified, production-grade application running exclusively on Supabase with zero mock backends, zero monolithic scripts, and strict domain ownership matching the approved Master Plan and Database architecture.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1 clarification:
> - **Execution Priority**: Core User Loop first — authentic identity, VQ double-entry ledger, curated Vibe Trails, cultural verification, and Discovery Radar will be migrated and validated as the authoritative foundation before expanding outward to secondary social modules.
> - **Zero-State Experience**: Baseline authentic cultural records will be seeded directly into the Supabase database on initial run, providing immediate, live exploration without artificial stubs or empty screen voids.

---

### 1. Overview & Core Concept

- **What It Delivers**: A mobile-first, culturally authentic urban exploration application operating on 28 modular domain services. All user identity, double-entry points accounting, GPS-grounded discoveries, camera challenge verification, trail creation, and peer handshakes interact directly with live PostgreSQL tables hosted on Supabase (`avdfessrhbsqwlfmbdau`).
- **Target Audience / Persona**: Travelers, local cultural explorers, and certified Pro Guardians navigating heritage districts, artistic corridors, and hidden gems.
- **Key Value**: Real persistence with strict double-entry integrity, real-time peer interactions, zero synthetic bot delays, and durable offline-first resilience.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Daily Presence & Streak Loop**:
   - User opens the Home cockpit and verifies presence.
   - The D20 Ledger issues an authoritative idempotency check against `public.vq_ledger`, crediting +25 VQ points with immediate visual feedback, updated balance display, and animated streak progression.
2. **Cultural Discovery Radar**:
   - User triggers Discovery Radar in the Explore view.
   - The radar queries nearby canonical heritage places and cultural landmarks, charging the radar coil and outputting live discoveries persisted to `public.activity`.
3. **Curated Trail Itineraries & Remixing**:
   - User browses verified multi-stop routes (e.g., Medina Rooftops, Carthage Acropolis, San Francisco Fog Circuit).
   - User can bookmark to their Cultural Passport, explore individual stops with time-of-day tips, or create and remix custom routes saved directly to `public.vibe_trails`.
4. **Vibe Guardian Engagements & Handshakes**:
   - User explores local legends and verified Pro Guides.
   - User triggers "Hire" or "Vibe", minting an official 24-hour qualifying Handshake record in `public.handshakes`.

#### Visual Identity & Theme

- **Aesthetic Direction**: Neo-Cartographic Midnight — an atmospheric, high-contrast cultural passport interface combining nocturnal slate tones, electric amber warmth, and vibrant ultraviolet accents.
- **Color Palette & Theme Tokens**:
  - Background Canvas: Rich deep obsidian (`#0D0B12`) with frosted indigo depth (`#141218`).
  - Brand Ultraviolet: Vivid purple accent (`#9333EA` / `#A855F7`) for primary navigation and discovery pulses.
  - Cultural Amber: Warm gold (`#F59E0B` / `#D97706`) for Pro Guide badges, historical artifacts, and VQ ledger balance.
  - Verification Emerald: Neon mint (`#10B981`) for camera verification, live presence, and active streaks.
- **Typography & Hierarchy**:
  - Display & Headers: Bold, geometric sans-serif with tight character tracking for headings and place titles.
  - Data & Metrics: Monospaced high-contrast numerals for coordinates, timers, and VQ ledger credit balances.
  - Body: Legible neutral grotesque for cultural anecdotes and trail notes.
- **Mobile Ergonomics & Touch Guidelines**:
  - Natural Reach Zone (bottom 40%): Primary bottom navigation tabs (Home, Explore, Share, Vibe, Purse) and primary sticky action triggers.
  - Minimum Touch Hitbox: Strict $44 \times 44\text{px}$ minimum hitbox across all buttons, selectors, and tags.
  - Zero-Pill Discipline: Metadata (distance, city, duration, timestamps) rendered cleanly without cluttered pill encapsulations.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Supabase Client Integration over Custom Proxy Workers**
  - *Chosen Approach*: Client-side `@supabase/supabase-js` communicating with Postgres via Row-Level Security (RLS) policies.
  - *Why*: Eliminates intermediary server lag, delivers sub-50ms reactive updates, and ensures data is directly visible in the Supabase Table Editor.
  - *Trade-Off*: Requires strict RLS definitions and table schemas in PostgreSQL rather than schema-less flexibility.
- **Decision 2: Authoritative Ledger (D20) Double-Entry Accounting**
  - *Chosen Approach*: Every point change requires an explicit debit/credit row in `public.vq_ledger` with reason codes and idempotent transaction IDs.
  - *Why*: Prevents client-side balance manipulation, guarantees auditability, and matches the strict Requirements.md VQ-001/002 specifications.
  - *Trade-Off*: Replaces naive `points += 25` state mutations with structured ledger postings.
- **Decision 3: Resilient Local-First Synchronization**
  - *Chosen Approach*: Dual-write to in-memory reactive state and Supabase tables, with offline fallback caching.
  - *Why*: Guarantees seamless operation during transient mobile network interruptions or tunnel transit without blocking UI interactions.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VQGEMINI CLIENT APPLICATION                    │
│                                                                        │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────┐   │
│   │  HOME SCREEN  │ │ EXPLORE VIEW  │ │  SHARE FEED   │ │  PURSE   │   │
│   │ (Daily Streak │ │(Radar, Trails,│ │(Social Moments│ │(VQ Ledger│   │
│   │  & Handbook)  │ │  Guardians)   │ │  & Comments)  │ │ & Wallet)│   │
│   └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────┬─────┘   │
└───────────┼─────────────────┼─────────────────┼──────────────┼─────────┘
            │                 │                 │              │
            ▼                 ▼                 ▼              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL DOMAIN SERVICES                       │
│                                                                        │
│  [D01/D02 Identity]  [D05 Places]  [D06 Trails]  [D18 VibeCheck/Flash] │
│  [D20 VQ Ledger]     [D22 Handshake] [D16 Community] [D07 Guardians]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SUPABASE INFRASTRUCTURE CLIENT                      │
│                    (Endpoint: avdfessrhbsqwlfmbdau)                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  POSTGRESQL RELATIONAL DATABASE (LIVE)                 │
│                                                                        │
│  • public.profiles          • public.vq_ledger     • public.vibe_trails│
│  • public.vibe_flashes      • public.vibe_checks   • public.handshakes │
│  • public.place_reviews     • public.social_posts  • public.activity   │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Database Entities & Field Mapping

| Supabase Table | Canonical Domain Owner | Core Fields & Responsibilities |
| :--- | :--- | :--- |
| `public.profiles` | D01 / D02 | `id`, `handle`, `display_name`, `photo_url`, `points`, `streaks`, `account_type`, `cultural_passport` |
| `public.vq_ledger` | D20 VQ Ledger | `id`, `user_id`, `direction`, `amount`, `balance_after`, `reason_code`, `reference_id`, `created_at` |
| `public.vibe_trails` | D06 Trails | `id`, `name`, `story`, `city`, `author_id`, `stops` (JSONB), `saves_count`, `is_tour`, `tour_details` |
| `public.vibe_flashes` | D18 Spontaneous | `id`, `user_id`, `window_start`, `expires_at`, `status`, `response_photo_uri`, `coordinates` |
| `public.vibe_checks` | D18 Challenges | `id`, `sender_id`, `target_id`, `venue_id`, `status`, `sender_photo_url`, `receiver_photo_url` |
| `public.social_posts` | Community Feed | `id`, `user_id`, `image_uri`, `caption`, `venue_name`, `timestamp`, `live_capture` |
| `public.handshakes` | D22 Handshakes | `id`, `user_id`, `guardian_id`, `action_type`, `status`, `issued_at`, `expires_at` (24h) |
| `public.place_reviews`| D05 Places | `id`, `place_id`, `place_name`, `rating`, `comment`, `author_id`, `author_name` |
| `public.activity` | D05 Check-Ins | `id`, `type`, `message`, `user_id`, `venue_id`, `timestamp` |

#### Interactive Component & State Transition Mapping

- **Daily Streak Claim**: Triggered in `HomeScreen.tsx` -> calls `vqLedger.credit(userId, 25, 'DAILY_STREAK')` -> writes to `public.vq_ledger` -> updates profile streaks in `public.profiles` -> updates UI points balance reactively.
- **Discovery Radar Ping**: Triggered in `ExploreScreen.tsx` -> invokes `useExploreRadar` -> charges radar ring -> calculates nearby cultural anchors -> commits verified scan to `public.activity`.
- **Trail Save / Fork**: Triggered in `VibeTrailsList.tsx` -> calls `trailsDomain.adoptAndRemix` -> persists trail record to `public.vibe_trails` -> updates local cache and triggers reactive re-render.
- **Guardian Handshake**: Triggered in `GuardianCard.tsx` -> logs action in `public.handshakes` -> establishes qualifying 24h review eligibility.
