# VIBEQUEST ORIGINAL PRODUCT & MECHANICS MASTER REFERENCE
**Document Version:** 1.0.0-PROD-ARCHAEOLOGY  
**Extraction Mode:** Read-Only Source & Runtime Inspection  
**Target Audience:** Re-platforming Architecture & Engineering Teams  

---

## 1. SOURCE & PREVIEW ACCESS REPORT

- **Project Root:** `/` (Vite + React 18 + TypeScript SPA, Tailwind CSS)
- **Application ID:** `b92467b3-0400-4b07-9f17-ce3f2e3e68ac`
- **Application Name:** `VibeQuest` (`metadata.json`, `index.html`)
- **Inspection Methodology:** Complete AST and line-by-line inspection of all source files in `/src`, configuration files, and Firestore schemas.
- **Hardware Limitations Observed:**
  - Physical camera hardware cannot be physically triggered in remote headless container; inspection verified `navigator.mediaDevices.getUserMedia` calls, canvas fallback synthesis, and sequential switching algorithms.
  - Physical GPS sensor is simulated/emulated via `navigator.geolocation` or IP/city defaults (`Tunis, Tunisia` / `San Francisco, CA`), backed by `GeolocationProvider`.
  - Financial/cryptocurrency settlement is non-custodial and operates via local state and in-memory mock classification without on-chain Web3 smart contracts or banking payment gateways.

---

## 2. EXECUTIVE PRODUCT DESCRIPTION

**VibeQuest** is an urban exploration, social radar, and culture discovery platform designed to "transform from tourist to temporary local." It merges:
1. **Hyper-Local Discovery & Sonar Radars:** Searching within 200m to 25km radii using OpenStreetMap Overpass API and Google Places API, calculating on-device Haversine distances to classify venues into Rarity Tiers (Common, Rare, Legendary) and awarding gamified $VQ Points.
2. **Spontaneous Social Coordination:** "Find Hub" social proximity lock-on with geofencing arrive/leave alerts; Flash Events & Secrets Boards with live countdown timers.
3. **Live Camera & Dual-Sensor Challenges:** BeReal-style dual-camera captures (<400ms front/back switch), time-bounded VibeChecks, and spontaneous VibeFlashes.
4. **Multi-Wavelength Social Graph:** A 6-environment social suite (Gossip, Drift, Vibes, Orbit, Echo, Pulls) with 12 distinct Wavelength frequencies and real-time chatrooms featuring voice recordings, soundboards, and moderation controls.
5. **In-App Token Economy & P2P Classifieds:** Daily streaks, point-earning check-ins, P2P meetup trade boards, and personal digital wallets.

---

## 3. FULL NAVIGATION & PAGE HIERARCHY

### Primary Bottom Navigation Bar (`Shell.tsx`)
1. **HOME** (`/src/screens/HomeScreen.tsx`)
2. **EXPLORE** (`/src/screens/ExploreScreen.tsx`)
3. **SHARE** (`/src/screens/ShareGoodVibesScreen.tsx`) — Centered elevated action trigger
4. **VIBE** (`/src/screens/VibeScreen.tsx` -> `VibeCenterView.tsx`)
5. **PURSE** (`/src/screens/CryptoScreen.tsx` -> `CryptoDashboard.tsx`)

### Persistent Header & Secondary Overlays (`Shell.tsx`)
- **Cybernetic Smiley Brand Flag:** Resets navigation to `Home`
- **Location Pin Indicator:** Triggers transition to `Explore` with resolved city label
- **Theme Quick Toggle:** Switches between `Warm Cream Theme` (Light) and `Midnight Neon Theme` (Dark)
- **Profile Avatar Console Trigger:** Slides out `ProfileSidebar.tsx` (Twitter/X style drawer)
- **Direct Messages Overlay Portal:** Triggered via custom event `open-direct-messages` -> `MessageModal.tsx`

### Profile Sidebar Navigation (`ProfileSidebar.tsx`)
- Voyager Console / Profile details & VQ Points level
- Connect Simulated Explorer Stamp key
- Theme selector (`Swarm Mode` vs `Cyber Mode`)
- Direct Messages shortcut (3 unread indicator)
- Live Alert Center notification shortcut (6 active indicator)
- Local Device AI Settings (Ollama `http://localhost:11434` connection test)
- Language Switch Dropdown (7 languages: EN, JA, FR, AR, ES, PT, ZH)
- System Admin Dashboard button (routes to `admin` -> `AdminScreen.tsx`)
- Device Settings & Oracle Help dialogs
- Terminate Session (`logout()`)

---

## 4. HOME: COMPLETE FEATURE INVENTORY

### Vertical Section Hierarchy (`HomeScreen.tsx`)
1. **Persistent Header:** City Name button (with yellow pin `#eab308`), search trigger, user avatar capsule with VIBE ID badge.
2. **Vibe Check-Ins Horizontal Scrollbar (`VibeCheckInsScroll.tsx`):**
   - Active user vibe card (`currentVibe`)
   - Friends' & mutuals' recent check-ins (`venueCards`)
3. **Flash Event Active Alert Banner (`HomeActiveAlertBanner.tsx`):**
   - Renders live countdown alerts for active secrets/pop-up events.
   - Buttons: `Hunt Now` (opens `HomeFlashListModal`) and `Spawn Flash` (opens `HomeCreateFlashModal`).
4. **Live Activities Panel (`LiveActivitiesPanel.tsx`):**
   - Style: Deep Emerald Green (`#031d10`, border `#0d5330`).
   - Tabs: `Live Activities` vs `Upcoming Activities`.
   - Purpose: Organic, non-commercial explorer loops and neighborhood assemblies.
   - Controls: Boost Resonance (+1 resonance score), Add Activity Inline, Rate & Review drawer.
5. **Live Events Panel (`LiveEventsPanel.tsx`):**
   - Style: Deep Electric Blue (`#081022`, border `#1d4ed8`).
   - Tabs: `Live Now` vs `Upcoming Events`.
   - Purpose: Official, business-hosted events (Music, Culture, Nightlife).
   - Controls: RSVP toggle (`rsvpedEvents`), Host Event Inline form (Business attribution), Rating stars (1-5), Directions button (`openDeviceMap`).
6. **Geolocation Quest Consoles (3-Card Grid):**
   - **Daily Streak Quest (`DailyStreakQuest.tsx`):** Displays day count (`streakCount`), Claim button (+20 VQ points, 5-day jump simulation).
   - **Discovery Radar Panel (`DiscoveryRadarPanel.tsx`):** Radar ping sonar trigger, Google Places API SearchNearby integration (10km radius), Rarity tags.
   - **Find Hub Launcher Card:** Proximity radar launch button leading to `FindHubModal.tsx`.
7. **Home Feed Tabs (`HomeFeedTabs.tsx`):**
   - Tabs: `My Network`, `Local Vibes`, `For You`.
   - Actions: Like post (heart animation), Comment drawer with persistent input.
8. **Curated Coordinates Bar (`HomeCuratedCoordinates.tsx`):**
   - Historical landmark badges (e.g. Medina Alley, Bab El Bhar).
   - Claim status and point rewards.
9. **Local Gems Card:**
   - Featured venues: *Sightglass Coffee Courtyard*, *Clarion Alley Art Block*, *Local Tealicious Garden*.
   - Expandable details: Vibe descriptor, Opening hours, Save to favorites, Navigate, Launch interactive signal scanner.
10. **VIBE Guide Card:** Opens `CommunityHandbookModal.tsx` for gamified leveling checklist.
11. **Live Feed System Banner:** Toggle between GPS city feed and global feed, Open Live Feed modal.

---

## 5. EXPLORE: COMPLETE FEATURE INVENTORY

### Components & Mechanics (`ExploreScreen.tsx`)
1. **Waze-Style Proximity Alert Banner:**
   - Threshold: Triggers automatically when `closestVenue.distance <= 0.20 km` (200m).
   - Actions: `Validate` (opens `ProximityValidator.tsx`), Dismiss `✕`.
2. **Search & Dual Autocomplete Bar:**
   - Multi-provider suggestions: Google Places & Mapbox Places autocomplete chips.
   - Filters: `All`, `Food`, `cafés`, `Culture`, `Art`, `Venues`, `Hidden`.
3. **Interactive Venue Heatmap (`VenueHeatmap.tsx`):**
   - Renders Google Map / Vis.gl markers for venues and flash events.
   - Live marker selection, category color-coding, and custom pin overlays.
4. **Discovery Radar Card:**
   - Charge meter (0% to 100%). PING button enabled only at 100%.
   - Overpass API query: Stepped search radii `[3000m, 10000m, 25000m]` with fallback generator.
5. **Vibe Guardian Leaderboard:**
   - City-wide validation node rankings.
   - Scoring: +15 PTS for confirmation, +10 PTS for rejection.
6. **Vibe Trails Hub (`VibeTrailsSection.tsx`):**
   - Firestore-backed curated walking routes (`vibe_trails` collection).
   - Trail details: Story, category, vibe tags, author handle, save count.
   - Create Trail modal: custom photo, coordinates, tags, and story.
7. **Venue Detail Bottom Sheet (`VenueDetailSheet.tsx`):**
   - Photo gallery, confidence rating, check-in validation button, external navigation link.

---

## 6. SHARE: CAMERA & SOCIAL CHALLENGE MECHANICS

### Dual-Camera & Live Capture (`LiveCameraFeatures.tsx`, `VibePhotoCapture.tsx`, `dualCameraUtils.ts`)
- **Device Enumeration:** Scans `navigator.mediaDevices.enumerateDevices()` to separate `frontDeviceId` and `backDeviceId`.
- **Sequential Capture Sequence:**
  1. Capture rear/environment video frame to canvas (`image/jpeg`, 0.85).
  2. Stop active stream tracks immediately to free hardware locks.
  3. Instantiate front/selfie stream with facingMode `'user'`.
  4. Wait 250ms for camera sensor gain/exposure settle.
  5. Capture front frame to canvas.
  6. Return composite `{ backPhoto, frontPhoto, timestamp }`. Total switch target: `< 400ms`.
- **Fallback Simulation Engine:** If hardware access is blocked or unavailable, animates a cyberpunk avatar canvas with procedural vector eyes and grid lines.
- **Video Recording Mode:** Canvas `captureStream(30)` via `MediaRecorder` (`video/webm` or `video/mp4`), max 10 seconds with tick timer.

### Challenge Protocols & Deadlines
- **VibeCheck (`useVibeCheck.ts`, `vibeCheckService.ts`):**
  - UI Advertised: "5-min live response"
  - Source Implementation: `createdAt + 33000` (Strict 33-second window)
  - States: `pending` -> `responded` | `ghosted` | `confirmed`
  - Reactions: `fire` 🔥, `cap` 🧢, `vibing` ✨
- **VibeFlash (`useVibeFlashWindow.ts`, `vibeFlashService.ts`):**
  - UI Advertised: "3-min window" ("03:00")
  - Source Implementation: `windowStart + 60000` (Strict 60-second window)
  - States: `active` -> `responded` | `denied` | `expired`

### Paltalk-Style Community Chatroom (`PaltalkChatroom.tsx`)
- **Soundboard System (`SoundboardGrid.tsx`):** 9 sound effects, synthetic melodies, cyber voice synthesizer.
- **Voice Messages (`VoiceActiveControls.tsx`):** Audio recording with real-time waveform visualization bars.
- **Member Presence & Roles (`LiveMembersHorizontalBar.tsx`):** Statuses (`online`, `away`, `busy`, `offline`), Host/AID badges.
- **Admin Moderation Panel (`AdminModerationPanel.tsx`):** Mute, Kick, Ban, Promote to AID, broadcast announcements.

---

## 7. VIBE: 6-ENVIRONMENT SOCIAL SYSTEM

Implemented in `VibeCenterView.tsx` with top quote by Rumi:
> “Out beyond ideas of wrongdoing and rightdoing, there is a field. I’ll meet you there.”

### Six Environments
1. **Gossip:** Chronological activity feed filtered strictly to posts from users you follow and mutual matches.
2. **Drift (`DriftView.tsx`):** 12 Wavelength frequencies:
   - *Chill Vibes* (`#2DD4BF`), *Sweat Vibes* (`#F43F5E`), *Lounge Vibes* (`#F59E0B`), *Brain Vibes* (`#8B5CF6`), *Sunset Vibes* (`#F97316`), *Mellow Vibes* (`#0EA5E9`), *Echo Vibes* (`#10B981`), *Zen Vibes* (`#22C55E`), *Groove Vibes* (`#EC7299`), *Pixel Vibes* (`#6366F1`), *Quest Vibes* (`#A855F7`), *Wander* (`#FB7185`).
3. **Vibes:** Mutual accepted matches resulting from completed VibeCheck challenges.
4. **Orbit:** Outgoing social graph — users currently followed.
5. **Echo:** Incoming social graph — users following the current user.
6. **Pulls:** Inbox of incoming pending challenge invitations with Accept/Ignore controls.

---

## 8. PURSE: WALLET & P2P MARKETPLACE

### Mechanics & Implementation Realities (`CryptoDashboard.tsx`)
1. **VQ Balance & Transfer:**
   - Displays accrued $VQ Points (default 1250).
   - "Send" modal deducts points from profile state and prepends an entry to the local transaction ledger.
2. **Transaction Ledger:**
   - Persisted in browser `localStorage` (`vq_ledger_activities`).
   - Categorized by `receive`, `quest`, `send`.
3. **P2P Trading Classifieds:**
   - Filter by: `All`, `Buy VQ`, `Sell VQ`.
   - Create Offer modal: Crypto type, amount, price, location, payment method.
   - Status: Local simulated board; no external on-chain escrow or payment gateway integration.
   - Negotiation Chat: Includes automated partner responses simulating physical meetups.

---

## 9. EXACT MECHANICS CATALOG (M001–M015)

| Mechanic ID | Feature Name | Source Path | Rules & Constants |
| :--- | :--- | :--- | :--- |
| **M001** | Dual-Camera Sequential Capture | `/src/lib/dualCameraUtils.ts` | Captures rear frame -> stops stream -> starts user frame -> 250ms delay -> captures front frame. Max delay < 400ms. |
| **M002** | VibeCheck Challenge Timer | `/src/native/vibeCheckService.ts` | Enforces `createdAt + 33000` (33s). UI displays 5 min. Expired checks transition to `ghosted`. |
| **M003** | VibeFlash Window Timer | `/src/native/vibeFlashService.ts` | Enforces `windowStart + 60000` (60s). UI displays 3 min. Expired flashes transition to `expired`. |
| **M004** | Waze Proximity Alert | `/src/screens/ExploreScreen.tsx` | Trigger condition: `distance <= 0.20 km` (200m). Triggers validation sheet. |
| **M005** | Discovery Radar Rarity | `/src/features/home/hooks/useHomeRadar.ts` | `>1500` reviews = Legendary (👑, +150 pts); `>300` reviews = Trending (📈, +100 pts); `<=300` = Hidden (💎, +50 pts). Search radius: 10,000m. |
| **M006** | Overpass Stepped Radius | `/src/features/explore/hooks/useExploreRadar.ts` | Sequential radii: `[3000m, 10000m, 25000m]`. Distance tiers: `<0.5km` = 500pts; `0.5–2km` = 150pts; `>2km` = 25pts. |
| **M007** | Find Hub Geofencing | `/src/features/home/services/findHubService.ts` | Haversine distance in meters (`R=6371000m`). Triggers `arrive` or `leave` alert when boundary crossed. |
| **M008** | Daily Streak Quest | `/src/features/home/hooks/useHomeStreak.ts` | Streak increments by 5 on claim; awards +20 VQ Points. Stored in `lastStreakDate` & `streakCount`. |
| **M009** | Vibe Guardian Score | `/src/screens/ExploreScreen.tsx` | Confirmations: +15 PTS; Rejections: +10 PTS. |
| **M010** | Gossip Tab Filter | `/src/components/chat/VibeCenterView.tsx` | Displays only posts from followed IDs, mutual match IDs, or self. |
| **M011** | Drift Wavelength Match | `/src/components/chat/DriftView.tsx` | 12 category frequencies. Matches profile vibes and interest overlaps. |
| **M012** | Chatroom Soundboard | `/src/features/chatroom/hooks/useSoundboard.ts` | 9 sound effects with real-time broadcast and synth voice generator. |
| **M013** | Voice Message Recording | `/src/features/chatroom/hooks/useVoiceControls.ts` | MediaRecorder audio capture with 8-bar waveform amplitude visualizer. |
| **M014** | P2P Trade Simulation | `/src/features/crypto/components/CryptoDashboard.tsx` | In-memory trade negotiation chat with automated agent replies. |
| **M015** | Role-Gated Admin Metrics | `/src/features/admin/components/AdminConsole.tsx` | Requires `profile.role === 'admin' \|\| profile.accountType === 'admin'`. Fetches user & listing statistics. |

---

## 10. RECONSTRUCTION INVARIANTS & LEGACY DEFECTS

1. **Timer Discrepancies:**
   - *VibeCheck:* UI advertises 5 minutes; backend enforces 33 seconds. The new system must align product copy with actual backend configuration.
   - *VibeFlash:* UI advertises 3 minutes; backend enforces 60 seconds. Must be standardized.
2. **Simulated Financial Settlement:**
   - P2P marketplace and crypto transfers currently mutate local storage or Auth context points without cryptographic signatures. New system must use a transactional database ledger with ACID guarantees.
3. **Storage Fragmentation:**
   - Data is split across `localStorage`, mock repositories, and Firestore collections (`vibe_trails`, `social_posts`, `communities`). Clean architecture must unify all persistence behind typed domain APIs.
4. **Camera Hardware Fallbacks:**
   - Web canvas simulation must be separated cleanly from native camera streams (Capacitor/WebRTC).

---

## 11. FUNCTIONAL PARITY CHECKLIST

- **HOME-001:** Load location via GPS or fallback city (`useGeolocation`).
- **HOME-002:** Horizontal scroll of active vibe check-ins with user card.
- **HOME-003:** Active Flash Event alert banner with countdown timer.
- **HOME-004:** Live Activities panel with organic explorer assemblies and resonance boost.
- **HOME-005:** Live Events panel with business-hosted events, RSVP toggle, and ratings.
- **HOME-006:** Daily Streak claim (+20 VQ Points, +5 streak jump).
- **HOME-007:** Discovery Radar ping querying nearby places (10km).
- **HOME-008:** Find Hub modal with contact lock-on and arrive/leave geofencing.
- **HOME-009:** Home Feed tabs switching between My Network, Local Vibes, and For You.
- **EXPLORE-001:** Overpass radar search with stepped radii (3k, 10k, 25k).
- **EXPLORE-002:** Dual autocomplete search with Google and Mapbox providers.
- **EXPLORE-003:** Waze-style proximity banner when distance <= 200m.
- **EXPLORE-004:** Interactive heatmap rendering with venue pins.
- **EXPLORE-005:** Vibe Guardian leaderboard tracking validation ranks.
- **EXPLORE-006:** Vibe Trails community guide curation and creation.
- **SHARE-001:** Dual-camera capture (<400ms sequential switch).
- **SHARE-002:** Canvas-based simulated camera fallback.
- **SHARE-003:** 10-second video recording via MediaRecorder.
- **SHARE-004:** VibeCheck challenge dispatch and response verification.
- **SHARE-005:** VibeFlash spontaneous window countdown.
- **SHARE-006:** Paltalk-style chatroom with soundboard, mic recording, and moderation.
- **VIBE-001:** 6-environment tab navigation (Gossip, Drift, Vibes, Orbit, Echo, Pulls).
- **VIBE-002:** 12 Drift Wavelength categories with custom accents and descriptions.
- **VIBE-003:** Mutual matches list with inline chat thread launching.
- **PURSE-001:** VQ wallet balance and token send modal.
- **PURSE-002:** Interactive transaction ledger with cached history.
- **PURSE-003:** P2P classifieds buy/sell listings with meetup chat simulator.
- **PROFILE-001:** Profile drawer with Voyager class level and rank upgrade.
- **PROFILE-002:** 7-locale internationalization switcher.
- **PROFILE-003:** Local device AI endpoint connection tester (Ollama).
- **ADMIN-001:** Role-gated dashboard with platform metrics and Recharts analytics.
