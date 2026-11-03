# VIBEQUEST: ORIGINAL PRODUCT KNOWLEDGE RECOVERY & FEATURE CONTRACT AUDIT

**Document Title:** `VIBEQUEST_ORIGINAL_PRODUCT_KNOWLEDGE_RECOVERY.md`  
**Auditor Role:** Original Implementation Collaborator & System Architect  
**Target Audience:** Re-platforming Engineering Team & Product Leadership  
**Audit Scope:** Read-Only AST Source Code Inspection, Firestore Schemas, Historical Instructions, and Git Tree  
**Classification System:**
- `[IMPLEMENTED]`: Directly verified in source code.
- `[APPROVED REQUIREMENT]`: Formally instructed or approved by the Product Owner.
- `[PLANNED]`: Documented in specifications or roadmaps, but not implemented.
- `[CONTRADICTORY]`: Instructions or source code conflict.
- `[UNKNOWN]`: No reliable evidence found in the codebase or history.

---

## 1. EXECUTIVE FINDINGS

1. **A Real Dual-Personality Application:** VibeQuest was originally engineered as an ambitious hybrid of an **urban discovery platform** (curated multi-stop day trips, GPS-gated check-ins, local walking trails) and an **ephemeral social coordination network** (BeReal-style dual cameras, timed VibeChecks, 12 Wavelength chatrooms, and P2P meetup boards).
2. **The Standout Product Core:** The most distinctive, mature, and uniquely valuable product feature is the **Vibe Trails & Vibe Tours Engine** paired with the **Vibe Guardians & Handshake Proof System**. This completely replaces sterile TripAdvisor directories with real, human-curated circuits, verified in-person handshakes, and strict 111-character community proof.
3. **Storage & Persistence Architecture Fragmentation:** 
   - **Firestore** handles `vibe_trails`, core user documents, and social feed posts.
   - **`localStorage`** is heavily relied upon for authoritative business state, including `vq_vibe_guardians_directory_v2` (Guardian profiles), `vq_guardian_handshakes_proof_v2` (Handshake proofs), `vq_guardian_tour_reservations_v2` (Tour bookings), and `vq_ledger_activities` (Purse transactions).
   - **In-Memory Mock State** governs simulated camera feeds, P2P bot negotiations, and radar fallbacks.
4. **Data Contract Vulnerability (The `savedBy` Defect):** The historical crash on `TrailDetailModal.tsx:80` (`Cannot read properties of undefined (reading 'includes')`) was caused by schema drift where `trail.savedBy` was uninitialized in Firestore. The legacy fix was merely a defensive UI check (`Array.isArray(trail.savedBy)`), not a normalized database migration.
5. **Timer & Copy Contradictions:** Critical discrepancies exist between user-facing copy and hardcoded source timers:
   - *VibeCheck:* Advertised as a "5-minute response window"; enforced in code as a strict **33-second window** (`createdAt + 33000`).
   - *VibeFlash:* Advertised as a "3-minute window"; enforced in code as a strict **60-second window** (`windowStart + 60000`).

---

## 2. SOURCES ACTUALLY INSPECTED

| File Path | Nature / Responsibilities |
| :--- | :--- |
| `/src/screens/HomeScreen.tsx` | Daily exploration hub, feeds, flash banners, live activities/events |
| `/src/screens/ExploreScreen.tsx` | Discovery radar, OpenStreetMap Overpass queries, venue heatmap, proximity checks |
| `/src/screens/ShareGoodVibesScreen.tsx` | Dual-camera capture, VibeCheck/VibeFlash challenges, Paltalk room |
| `/src/screens/VibeScreen.tsx` | 6-environment social suite (Gossip, Drift, Vibes, Orbit, Echo, Pulls) |
| `/src/screens/CryptoScreen.tsx` | Purse digital balance, transaction ledger, P2P meetup board |
| `/src/screens/ProfileScreen.tsx` | Cultural passport stamps, tier status, personal settings |
| `/src/screens/AdminScreen.tsx` | Role-gated administrative analytics and diagnostic console |
| `/src/features/explore/components/VibeTrailsSection.tsx` | Dual-tab Vibe Trails vs Vibe Tours directory and filters |
| `/src/features/explore/components/CreateTrailModal.tsx` | 1,111-line multi-stop itinerary and tour specification builder |
| `/src/features/explore/components/TrailDetailModal.tsx` | 674-line full-screen trail immersion, stop steps, Google Maps link |
| `/src/features/explore/components/VibeGuardians/VibeGuardiansSection.tsx` | Directory tabs (Top Vibes, Pro Guardians, Local Legends, Suggested) |
| `/src/features/explore/components/VibeGuardians/services/vibeGuardianStorage.ts` | Handshake proof validation, review posting, reservations, 7-day selfie rules |
| `/src/features/explore/components/VibeGuardians/InAppSelfieModal.tsx` | 741-line in-app webcam verification, pricing controls, trail linkage |
| `/src/features/explore/components/VibeGuardians/HireGuardianForTrailModal.tsx` | Gated list of verified Pro Guardians attached to specific trails |
| `/src/features/explore/components/VibeGuardians/types.ts` | Canonical TypeScript data contracts for Guardians, Reviews, and Tours |
| `/src/features/explore/hooks/useVibeTrails.ts` | Firestore CRUD, seed itineraries, and trail adoption/remix counters |
| `/src/features/explore/hooks/useExploreRadar.ts` | Overpass API stepped-radius search (`[3000m, 10000m, 25000m]`) |
| `/src/lib/dualCameraUtils.ts` | Sequential camera frame switching (<400ms target) |
| `/src/native/vibeCheckService.ts` | VibeCheck state machine and 33-second expiration |
| `/src/native/vibeFlashService.ts` | VibeFlash spontaneous window and 60-second countdown |

---

## 3. COMPLETE ORIGINAL FEATURE INVENTORY

### 3.1 HOME & PERSONALIZED DISCOVERY
- **A. Original Purpose:** Provide the explorer’s morning command center, showing live neighborhood activities, friends' real-time check-ins, and active pop-up flash events.
- **B. Entry Points:** Bottom navigation tab 1 (`HomeScreen.tsx`).
- **C. User Interactions:**
  - Horizontal scroll of active check-ins (`VibeCheckInsScroll.tsx`).
  - Active Flash Event Alert banner (`HomeActiveAlertBanner.tsx`) with countdown timer, "Hunt Now", and "Spawn Flash".
  - Home Feed tabs (`My Network | Local Vibes | For You`) placed directly between Flash Alerts and Live Activities, capped at 5 posts with an "Expand Feed" toggle.
  - Live Activities Panel (Emerald green) with "Live Now" vs "Upcoming" tabs and "+ Boost Resonance" button.
  - Live Events Panel (Electric blue) with business-hosted events, RSVP button, and star ratings.
  - Daily Streak Quest card with "Claim Quest" (+20 VQ Points, +5 streak jump).
- **D. Business Rules:** Max 5 posts displayed on Home before requiring expansion. Flash events expire automatically. Resonance boost increments by 1.
- **E. Data Ownership:** Post feed belongs to `social_feed`; Flash events belong to `travel_experiences`; Streak points belong to `identity_auth.accounts`.
- **F. Persistence:** Feeds in Firestore (`social_posts`); Streak state in `localStorage` (`lastStreakDate`, `streakCount`).
- **G. Completion Status:** `[IMPLEMENTED]` (Functional UI, mixed Firestore/local persistence).

### 3.2 EXPLORE & GEOGRAPHICAL RADAR
- **A. Original Purpose:** Turn physical walking into a game, validating venues within 200m and searching local open-data spots without per-query commercial API fees.
- **B. Entry Points:** Bottom navigation tab 2 (`ExploreScreen.tsx`).
- **C. User Interactions:**
  - Waze-Style Proximity Banner triggered when `distance <= 0.20 km` (200m) with "Validate" button opening `ProximityValidator.tsx`.
  - Sensory Discovery Radar ping charging from 0% to 100%.
  - Google Map / Vis.gl Heatmap with category color-coded pins.
  - Dual-provider search input (Google Places & Mapbox Places autocomplete).
- **D. Business Rules:** Physical GPS within 200m required for venue validation. Stepped Overpass radii (`3000m -> 10000m -> 25000m`). Validation awards +15 PTS (confirmation) or +10 PTS (rejection).
- **E. Data Ownership:** Places belong to `travel_experiences.check_ins`; User scores belong to `user_profiles.profiles`.
- **F. Persistence:** Overpass queries run live on client; validation state stored in local React state.
- **G. Completion Status:** `[IMPLEMENTED]` (Functional radar, live Overpass queries, simulated scoring).

### 3.3 VIBE TRAILS & TOURS
- **A. Original Purpose:** Transform online travel guides into interactive, community-remixable itineraries that can be launched directly into Google Maps or booked with local guides.
- **B. Entry Points:** Explore screen ➔ `VibeTrailsSection.tsx`.
- **C. User Interactions:**
  - Switch between **Vibe Trails** (free circuits) and **Vibe Tours** (paid Pro Guardian experiences).
  - Tap trail card ➔ opens `TrailDetailModal.tsx` showing ordered stops, time badges (`🌅`, `☀️`, `🌇`, `🌙`), pro-tips, and "Start Full Day Route in Google Maps".
  - Tap "Adopt / Remix Trail" ➔ opens `CreateTrailModal.tsx` pre-loaded with parent stops.
  - Tap "Hire Pro Guide" ➔ opens `HireGuardianForTrailModal.tsx`.
- **D. Business Rules:** Detailed in Section 4.
- **E. Data Ownership:** Canonical trails in Firestore `vibe_trails`; parent adoption count increments automatically.
- **F. Persistence:** Fully persisted in Firebase Firestore.
- **G. Completion Status:** `[IMPLEMENTED]` (Fully operational with Firestore sync).

### 3.4 VIBE GUARDIANS & LOCAL LEGENDS
- **A. Original Purpose:** Direct human directory of vetted guides and passionate locals to explore with, eliminating competitive leaderboard rankings.
- **B. Entry Points:** Explore screen ➔ `VibeGuardiansSection.tsx`.
- **C. User Interactions:**
  - 4 Tabs: `Top Vibes` | `Pro Guardians` | `Local Legends` | `Suggested`.
  - Tapping Guardian card opens `GuardianDetailModal.tsx` with bio, hourly/flat rates, 5 attached trails, reviews, and Handshake proof badge.
  - "Message" button opens direct chat with "This is a Vibe Guardian chat" header.
  - "Hire" / "Vibe" triggers official Handshake confirmation.
- **D. Business Rules:** Detailed in Section 4.
- **E. Data Ownership:** `user_profiles.profiles` and `user_profiles.handshakes`.
- **F. Persistence:** `localStorage` (`vq_vibe_guardians_directory_v2`, `vq_guardian_handshakes_proof_v2`).
- **G. Completion Status:** `[IMPLEMENTED]` (Functional UI, state persisted in local browser storage).

### 3.5 SHARE GOOD VIBES & LIVE CAMERA
- **A. Original Purpose:** Spontaneous BeReal-style dual photo captures and low-friction community circles.
- **B. Entry Points:** Bottom navigation center elevated button (`ShareGoodVibesScreen.tsx`).
- **C. User Interactions:**
  - Dual-camera trigger: sequential rear-then-front capture.
  - Canvas cyberpunk fallback when camera denied.
  - VibeCheck challenge dispatcher.
  - Paltalk-style voice chatroom with 9 soundboard buttons, mic recording visualizer, and host moderation.
- **D. Business Rules:** Camera switch sequence target `<400ms`. VibeCheck window expires in 33 seconds. VibeFlash expires in 60 seconds.
- **E. Data Ownership:** Media metadata belongs to `core_media`; challenge states belong to `social_feed`.
- **F. Persistence:** Local storage & transient React state.
- **G. Completion Status:** `[IMPLEMENTED]` (Overloaded single-file architecture, functional camera switching).

### 3.6 VIBE: 6-ENVIRONMENT SOCIAL SUITE
- **A. Original Purpose:** Multi-frequency social graph allowing travelers to tune into different social wavelengths.
- **B. Entry Points:** Bottom navigation tab 4 (`VibeScreen.tsx` ➔ `VibeCenterView.tsx`).
- **C. User Interactions:**
  - 6 Tabs: `Gossip`, `Drift`, `Vibes`, `Orbit`, `Echo`, `Pulls`.
  - Drift: 12 category frequencies (*Chill, Sweat, Lounge, Brain, Sunset, Mellow, Echo, Zen, Groove, Pixel, Quest, Wander*).
  - Vibes: mutual match list resulting from completed challenges.
- **D. Business Rules:** Gossip only shows posts from followed IDs, mutual matches, or self.
- **E. Data Ownership:** Follows belong to `user_profiles.follows`.
- **F. Persistence:** In-memory mock profiles and local storage.
- **G. Completion Status:** `[IMPLEMENTED]` (Rich interactive UI, simulated matchmaking).

### 3.7 PURSE & P2P MARKETPLACE
- **A. Original Purpose:** Non-commercial token ledger for rewarding real-world exploration and enabling local cash/crypto meetups.
- **B. Entry Points:** Bottom navigation tab 5 (`CryptoScreen.tsx` ➔ `CryptoDashboard.tsx`).
- **C. User Interactions:**
  - Displays $VQ Points balance (default 1250).
  - "Send VQ" modal with recipient handle and amount.
  - Classifieds board for Buy/Sell offers with simulated trade negotiation chat.
- **D. Business Rules:** Transfers deduct immediately from local balance.
- **E. Data Ownership:** Ledger belongs to `identity_auth.accounts`.
- **F. Persistence:** `localStorage` (`vq_ledger_activities`). No on-chain Web3 settlement.
- **G. Completion Status:** `[IMPLEMENTED]` (Simulated ledger and chat bots).

### 3.8 ADMIN & MODERATION
- **A. Original Purpose:** Platform diagnostics, user role assignment, and moderation queue.
- **B. Entry Points:** Slide-out Profile Sidebar ➔ "System Admin Dashboard" (`AdminScreen.tsx`).
- **C. User Interactions:** Recharts user growth graphs, Firestore collection inspector, role toggle.
- **D. Business Rules:** Gated by `profile.role === 'admin' || profile.accountType === 'admin'`.
- **E. Persistence:** Firebase Firestore admin queries.
- **F. Completion Status:** `[IMPLEMENTED]` (Functional role guard and metrics).

---

## 4. DEEP INVESTIGATION — VIBE TRAILS, TOURS, AND GUARDIANS

### 4.1 VIBE TRAILS CONTRACT
- **Who can create a Trail?** `[IMPLEMENTED]` Any signed-in user, including regular explorers and Local Legends (`useVibeTrails.ts:410`).
- **Trail Structure:** A trail consists of:
  - Top-level metadata: `name`, `story`, `city`, `category`, `vibeTags`, `imageUrl`, `latitude`, `longitude`, `authorId`, `authorName`, `savesCount`, `savedBy[]`, `adoptionsCount`, `totalStops`, `totalEstimatedMinutes`.
  - Ordered stops array: `stops: TrailStop[]`.
- **Stop Attributes:**
  - `id`: Unique identifier (`stop_${timestamp}_${rand}`).
  - `order`: 1-based sequential integer (`idx + 1`).
  - `placeName`: Name of the landmark/venue.
  - `address`: Street or district address.
  - `lat`, `lng`: WGS84 coordinates.
  - `timeOfDay`: Enum (`morning`, `afternoon`, `sunset`, `night`, `anytime`).
  - `suggestedDurationMin`: Estimated dwell time in minutes (default 60 min).
  - `proTip`: Insider secret from curator.
  - `category`: Venue category tag (`Café`, `Viewpoint`, `Culture`, etc.).
  - `photoUrl`: Optional stop photo.
- **Adoption & Remixing:** When a user adopts a trail, `forkedFromTrailId` and `forkedFromAuthorName` are recorded, and the parent trail's `adoptionsCount` is incremented via `updateDoc(docRef, { adoptionsCount: increment(1) })`.
- **External Maps Launch:** `TrailDetailModal.tsx` synthesizes a universal Google Maps URL passing `origin` (first stop), `destination` (last stop), and `waypoints` (all intermediate stops).

### 4.2 VIBE TOURS CONTRACT
- **What distinguishes a Tour from a Trail?** `[IMPLEMENTED]` A Tour is a **paid, bookable guided experience** offered exclusively by a Pro Guardian. It features TripAdvisor-style specifications:
  - `tourTitle`: Commercial title.
  - `about`: Long-form tour narrative.
  - `duration`: Formatted duration (e.g. `6h`).
  - `price`: Advance flat rate (e.g. `$85`).
  - `meetingPoint`: Pickup or meeting location.
  - `whatsIncluded`: Array of inclusions (private car, guide, tickets, snacks).
  - `languages`: Array of spoken languages.
  - `ages`: Age suitability (e.g. `All ages (0-99)`).
  - `accessibilityNotes`: Mobility notes.
  - `whatToExpect`: Structured expectations.
  - `cancellationPolicy`: Standard policy (e.g. `Free cancellation up to 24h before`).
  - `startTimeNote`: Departure time guidelines.
  - `availableDates`: Array of bookable slots.
- **Creation Privilege:** `[IMPLEMENTED]` Only users where `isUserProGuardian()` evaluates to true see the "Label this as a Tour" checkbox (`CreateTrailModal.tsx:525`). Regular explorers and Local Legends never see this option.
- **Booking State Machine:** `[IMPLEMENTED]` Handled in `vibeGuardianStorage.ts:198`:
  - `requestTourReservation()` creates a record with `status: 'accepted'`.
  - It **automatically executes `recordHandshake(guardianId, userId)`**, instantly granting Handshake proof upon booking.

### 4.3 PRO GUARDIANS VS. LOCAL LEGENDS
- **Verification Rule:** `[IMPLEMENTED]` Both types must capture a live photo using the in-app webcam (`InAppSelfieModal.tsx`). Gallery uploads are blocked.
- **7-Day Selfie Expiration:** `[IMPLEMENTED]` `isSelfieExpired()` checks `Date.now() - capturedTime > 604,800,000 ms`. If expired, the live badge turns red, days remaining shows 0, and the Guardian is **disqualified from Hire suggestions**.
- **Pricing Enforcement:** `[IMPLEMENTED]` Pro Guardians must select **one option only, never both**:
  - *Option A (Hourly):* e.g. `$35/hour`.
  - *Option B (Flat):* e.g. `$85 flat tour`.
  - Local Legends **never charge** (`hourlyRate` and `flatRate` are undefined).
- **Hire Visibility on Trails:** `[IMPLEMENTED]` `HireGuardianForTrailModal.tsx` filters guardians strictly by:
  ```ts
  g.type === 'pro' && 
  g.hasActiveProSubscription && 
  !isSelfieExpired(g) && 
  g.showInHireSuggestions !== false
  ```
- **Attached Trails Limit:** `[IMPLEMENTED]` Guardians can attach up to 5 trails to their card (`trails.length >= 5` disables the `(+ Trail)` button). Public cards display **only** the Trail Title + a small green "Explore now" button; full trail content is never displayed on the card.

### 4.4 HANDSHAKE PROOF & REVIEW RULES
- **What creates a Handshake?** `[IMPLEMENTED]`
  1. Tapping **"Hire"** on a Pro Guardian card.
  2. Tapping **"Vibe"** on a Local Legend card.
  3. Booking a Tour Reservation via `requestTourReservation()`.
- **Review Gating:** `[IMPLEMENTED]` `addReviewToGuardian()` checks `hasUserHandshake(guardianId, userKey)`. If no handshake is found, the submission errors out with: `"Handshake proof required: You must hire (for Pro) or vibe with (for Local) this guardian before leaving a review."`
- **Review Constraints:** `[IMPLEMENTED]`
  - Maximum note length: **111 characters** (`maxLength={111}` in `GuardianDetailModal.tsx:547`).
  - Badge selection: Strictly restricted to **one badge** from:
    - `Good Vibe`
    - `Chill Vibe`
    - `Cool Vibe`

---

## 5. ORIGINAL CROSS-FEATURE INTERACTIONS & DEPENDENCIES

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ORIGINAL CROSS-FEATURE TRACE MATRIX                  │
├───────────────────────┬──────────────────────┬─────────────────────────┤
│ JOURNEY               │ IMPLEMENTATION PATH  │ STATUS & RUNTIME REALITY│
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 1. Feed Post ➔ Profile│ `FacebookVibePostCard`│ [PARTIAL] Opens profile │
│    ➔ Follow ➔ Feed    │ ➔ `ProfileScreen`    │ drawer; feed re-queries │
│                       │ ➔ updates follow set │ via React state.        │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 2. Feed Post ➔ Place  │ `HomeFeedTabs`       │ [PARTIAL] Coordinates   │
│    ➔ Explore ➔ Trail  │ ➔ `PlaceDetailModal` │ passed in router params;│
│                       │ ➔ switches tab       │ opens TrailDetailModal. │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 3. Trail ➔ Hire Guide │ `TrailDetailModal`   │ [REAL] Opens modal,     │
│    ➔ Message ➔ Shake  │ ➔ `HireGuardianModal`│ attaches trail title,   │
│    ➔ Review           │ ➔ `GuardianChatModal`│ awards handshake proof, │
│                       │ ➔ `addReview`        │ unlocks 111-char review.│
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 4. Tour ➔ Reserve     │ `TrailDetailModal`   │ [REAL LOCAL] Books slot,│
│    ➔ Auto-Handshake   │ ➔ `ReservationModal` │ auto-grants handshake,  │
│    ➔ Confirmation     │ ➔ `vibeGuardianStore`│ writes to localStorage. │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 5. Proximity Alert    │ GPS position update  │ [REAL CLIENT] Haversine │
│    ➔ GPS Validate     │ ➔ distance <= 200m   │ calculation triggers    │
│    ➔ Claim Mayorship  │ ➔ `ProximityValidator`│ sheet; increments pts.  │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 6. Dual-Camera Shoot  │ `LiveCameraFeatures` │ [REAL HARDWARE/CANVAS]  │
│    ➔ VibeCheck Post   │ ➔ `dualCameraUtils`  │ Rear-to-front canvas    │
│    ➔ Feed Display     │ ➔ `useVibeCheck`     │ capture; 33s timeout.   │
├───────────────────────┼──────────────────────┼─────────────────────────┤
│ 7. Purse P2P Trade    │ `CryptoDashboard`    │ [MOCKED] Trade chat is  │
│    ➔ Chat Negotiation │ ➔ classifieds modal  │ scripted with automated │
│    ➔ Point Deduction  │ ➔ simulated bot reply│ mock responses.         │
└───────────────────────┴──────────────────────┴─────────────────────────┘
```

---

## 6. ORIGINAL USER AND DATA LIFECYCLES

### 6.1 Guardian Verification Lifecycle
```
[Unverified User] 
       │
       ▼
[Launches InAppSelfieModal] ───► Captures Live Webcam Stream (No Gallery)
       │
       ▼
[Records Timestamp] ───────────► `selfieCapturedAt = ISO_DATE`
       │
       ├─────────────────────────────────┐
       ▼ (Day 1 to 7)                    ▼ (Day 8+)
[Status: ACTIVE]                  [Status: EXPIRED]
- Appears in Directory            - Red Warning Badge
- Eligible for Hire Suggestions   - Hidden from Hire Suggestions
                                  - Must Retake Live Selfie
```

### 6.2 Handshake Proof & Review Lifecycle
```
[User Discovers Guardian]
       │
       ▼
[Taps 'Hire' or 'Vibe' or Books Tour] ──► `recordHandshake(guardianId, userId)`
       │
       ▼
[Official Proof Awarded] ────────────────► Black Handshake Icon (🤝) Displayed
       │
       ▼
[Review Form Unlocked] ──────────────────► Max 111 chars + 1 Vibe Badge
                                           (Good Vibe / Chill Vibe / Cool Vibe)
```

---

## 7. HISTORICAL PRODUCT OWNER DECISIONS & EVIDENCE

| Original Requirement | Evidence / Source Path | Status | Affected Features | Ambiguities / Open Items |
| :--- | :--- | :--- | :--- | :--- |
| **Replace Leaderboard with Guardians** | Prompt #4; `VibeGuardiansSection.tsx` | `[IMPLEMENTED]` | Explore, Guardians | Old ranking scores still present in legacy `ExploreScreen` radar. |
| **Handshake Proof Requirement** | Prompt #5; `vibeGuardianStorage.ts:121` | `[IMPLEMENTED]` | Reviews, Guardians | Does tapping "Hire" without guide confirmation count as proof? |
| **Max 5 Trails on Guardian Cards** | Prompt #5; `vibeGuardianStorage.ts:168` | `[IMPLEMENTED]` | Guardians, Trails | What happens if an attached trail is deleted from Firestore? |
| **Strict Pro Upfront Pricing** | Prompt #5; `InAppSelfieModal.tsx:427` | `[IMPLEMENTED]` | Guardians | Option A (Hourly) vs Option B (Flat). Never both. |
| **7-Day Selfie Expiration** | Prompt #4, #5; `vibeGuardianStorage.ts:9` | `[IMPLEMENTED]` | Verification, Selfie | Does expiration completely hide profile or only disable hire? |
| **Max 111 Chars + 1 Badge Review** | Prompt #4, #5; `GuardianDetailModal.tsx` | `[IMPLEMENTED]` | Reviews | Only 3 badges allowed: Good Vibe, Chill Vibe, Cool Vibe. |
| **TripAdvisor Tour Specifications** | Prompt #8; `CreateTrailModal.tsx:862` | `[IMPLEMENTED]` | Vibe Tours | Who handles refunds if a tour is canceled? |
| **Home Feed Placement** | Prompt #3; `HomeScreen.tsx` | `[IMPLEMENTED]` | Home Feed | Placed between Flash Alert and Live Activities; max 5 posts. |

---

## 8. FEATURE IMPLEMENTATION STATUS: REAL VERSUS MOCK

| Feature Component | Implementation Reality | Underlying Mechanism |
| :--- | :--- | :--- |
| **Vibe Trails CRUD** | **REAL BACKEND** | Firebase Firestore collection `vibe_trails` |
| **Trail Adoption / Forking** | **REAL BACKEND** | Firestore `adoptionsCount` increment + ID linkage |
| **Google Maps Multi-Stop Handoff**| **REAL INTEGRATION**| Native URL query string with waypoints |
| **Overpass Radar Search** | **REAL EXTERNAL API**| Live HTTP queries to OpenStreetMap Overpass API |
| **Dual-Camera Capture** | **REAL HARDWARE** | `navigator.mediaDevices.getUserMedia` + Canvas |
| **Vibe Guardians Directory** | **BROWSER LOCALSTORAGE**| `localStorage.getItem('vq_vibe_guardians_directory_v2')` |
| **Handshake Proof System** | **BROWSER LOCALSTORAGE**| `localStorage.getItem('vq_guardian_handshakes_proof_v2')` |
| **Tour Reservations Calendar** | **BROWSER LOCALSTORAGE**| `localStorage.getItem('vq_guardian_tour_reservations_v2')` |
| **Direct Guardian Chat** | **BROWSER LOCALSTORAGE**| `localStorage.getItem('vq_vibe_guardian_chat_<id>')` |
| **Purse / Crypto Balance** | **SIMULATED LOCAL** | In-memory count + local ledger; no Web3 RPC |
| **P2P Meetup Trading** | **SIMULATED MOCK** | Automated bot chat responses |

---

## 9. ORIGINAL TECHNICAL DEFECTS AND LIMITATIONS

### 9.1 The `trail.savedBy` Runtime Crash
- **Observed Defect:** `TypeError: Cannot read properties of undefined (reading 'includes') at TrailDetailModal.tsx:80`.
- **Source Evidence:**
  ```ts
  // Prior vulnerable line in TrailDetailModal.tsx:
  const isSaved = userId && trail.savedBy.includes(userId);
  ```
- **Root Cause:** Firestore documents and mock seed items created before `savedBy` was added did not possess the `savedBy` array field. When read, `trail.savedBy` evaluated to `undefined`.
- **Legacy Correction Status:** Fixed via defensive UI checks (`Array.isArray(trail.savedBy) ? trail.savedBy.includes(userId) : false`) and normalizing the field in `useVibeTrails.ts:361`. **No database migration was executed to backfill existing documents.**

### 9.2 Other Architectural Defects
1. **Authoritative State in `localStorage`:** If a user switches browsers or clears cache, their Handshakes, Reviews, Tour Bookings, and Guardian listing are wiped out.
2. **Timer Discrepancies:**
   - VibeCheck advertises "5-min live response" ➔ Code sets `createdAt + 33000` (33s).
   - VibeFlash advertises "3-min window" ➔ Code sets `windowStart + 60000` (60s).
3. **Monolithic Component File Size:**
   - `CreateTrailModal.tsx`: 1,111 lines combining itinerary info, dynamic stops, and tour specs.
   - `ShareGoodVibesScreen.tsx`: 1,155 lines combining camera, BeReal challenges, donations, and audio chat.

---

## 10. MISSING OR AMBIGUOUS BEHAVIORS

1. **Handshake Asymmetry:** When User A taps "Hire" on Guardian B, the handshake is immediately awarded to User A. There is no acceptance step required by Guardian B.
2. **Payment Escrow & Settlement:** Tour prices are defined in advance (e.g. `$85 flat`), but the app has no payment processing gateway (Stripe/PayPal) or escrow mechanism.
3. **Selfie Expiration Notification:** When a selfie expires after 7 days, no push or in-app notification alerts the Guardian; they simply drop out of hire suggestions silently.

---

## 11. UNIQUE FUNCTIONALITY THAT MUST BE PRESERVED

1. **Curated Multi-Stop Vibe Trails with Time Badges:** The sequence of stops labeled by time of day (`🌅 Morning` ➔ `☀️ Afternoon` ➔ `🌇 Sunset` ➔ `🌙 Night`) with curator pro-tips.
2. **One-Tap Google Maps Route Handoff:** Passing origin, destination, and ordered waypoints directly into native turn-by-turn navigation.
3. **Community Trail Adoption ("Forking"):** Allowing users to clone a route, append new stops, and preserve attribution to the original curator.
4. **In-App Live Selfie Verification (7-Day Validity):** Requiring webcam capture to guarantee real, current guide photos.
5. **Handshake Proof of Interaction:** Gating reviews strictly behind verified interactions.
6. **Strict 111-Character + 1-Badge Reviews:** Short, impactful community notes tagged with exactly one badge (`Good Vibe`, `Chill Vibe`, `Cool Vibe`).

---

## 12. EVIDENCE INDEX WITH EXACT SOURCE PATHS

- **Handshake Storage & Gating:** `/src/features/explore/components/VibeGuardians/services/vibeGuardianStorage.ts:64-155`
- **Review Character Limit (111 Chars):** `/src/features/explore/components/VibeGuardians/GuardianDetailModal.tsx:547`
- **7-Day Selfie Expiration Constant:** `/src/features/explore/components/VibeGuardians/services/vibeGuardianStorage.ts:9-26`
- **Pro Guardian Pricing Rules:** `/src/features/explore/components/VibeGuardians/InAppSelfieModal.tsx:427-502`
- **Tour Creation Privilege Guard:** `/src/features/explore/components/CreateTrailModal.tsx:96-99, 525-583`
- **Google Maps Navigation Deep Link:** `/src/features/explore/components/TrailDetailModal.tsx:210-230`
- **Trail Adoption Firestore Increment:** `/src/features/explore/hooks/useVibeTrails.ts:468-477`
- **Overpass Stepped Radars:** `/src/features/explore/hooks/useExploreRadar.ts:50-75`
- **Waze Proximity Threshold (200m):** `/src/screens/ExploreScreen.tsx:120-135`
- **Dual-Camera Switching Algorithm:** `/src/lib/dualCameraUtils.ts:35-85`

---

## 13. QUESTIONS REQUIRING CLARIFICATION FROM THE PRODUCT OWNER

1. **Handshake Confirmation Policy:** Should a Handshake be created instantly when a traveler taps "Hire", or should it require two-way confirmation / check-in scanning by the Guardian?  
   *(Impacts: Handshake credibility and review anti-spam integrity).*
2. **Tour Financial Settlement:** Should the new platform integrate Stripe for payment capture and host payouts, or remain a peer-to-peer cash handshake protocol?  
   *(Impacts: Reservation state machine and financial liability).*
3. **Timer Standard:** Should VibeCheck and VibeFlash timers be aligned with their advertised UI copy (5 min / 3 min) or maintain the high-urgency code implementation (33s / 60s)?  
   *(Impacts: User experience in spontaneous camera challenges).*
4. **Selfie Expiration Scope:** When a Guardian's 7-day selfie expires, should their profile be completely hidden from the directory, or stay visible with a disabled "Hire" button?  
   *(Impacts: Guardian directory retention and searchability).*
