# VibeQuest Master Application — Page-by-Page Feature, Mechanics, Rules & Domain Reference

**Current Canonical Baseline:** November 4, 2026  
**Governing Architecture:** 28 Canonical Logical Domains (`D01`–`D28`), Supabase PostgreSQL Persistence, Single-Page React/Vite Architecture  
**Document Purpose:** Definitive, comprehensive record of all pages, features, user-visible mechanics, interaction rules, domain ownership boundaries, and database cutover specifications. This document protects the product against feature loss, unauthorized redesigns, or accidental regression during ongoing modernization.

---

## 1. Executive Principles & Governing Laws

1. **Zero Redesign Law (Preserve the Product)**:
   - 100% of the existing user journeys, visual styling, screens, transitions, layouts, and interactive mechanics must be preserved exactly as designed and accepted.
   - Refactoring is strictly architectural: migrating from simulated/local client state to real, domain-owned Supabase database persistence.
2. **Single Canonical Domain Ownership**:
   - Every entity, action, and state transition belongs to exactly one of the 28 logical domains (`D01` through `D28`).
   - No feature component may bypass its canonical domain service or write to foreign domain tables directly.
3. **Identity & Profile Mapping Rule**:
   - Three distinct identity tokens must never be conflated:
     1. `Supabase Auth UUID`: Authenticated user credentials in `auth.users`.
     2. `Canonical Profile ID`: Primary profile identifier (e.g. `usr_<uuid>`).
     3. `Public Handle`: Lowercase alphanumeric username starting with `@` (e.g. `@yassine_medina`).
   - Display names and handles must always resolve accurately; technical UUIDs must never appear as author handles in social feeds.
4. **Supabase Direct-Execution Pipeline**:
   - Supabase does not accept auto-push from GitHub.
   - All SQL schemas, migrations, RLS security policies, and storage bucket definitions must be executed directly in the Supabase management console/CLI.
5. **Real Mechanics over Mock Slop**:
   - Replace embedded local arrays, mock timers, and simulated state machines with real backend persistence and validated business rules.

---

## 2. Global Shell & Persistent Navigation

### 2.1 Navigation Structure
- **Persistent Bottom Bar (5 Primary Destinations)**:
  1. **Home** (`HomeScreen.tsx`): Curated feed, check-ins, flash alerts, daily streak, heritage coordinates, trail gateway, local gems.
  2. **Explore** (`ExploreScreen.tsx`): Proximity alerts, radar/heatmap, Vibe Trails & Vibe Tours dual-tab system, Vibe Guardians 4-tab directory, nearby venue cards.
  3. **Share** (`ShareGoodVibesScreen.tsx`): Dual-camera VibeCheck challenges, ephemeral vibes feed, community circles, donation modal.
  4. **VIBE** (`VibeScreen.tsx` / `VibeCenterView.tsx`): 6-tab social hub (Gossip, Drift, Vibes, Orbit, Echo, Pulls) with 1:1 chat thread overlay and canonical Public Profile modals.
  5. **Purse** (`CryptoScreen.tsx`): Personal asset wallet and local P2P trading dashboard with escrow chat.

### 2.2 Global Shell Header & Overlays
- **Header Elements**:
  - Top branding: `VIBEQUEST: Gather & Discover`.
  - Notification icon with unread badge counter (`NotificationCenterModal`).
  - Active profile avatar indicator opening the user profile/sidebar.
- **Global Supporting Modals**:
  - `PublicProfileModal`: Universal canonical user card with large photo, bookmark button, city, handle, bio, interests, and `ECHO` (D03) / `PULL` (D17) action bar.
  - `NotificationCenterModal`: Real-time alerts, invites, and notifications.
  - `MessageModal` / `VibeChatThread`: 1:1 direct messaging unlocked exclusively by mutual vibes (SOC-002).
  - `AdminScreen` (`/admin`): Special back-office management console.

---

## 3. The 28 Canonical Domain Boundaries (`D01`–`D28`)

| Domain | Name | Canonical Responsibility | Primary Tables |
|---|---|---|---|
| **D01** | Identity & Auth | Supabase Auth sessions, credential linking, auth state observers | `auth.users`, `s00_test_identity_links` |
| **D02** | Profiles | User profile data, avatars, bio, city, handles, preferences | `profiles` |
| **D03** | Social Graph | One-way directed follows (Orbit = following, Echo = followers) | `social_follows` |
| **D04** | Location & Geofencing | Geolocation coordinates, city detection, geofence radius checks | `venue_locations`, `user_locations` |
| **D05** | Presence | Live presence timestamps, active node sessions, radar beacons | `user_presence` |
| **D06** | Points & Rewards | User points ledger, streak counters, loyalty shards | `points_ledger` |
| **D07** | Achievements & Quests | Daily quest tracking, streak progression, quest completion | `user_quests` |
| **D08** | Cultural Passport | Achievement badges, cultural discovery stamps, verified badges | `cultural_badges` |
| **D09** | Audio Frequency | Sound frequency playback, ambient soundscapes, audio vibes | `audio_tracks` |
| **D10** | Moments | Ephemeral photo moments, camera captures, proof stamps | `moments` |
| **D11** | Stories | 24-hour expiring visual stories, media reel items | `stories` |
| **D12** | Social Content | Gossip feed posts, community feeds, image/text publications | `social_posts` |
| **D13** | Comments & Reactions | Post comments, reactions, social resonance counts | `post_comments`, `post_reactions` |
| **D14** | Direct Messaging | 1:1 chat messages, thread metadata, message status | `direct_messages`, `chat_threads` |
| **D15** | Wallet Assets | Token balances, digital asset tracking, transaction logs | `wallet_accounts`, `wallet_txs` |
| **D16** | Marketplace | Digital goods, souvenir vouchers, store listings | `market_items`, `market_orders` |
| **D17** | Matching & Resonance | Connection Pulls, reciprocal mutual vibes, wavelength matching | `connection_pulls`, `mutual_vibes` |
| **D18** | Challenges & VibeCheck | Native dual-camera timed reciprocal challenges (180s timeout) | `vibe_challenges` |
| **D19** | Trails & Tours | Multi-stop itineraries (Trails) & paid guided circuits (Tours) | `vibe_trails`, `vibe_tours`, `trail_stops` |
| **D20** | Guardians | Pro Guardians & Local Legends directory, 7-day selfie currency | `vibe_guardians`, `guardian_tours` |
| **D21** | P2P Trading | Local cash/crypto peer trading offers, escrow status, chat | `p2p_offers`, `p2p_trades` |
| **D22** | Handshake Proof | Cryptographic/session proof of completed in-person meetings | `guardian_handshakes` |
| **D23** | Reviews & Ratings | Gated community feedback (requires verified handshake) | `guardian_reviews` |
| **D24** | Trust Network | Local vouching, reputation scores, safety verifications | `trust_vouches` |
| **D25** | Notifications | In-app alerts, system notifications, push dispatches | `app_notifications` |
| **D26** | Analytics & Telemetry | Anonymized usage telemetry, telemetry events | `analytics_events` |
| **D27** | Moderation & Safety | Content reporting, moderation review queues, safety flags | `content_reports`, `moderation_actions` |
| **D28** | Admin Console | Administrative controls, user tier elevation, platform metrics | `admin_audit_logs` |

---

## 4. Page-by-Page Feature & Mechanics Specification

### 4.1 Home Screen (`HomeScreen.tsx`)
1. **Location & Search Row**: Displays active city context (e.g. `Tunis Medina`) with tap routing directly into Explore search.
2. **Vibe Check-ins Carousel**: Horizontally scrolling live check-in nodes displaying real-time nearby traveler presences.
3. **Active Flash Alert**: Proximity-triggered high-urgency notifications for ephemeral cultural events.
4. **Feed Tabs (`HomeFeedTabs.tsx`)**:
   - `My Network`: Posts strictly from accounts in the user's Orbit (D03).
   - `Local Vibes`: Location-bounded community posts filtered by city/neighborhood.
   - `For You`: Algorithmic discovery feed based on cultural interests.
   - Author clicks on avatars or handles trigger the canonical `PublicProfileModal`.
5. **Live Activities Panel**: Ongoing group adventures, gatherings, and coffee meetups.
6. **Live & Upcoming Events**: Ticketed or RSVP cultural happenings with date/time countdowns.
7. **Daily Streak Quest**: Consecutive daily login tracker rewarding VQ loyalty shards.
8. **Vibe Trails Gateway**: Highlights popular multi-stop walking itineraries, linking into Explore.
9. **Curated Heritage Coordinates**: Highlighting historically significant local architectural monuments.
10. **Local Gems**: Expandable cards for hidden cafés, artisan workshops, and scenic viewpoints.
11. **VIBE Guide**: In-app orientation and cultural etiquette primer.
12. **Live Feed System**: Real-time bottom feed of platform social activity.

---

### 4.2 Explore Screen (`ExploreScreen.tsx`)
1. **Conditional Proximity Alert**: Dynamic notification banner triggered when near an unverified or verified venue.
2. **Location Controls & Pill**: Active GPS / simulated coordinate selector.
3. **Explore Hero**: Visual headline and search context.
4. **Flash Event Alert**: Ephemeral event indicator.
5. **Vibe Trails & Vibe Tours Dual Tabs**:
   - **Vibe Trails Tab**: Public, free-to-explore community multi-stop itineraries. Any user, Local Legend, or Pro Guardian can create Trails.
   - **Vibe Tours Tab**: Paid, guide-led premium walking tours. **Only verified Pro Guardians can author Tours.**
   - Upfront pricing displayed clearly on tour cards before any booking request.
6. **Search Field & Tag Controls**: Auto-suggest text search with filter tags.
7. **Venue Category Rail**: `All` / `Food` / `Cafés` / `Culture` / `Art` / `Venues` / `Hidden`.
8. **Venue Heatmap & Sensory Radar**: Graphic radar showing dense vibe hotspots.
9. **Vibe Guardians Directory (`VibeGuardiansSection.tsx`)**:
   - 4 Tabs:
     - `Top Vibes`: Highest-rated and most frequently hired Pro Guardians.
     - `Pro Guardians`: Licensed/professional guides with flat tour rates or hourly rates.
     - `Local Legends`: Free local cultural companions (hangouts, not paid tours).
     - `Suggested`: Contextual recommendations based on user travel style.
   - **7-Day Selfie Currency Rule**: Guardians must refresh their verified selfie every 7 days (`SELFIE_EXPIRATION_MS = 604,800,000`). Expired profiles are automatically excluded from the public directory.
   - **Handshake Gate**: Community reviews can only be submitted by travelers who hold an authentic verified handshake (D22).
   - **Card Trail Limit**: Cards show up to 5 offered trails, each featuring a compact green "Explore now" action.
10. **Nearby Venue Results**: Detailed venue cards with confidence scores, vibe badges, and proximity validation buttons (`ProximityValidator`).
11. **Secondary Category Grid**: Visual shortcuts for rapid filtering.
12. **Vibe Suggestions**: Community-driven recommendations for unexplored spots.

---

### 4.3 Vibe Trails & Tours Architecture (`D19` / `D20`)
1. **Dual Entity Semantics**:
   - `VibeTrail`: Open community routes with 2 to 10 ordered stops, duration, time-of-day sequence (morning, afternoon, sunset, night), and curator pro-tips.
   - `VibeTour`: Official guided experience authored exclusively by an eligible Pro Guardian. Includes flat price, meeting location, what's included, spoken languages, and duration.
2. **Authoring Studio (`CreateTrailModal.tsx`)**:
   - If the creator is an eligible Pro Guardian: displays the **“Label this as a Tour”** toggle.
   - Enabling the toggle reveals Tour-specific fields (flat tour price, inclusions, pickup location, languages).
   - Disabling it (or when authored by regular users / Local Legends) saves as a standard public Vibe Trail.
3. **Detail View & Map Handoff (`TrailDetailModal.tsx`)**:
   - Numbered route timeline with time-of-day badges.
   - Walking directions handoff link generating multi-stop Google Maps itineraries.
   - Lineage tree (`TrailRemixTree.tsx`) visualizing trail remix ancestry.
   - Offline trail caching via `trailCacheService`.
4. **Reservation Flow (`ReservationCalendarModal.tsx`)**:
   - Prominent green **“Check dates”** / **“Reserve now”** CTA.
   - Displays calendar date selector, group size, and custom notes.
   - Initiates an authentic booking request in Supabase (migrated from legacy local demo state).

---

### 4.4 Share Good Vibes Screen (`ShareGoodVibesScreen.tsx`)
1. **Incoming Challenge Overlay**: Triggered when a peer sends a reciprocal VibeCheck challenge.
2. **Dual-Camera Capture Flow**: Front + back simultaneous camera capture for moment authentication.
3. **Quick Vibe Creator (`ShareVibeModal.tsx`)**: Ephemeral post publisher with tag selection.
4. **Community Circles (`VibeCircleMembersModal.tsx`)**: Themed local micro-communities with join requests.
5. **Aesthetic Discovery Compass**: Interactive vibe compass for atmospheric exploration.
6. **Donation / Support Modal (`DonationModal.tsx`)**: Local artisan and heritage preservation donation portal.

---

### 4.5 VIBE Hub — Social & Matching Engine (`VibeCenterView.tsx`)
The VIBE screen is organized around 6 persistent subtabs:
1. **GOSSIP**:
   - Ephemeral community gossip feed with inline composer.
   - Post cards display author photos, timestamps, location tags, and media attachments.
   - Tapping author avatars or handles opens the canonical `PublicProfileModal`.
2. **DRIFT**:
   - 12 Wavelength Frequencies: `Chill`, `Sweat`, `Lounge`, `Brain`, `Sunset`, `Mellow`, `Echo`, `Zen`, `Groove`, `Pixel`, `Quest`, `Wander`.
   - Selecting a wavelength reveals matching explorers tuned to that frequency.
   - Actions: One-way Follow into Orbit or send a custom invitation prompt.
3. **VIBES (D17 Confirmed Mutual Matches)**:
   - Header Banner: Locked single-line count pill (`2 Confirmed`).
   - Displays travelers with mutual double-opt-in resonance.
   - Cards follow the **Sample 3 Three-Column Format**:
     - Left: Rounded avatar (14x14) rendering image assets or clean emojis.
     - Center: Single-line bold name, handle underneath, match status tag underneath.
     - Right: Match score badge on top (`✨ 90% Vibe`) and `Chat` action button underneath.
   - **SOC-002 Rule**: Only confirmed mutual Vibes unlock 1:1 personal direct messaging (`VibeChatThread.tsx`).
4. **ORBIT (D03 Outbound Follows)**:
   - Header Banner: Locked single-line count pill (`2 Orbiting`).
   - Lists creators, guardians, and explorers the user actively follows.
   - Cards follow Sample 3 layout with top-right badge and bottom-right `Unfollow` button.
5. **ECHO (D03 Inbound Followers)**:
   - Header Banner: Locked single-line count pill (`3 Tuning In`) with no text overlap.
   - Lists accounts following the user.
   - Cards follow Sample 3 layout with top-right badge and bottom-right `Follow Back` / `Following` toggle.
6. **PULLS (D17 Inbound Connection Invitations)**:
   - Header Banner: Locked single-line count pill (`2 Pending`).
   - Lists incoming connection invites with compatibility score and sender's reason.
   - Cards follow Sample 3 layout with safe avatar image rendering (no raw URL text leaks).
   - Bottom-right action buttons: `Pass` and `Accept`. Accepting immediately confirms a mutual Vibe and opens direct messaging.

---

### 4.6 Canonical Public Profile Card (`PublicProfileModal.tsx`)
Matches the reference design (`image_29f0b009.png`):
- **Aspect Ratio & Frame**: Rounded bottom-sheet or modal card (`max-w-[380px]`).
- **Hero Image**: Large full-width portrait photo with high-fidelity asset rendering.
- **Top-Right Bookmark**: Circular glassmorphic bookmark toggle button for saving favorite creators.
- **Identity Stack**:
  - Name and City Pill side-by-side (e.g. `Yassine B.` with `Tunis` pill).
  - Canonical Handle directly underneath (e.g. `@yassine_medina`).
  - Biography wrapping cleanly with font-normal leading.
  - Interest Pills: Rounded capsule tags (e.g. `Culture`, `Photography`, `Coffee`).
- **Bottom Action Bar**:
  - **Left**: `ECHO` button (D03 Social Graph) — toggles one-way following into Orbit.
  - **Right**: `PULL` button (D17 Matching) — sends a connection invitation to unlock mutual messaging.
  - **Middle/Chat**: Direct message icon appears only when a mutual Vibe is active.

---

### 4.7 Purse — Wallet & P2P Trading (`CryptoScreen.tsx`)
1. **Wallet Tab (`CryptoDashboard.tsx`)**:
   - VQ loyalty shard balance and asset balance display.
   - Public wallet address with copy-to-clipboard button and QR code generator.
   - Send and Receive modal sheets with address and amount validations.
   - Transaction ledger recording tips, check-in rewards, and tour payments.
2. **P2P Trading Tab**:
   - Buy/Sell local peer offers with currency, price, and limit filters.
   - Create Offer modal specifying exchange rate, payment methods, and meetup safety terms.
   - Active trade escrow chat with step-by-step release verification.

---

### 4.8 Profile Screen (`ProfileScreen.tsx`)
1. **Masthead**: Centered circular avatar with glowing green outline.
2. **Display Stack**: Full name, canonical `@handle`, and edit button (`ProfileView.tsx`).
3. **Voyager Elevation Card**: Tier progress card (e.g. `Voyager` → `Elite Voyager`) with points multiplier.
4. **Cultural Passport Shelf (`BadgesShelf.tsx`)**: Grid of unlocked achievement stamps and guardian badges.
5. **Security & Preferences List**: Navigation to sync preferences, security protocol, and identity verification.
6. **Terminate Node Session**: Clean logout handler clearing local authentication state.

---

## 5. Staged Database Cutover Catalog (Simulated State → Supabase)

To eliminate React-embedded fake mechanics while preserving 100% of the UI/UX:

| Feature Area | Current Legacy Mechanism | Canonical Supabase Table | Cutover Plan |
|---|---|---|---|
| User Identity & Auth | `s00_test_identity_links` / local session | `auth.users` & `profiles` | Transition all profile reads/writes to `profiles` indexed by `id = usr_<uid>`. |
| Orbit & Echo | `socialGraphDomain` in-memory set | `social_follows` | Replace local memory sets with queries to `social_follows(follower_id, followed_id)`. |
| Connection Pulls | `matchingDomain` in-memory array | `connection_pulls` | Replace local array with real rows in `connection_pulls(sender_id, target_id, status)`. |
| Mutual Vibes | `matchingDomain` in-memory matches | `mutual_vibes` | Real mutual vibe rows created when `connection_pulls` is accepted. |
| Vibe Trails & Tours | `vibe_trails` in Firestore / localStorage | `vibe_trails`, `trail_stops` in Postgres | Store trails, ordered stops, pro-tips, and tour pricing in Supabase PostgreSQL tables. |
| Guardian Directory | `vibeGuardianStorage` in `localStorage` | `vibe_guardians`, `guardian_tours` | Move guardian listings, selfie timestamp, and tour links to `vibe_guardians`. |
| Handshake Evidence | `vq_guardian_handshakes_proof_v2` in local storage | `guardian_handshakes` | Store cryptographic or session handshakes in `guardian_handshakes` table. |
| Tour Reservations | `vq_guardian_tour_reservations_v2` (auto-accepted demo) | `tour_reservations` | Real reservation booking records with pending/accepted/declined status in Supabase. |
| Guardian Reviews | Local reviews helper | `guardian_reviews` | Enforce database RLS check ensuring review creator has matching row in `guardian_handshakes`. |
| Gossip Feed | `socialContentDomain` local array | `social_posts` | Store gossip posts with real author profile foreign keys in `social_posts`. |
| 1:1 Direct Chat | `VibeCenterView` local message array | `direct_messages` | Real Supabase realtime-backed chat messages between verified mutual matches. |
| Wallet & Shards | Local state transactions | `points_ledger`, `wallet_txs` | Double-entry ledger rows tracking all earned points and transferred assets. |

---

## 6. Development Rules & Operational Safety Protocol

1. **Verify Before Publishing**:
   - Always run `lint_applet` and `compile_applet` together before closing any turn.
   - Maintain zero syntax errors, missing imports, or undefined variable exceptions.
2. **Never Edit Files in Speculation**:
   - Only edit files directly involved in the assigned task.
   - Do not refactor stable working screens outside the scope of the user's specific request.
3. **Database Changes Direct in Supabase**:
   - Because Supabase does not accept auto-push from GitHub, never rely on automated git push migrations.
   - Maintain complete SQL statements in `supabase_schema.sql` or dedicated migration files for direct execution in Supabase.
4. **Preserve Button Styling & Colors**:
   - When rearranging or making containers responsive, always keep the accepted button colors (e.g. emerald `Follow Back`, rose/zinc `Unfollow`, emerald `Accept`, cyan `Chat`).

---
*End of VibeQuest Master Application Feature, Mechanics, Rules & Domain Reference.*
