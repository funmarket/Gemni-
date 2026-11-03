# VIBEQUEST — ORIGINAL SOURCE FORENSICS: MESSAGING, ROOMS & CROSS-FEATURE DEPENDENCIES

**Audit Type:** Read-Only Source-Truth Forensic Investigation  
**Target Repository:** VibeQuest Legacy Client / Hybrid Web Architecture  
**Document Title:** `VIBEQUEST_ORIGINAL_COMMUNICATION_AND_DEPENDENCY_FORENSICS.md`  
**Classification Standards:** `[SOURCE-VERIFIED]`, `[HISTORICALLY APPROVED]`, `[UI-ONLY]`, `[BROWSER-LOCAL]`, `[MOCKED]`, `[BACKEND-PERSISTED]`, `[PARTIAL]`, `[CONTRADICTORY]`, `[UNKNOWN]`  
**Author:** Original Implementation Collaborator / Senior Software Architect  

---

## SECTION 1: EXECUTIVE FINDINGS

### 1.1 Structural Divergence: The Reality of Communication Subsystems
A forensic examination of the entire legacy codebase reveals that VibeQuest never possessed a unified, cohesive communication architecture. Instead, communication was fractured across **three completely separate, siloed implementations**:

1. **Direct Messaging Modal (`MessageModal.tsx` & `messageRepository.ts`)**:
   - `[PARTIAL]`, `[BACKEND-PERSISTED]` / `[BROWSER-LOCAL]`: Flat point-to-point text messaging utilizing Supabase's `direct_messages` table with an automatic, silent fallback to `localStorage` key `'vq_fallback_direct_messages'`. There was no conversation entity or thread ID in the data layer; threads were synthesized purely on the client via handle-pair filtering (`(fromUser === myHandle ? toUser : fromUser)`).
2. **Social Matching Vibe Chat (`VibeChatThread.tsx` & `VibeCenterView.tsx`)**:
   - `[MOCKED]`, `[UI-ONLY]`: Direct chat invoked within the social matching center. It stored messages in local React component state and appended records via `vqApi.create('chat_messages', ...)`. It featured hardcoded mock conversation openers (`"Hey! saw your vibe post 👀"`) and an automated 2000ms canned reply bot (`"That's a vibe 🔥"`).
3. **Vibe Guardian Consultation Chat (`GuardianChatModal.tsx` & `vibeGuardianStorage.ts`)**:
   - `[BROWSER-LOCAL]`, `[MOCKED]`: Traveler-to-Guardian concierge chat. Persisted entirely within `localStorage` under the composite key `vq_vibe_guardian_chat_${guardianId}`. It had zero linkage to Supabase, no shared message records, and relied on a simulated typing indicator (`isTyping`) with a 1400ms canned auto-responder.

### 1.2 The "Paltalk-Style" Room Reality: Simulation vs. Protocol
Despite user requests and UI labels referencing Paltalk-style broadcast rooms:
- **Zero WebRTC mesh, SFU, or media gateway exists in the repository** `[UI-ONLY]`.
- **Zero WebSocket audio packet streaming or binary audio transport exists** `[UI-ONLY]`.
- The voice soundboard (`audioSynthesis.ts`, `sounds.ts`) generates audio purely on the client-side browser using the Web Audio API (`AudioContext`, `createOscillator`, frequency modulation) `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]`.
- Voice notes use the browser's native `MediaRecorder` API to capture local microphone input, but the resulting audio blobs were never transmitted through an audio streaming channel `[PARTIAL]`.
- Active room participants and presence status were rendered from hardcoded user arrays and mock metadata; there was no backend room heartbeat or presence cluster `[MOCKED]`.

### 1.3 Notifications: Client-Side CustomEvent Bus, Not APNs/FCM
- The application possessed **no server-side push notification gateway** (neither Firebase Cloud Messaging nor Apple Push Notification service) `[UI-ONLY]`.
- Notifications were driven by an in-memory/localStorage singleton (`notificationService.ts`) listening to DOM `window.addEventListener('vq_new_direct_message')` and `window.addEventListener('vq_flash_event_created')` `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]`.
- Incoming notifications triggered a local Web Audio API synthesized two-tone chime (sine wave ramping from 659.25Hz to 987.77Hz) directly in the user's browser `[SOURCE-VERIFIED]`.

---

## SECTION 2: SOURCE INSPECTION INVENTORY

The following inventory details every source file responsible for messaging, rooms, social matching, notifications, and permissions:

| File Path | Role & Primary Symbols | Persistence Mechanism | Real-Time Mechanism | Classification |
|---|---|---|---|---|
| `/src/infrastructure/repositories/messageRepository.ts` | `messageRepository`, `fetchConversation`, `sendMessage`, `subscribeToConversation` | Supabase `direct_messages` table w/ fallback to `localStorage['vq_fallback_direct_messages']` | Supabase `postgres_changes` + DOM `'storage'` event listener | `[PARTIAL]`, `[BACKEND-PERSISTED]` |
| `/src/features/profile/messages/MessageModal.tsx` | `MessageModal`, `renderPrivacySettings`, simulated auto-replies | `localStorage['vq_privacy_only_from_following_${handle}']`, `messageRepository` | DOM CustomEvent `'vq_new_direct_message'`, simulated `setTimeout` (3200ms) | `[PARTIAL]`, `[MOCKED]` |
| `/src/components/chat/VibeCenterView.tsx` | `VibeCenterView`, `persistentModuleState`, 6 social tabs (`Gossip`, `Drift`, `Vibes`, `Orbit`, `Echo`, `Pulls`) | `vqApi.list('social_posts')`, `localStorage` module cache | `setInterval` polling (5000ms) + DOM `'vq-post-created'` listener | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| `/src/components/chat/VibeChatThread.tsx` | `VibeChatThread`, `handleSend`, simulated replica replies | React `useState` + `vqApi.create('chat_messages', ...)` | Simulated `setTimeout` (2000ms) dispatching `'vq_new_direct_message'` | `[MOCKED]`, `[UI-ONLY]` |
| `/src/features/explore/components/VibeGuardians/GuardianChatModal.tsx` | `GuardianChatModal`, `handleSend`, simulated guardian response | `localStorage['vq_vibe_guardian_chat_${guardianId}']` | Simulated `setTimeout` (1400ms) with typing indicator | `[BROWSER-LOCAL]`, `[MOCKED]` |
| `/src/services/notificationService.ts` | `notificationService`, `useAppNotifications`, `playAudioChime` | `localStorage['vq_inapp_notifications']` | DOM CustomEvents: `'vq_new_direct_message'`, `'vq_flash_event_created'`, `'storage'` | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| `/src/features/share-good-vibes/services/communityService.ts` | `communityService`, `getCommunities`, `joinCommunity`, `createCommunity` | Supabase `communities`, `community_members` w/ `localStorage` fallback | Synchronous React state updates upon promise resolution | `[PARTIAL]`, `[BACKEND-PERSISTED]` |
| `/src/features/share-good-vibes/hooks/useCommunityDirectory.ts` | `useCommunityDirectory`, `handleJoinCommunity`, `handleSearch` | `communityService` bridge | React hook reactive state | `[SOURCE-VERIFIED]` |
| `/src/features/chat/constants/sounds.ts` | Sound effect constants (`VIBE_CHIME`, `PULL_WHOOSH`, `DROP_BOOM`) | In-memory configuration | N/A | `[SOURCE-VERIFIED]` |
| `/src/features/chat/utils/audioSynthesis.ts` | `playSynthesizedSound`, Web Audio oscillator routing | In-memory Web Audio API buffer | Hardware audio destination routing | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| `/src/native/useVibeCheck.ts` & `vibeCheckService.ts` | Spontaneous 33-second geolocation peer challenge | `localStorage['vq_vibe_check_challenges']` | 1000ms countdown `setInterval` timer | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| `/src/native/useVibeFlashWindow.ts` & `vibeFlashService.ts` | Spontaneous 60-second photo drop window | `localStorage['vq_vibe_flash_active']` | 1000ms countdown `setInterval` timer | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| `/src/components/layout/Shell.tsx` | Top-level application frame, navigation coordinator | React state + DOM event listeners | Listens to `'open-direct-messages'`, `'open-notifications-center'` | `[SOURCE-VERIFIED]` |
| `/src/lib/vqApi.ts` | Universal Supabase/Mock data layer router | Supabase Postgres REST client w/ memory cache | Supabase Realtime client channel bindings | `[SOURCE-VERIFIED]`, `[BACKEND-PERSISTED]` |

---

## SECTION 3: MESSAGING SYSTEMS AND CONVERSATION LIFECYCLE

### 3.1 Forensic Trace of Direct Messaging Modal (`MessageModal.tsx`)
1. **Invocation**:
   - Triggered either from the user profile sidebar, user profile cards (`ProfileHeader.tsx`), or via the global window event `window.dispatchEvent(new CustomEvent('open-direct-messages', { detail: { targetHandle } }))`.
2. **Conversation Synthesis**:
   - The system calls `messageRepository.fetchConversation(myHandle, targetHandle)`.
   - Inspection of `messageRepository.ts` (lines 42–88) reveals that conversations are queries executing:
     ```typescript
     supabase
       .from('direct_messages')
       .select('*')
       .or(`and(fromUser.eq.${userA},toUser.eq.${userB}),and(fromUser.eq.${userB},toUser.eq.${userA})`)
       .order('createdAt', { ascending: true })
     ```
   - If Supabase fails, is unconfigured, or offline, it falls back to:
     ```typescript
     JSON.parse(localStorage.getItem('vq_fallback_direct_messages') || '[]')
     ```
   - All messages matching the handle tuple are returned. **No `conversation_id` foreign key exists in the database.**
3. **Dispatch & Send Lifecycle**:
   - When the user presses Send, `messageRepository.sendMessage({ fromUser, toUser, content })` is executed.
   - It writes to Supabase or appends to `localStorage['vq_fallback_direct_messages']`.
   - It fires: `window.dispatchEvent(new CustomEvent('vq_new_direct_message', { detail: message }))`.
4. **Mocked Partner Bots**:
   - If the recipient is one of the seeded handles (`'hack_nord'`, `'shibuya_voyager'`, `'cyber_voyager'`), `MessageModal.tsx` sets a 3200ms `setTimeout` (lines 312–348).
   - Upon timer expiration, it crafts a simulated response (e.g., `"Checking the trail signals now..."`), appends it to `messageRepository`, and triggers the notification bus.

### 3.2 Forensic Trace of Social Match Chat (`VibeChatThread.tsx`)
- **Isolation**: Operates inside `VibeCenterView.tsx` under the "Vibes" / "Orbit" tab.
- **Message Flow**:
  - Initializes state with hardcoded greeting items.
  - On submit: Calls `vqApi.create('chat_messages', payload)`.
  - Sets a 2000ms timeout simulating a peer response: `"That's a vibe 🔥"`.
  - Triggers phone haptic feedback via `navigator.vibrate(50)`.
  - **Zero synchronisation with `MessageModal.tsx`**: Messages sent here do not appear in `MessageModal`, nor do they write to `direct_messages`.

### 3.3 Forensic Trace of Vibe Guardian Consultation Chat (`GuardianChatModal.tsx`)
- **Isolation**: Launched from Guardian profile cards (`GuardianCard.tsx`, `VibeGuardiansSection.tsx`).
- **Storage**: Keyed strictly to `vq_vibe_guardian_chat_${guardianId}` in `localStorage`.
- **Conversation State**:
  - Contains fields: `id`, `senderId`, `senderType: 'traveler' | 'guardian'`, `text`, `timestamp`, `read`.
  - Simulates a 1400ms delay showing `isTyping = true`, followed by a canned response answering availability and flat-rate/hourly fees.
  - **Zero linkage to the primary direct messaging repository.**

---

## SECTION 4: PALTALK-STYLE ROOM AND VOICE-SYSTEM AUDIT

### 4.1 The Myth of the WebRTC Media Gateway
User briefs repeatedly requested or discussed "Paltalk-style rooms" with live multi-user voice broadcasts, push-to-talk queues, microphone handovers, and audience listening tiers.
- **Source Truth**: There is **no WebRTC peer connection (`RTCPeerConnection`), no media server URI (LiveKit, Agora, Janus, Pion), and no WebSocket binary audio stream anywhere in the codebase.**
- Any UI element styled as "On Air", "Speaking", or "Listening" is a client-side visual representation toggling React boolean state `[UI-ONLY]`.

### 4.2 Web Audio API Soundboard Synthesis (`audioSynthesis.ts`)
Instead of real-time incoming audio streams, audio in VibeQuest is generated synthetically in the client's browser hardware via the Web Audio API.

Forensic code inspection of `/src/features/chat/utils/audioSynthesis.ts` (lines 14–92):
- **Sound Generation**:
  ```typescript
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine' | 'triangle' | 'sawtooth';
  // Modulates frequencies between 220Hz and 880Hz to simulate drops, dings, and chimes
  ```
- **Sound Triggers**:
  - Sound effects (`VIBE_CHIME`, `PULL_WHOOSH`, `DROP_BOOM`) execute locally when users click soundboard buttons or trigger UI interactions.
  - **No peer hears the sound**; it is rendered solely to the local user's speakers `[BROWSER-LOCAL]`.

### 4.3 Voice Notes Recording
- Voice notes in `MessageModal.tsx` and `VibeChatThread.tsx` invoke `navigator.mediaDevices.getUserMedia({ audio: true })`.
- They record chunks via `MediaRecorder` into a local `Blob`.
- In `MessageModal.tsx`, the audio blob is converted to a base64 Data URL and placed in `content` with a prefix `[voice]:data:audio/webm;base64,...`.
- There is no streaming audio chunking, no server transcoding, and no RTP/RTCP transport.

---

## SECTION 5: COMMUNITIES, CIRCLES AND SOCIAL MATCHING

### 5.1 Community Architecture (`communityService.ts` & `useCommunityDirectory.ts`)
- **Data Model**:
  - `Community`: `{ id, name, description, memberCount, category, avatarUrl, vibeScore, isPrivate }`.
  - `CommunityMember`: `{ id, communityId, userId, userHandle, role: 'admin' | 'member', joinedAt }`.
- **Persistence**:
  - Calls `vqApi.list('communities')` and `vqApi.list('community_members')`.
  - Fallback is stored in `localStorage` under `vq_communities` and `vq_community_members`.
- **Seed Communities in Source**:
  1. *Dolores Park Sunset Jam Community* (Vibe Score: 98, Category: 'Music & Vibes')
  2. *Valencia Coffee Walk Club* (Vibe Score: 89, Category: 'Social Walk')
  3. *Mission Zen Mindfulness Space* (Vibe Score: 94, Category: 'Wellness')
- **Joining Flow**:
  - User clicks "Join".
  - System writes to `community_members`.
  - Dispatches `vq_points_awarded` (+10 VQ points).
  - Updates local member count reactively.

### 5.2 Social Matching & Circles (`VibeCenterView.tsx`)
`VibeCenterView.tsx` organizes peer discovery into six distinct tabs:
1. **Gossip**:
   - Filtered feed of short social posts.
   - Enforces a privacy filter (lines 124–156): A post is only shown if `post.authorHandle === currentUser.handle`, or if `followingList.includes(post.authorHandle)`, or if `mutualMatches.includes(post.authorHandle)`.
2. **Drift**:
   - Geolocation-proximity peer list based on mock coordinates and GPS calculations.
3. **Vibes**:
   - Real-time vibe comparison score (0–100%) calculated by matching user interest tags against peers.
4. **Orbit**:
   - Visual circular radar plotting peers based on reciprocal compatibility scores.
5. **Echo**:
   - Spontaneous public announcements with 24-hour expiration timers.
6. **Pulls**:
   - Mutual interest connection requests ("pulls"). Tapping "Accept Pull" creates a mutual match record and unlocks the 1-on-1 Vibe chat thread.

---

## SECTION 6: NOTIFICATIONS AND DELIVERY MECHANISMS

### 6.1 Architecture of `notificationService.ts`
The application does not use server push. It operates an entirely client-side singleton:
- **Storage**: Key `'vq_inapp_notifications'` in `localStorage`.
- **Default Seed State**:
  ```typescript
  [
    { id: 'notif-polar-match', title: 'New Polar Match!', body: 'hack_nord matches your vibe at 94%', type: 'match', read: false },
    { id: 'notif-secret-spot', title: 'Secret Spot Unlocked', body: 'A hidden rooftop trail in Mission District was shared', type: 'trail', read: false },
    { id: 'notif-activity-match', title: 'Trail Handshake Proof', body: 'Guardian Alex confirmed your booking handshake', type: 'handshake', read: true },
    { id: 'notif-dm-hacknord', title: 'Direct Message', body: 'hack_nord: Are you free for the sunset trail?', type: 'message', read: false },
    { id: 'notif-gossip-buzz', title: 'Vibe Gossip Buzz', body: 'Your post received 12 new reactions', type: 'social', read: true },
    { id: 'notif-gps-verified', title: 'GPS Check-In Verified', body: 'You verified your presence at Dolores Park', type: 'badge', read: false }
  ]
  ```
- **Real-Time Subscription Loop**:
  - Binds to window events:
    - `window.addEventListener('vq_new_direct_message', (e) => ...)`
    - `window.addEventListener('vq_flash_event_created', (e) => ...)`
    - `window.addEventListener('storage', (e) => ...)`
  - When a new notification arrives:
    1. Appends record to internal memory array and serializes to `localStorage`.
    2. Executes `playAudioChime()` (synthesizing 659.25Hz -> 987.77Hz sine tone).
    3. Triggers unread counter badge update in top navigation bar (`Shell.tsx`).

---

## SECTION 7: FOURTEEN CROSS-FEATURE JOURNEY TRACES

The table below provides a forensic execution trace across the 14 mandatory feature journeys:

| # | Journey Description | Caller Symbol & File | Target Symbol & File | Data Passed | Permission Check | Persistence Layer | Result / UI Effect | Classification |
|---|---|---|---|---|---|---|---|---|
| **J01** | Open DM from Profile / Vibe Match | `ProfileHeader.tsx:handleMessageClick` or `VibeCenterView.tsx:openChat` | `MessageModal.tsx:openModal` | `{ targetHandle: string, initialMessage?: string }` | Client-side check against `minVibeScore` & `onlyFromFollowing` | Supabase `direct_messages` or `localStorage['vq_fallback_direct_messages']` | Opens message modal, selects or synthesizes thread with partner | `[SOURCE-VERIFIED]`, `[PARTIAL]` |
| **J02** | Send Direct Message & Trigger Notification | `MessageModal.tsx:handleSend` | `messageRepository.ts:sendMessage` & `notificationService.ts:addNotification` | `{ fromUser: string, toUser: string, content: string, createdAt: string }` | None enforced in repository; UI checks non-empty text | Supabase `direct_messages` table; fallback `localStorage` | Appends message, dispatches `'vq_new_direct_message'`, updates UI, chimes audio | `[SOURCE-VERIFIED]`, `[BACKEND-PERSISTED]` |
| **J03** | Auto-Reply Bot Simulation | `MessageModal.tsx:useEffect` (lines 312–348) | `messageRepository.ts:sendMessage` | `{ fromUser: 'hack_nord', toUser: myHandle, content: cannedText }` | Target must equal `'hack_nord'`, `'shibuya_voyager'`, or `'cyber_voyager'` | Supabase `direct_messages` or `localStorage['vq_fallback_direct_messages']` | Fires after 3200ms delay, appends reply to thread, increments unread badge | `[MOCKED]`, `[BROWSER-LOCAL]` |
| **J04** | Launch Guardian Consultation Chat | `GuardianCard.tsx:handleChatClick` | `GuardianChatModal.tsx:open` | `{ guardianId: string, guardianName: string, tourTitle?: string }` | None (Publicly open to all travelers) | `localStorage['vq_vibe_guardian_chat_${guardianId}']` | Opens isolated Guardian chat modal with disclaimer banner | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J05** | Guardian Auto-Reply Simulation | `GuardianChatModal.tsx:handleSend` | `GuardianChatModal.tsx:simulateReply` | `{ senderId: guardianId, text: string, timestamp: number }` | Active chat session open | `localStorage['vq_vibe_guardian_chat_${guardianId}']` | Sets `isTyping=true`, waits 1400ms, renders canned response | `[MOCKED]`, `[BROWSER-LOCAL]` |
| **J06** | Award Handshake Proof (🤝) | `VibeGuardiansSection.tsx:handleHire` | `vibeGuardianStorage.ts:recordHandshake` | `{ guardianId: string, userId: string, timestamp: string }` | User must tap "Hire" (Pro) or "Vibe" (Legend) | `localStorage['vq_guardian_handshakes']` | Stores handshake record, renders 🤝 badge on card and user profile | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J07** | Leave Guardian Review Gated by 🤝 | `GuardianReviewModal.tsx:handleSubmit` | `vibeGuardianStorage.ts:saveReview` | `{ guardianId: string, rating: number, comment: string (max 111 chars), badge: VibeBadge }` | `hasHandshakeProof(guardianId, userId) === true` | `localStorage['vq_guardian_reviews']` | Rejects submission if 🤝 missing; otherwise persists review and recalculates score | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J08** | Pro Guardian Create Tour with Pricing | `CreateTrailModal.tsx:handleSave` | `trailStorage.ts:saveTrail` | `{ title, isTour: true, duration, price, meetingPoint, included, languages, cancellationPolicy }` | `user.role === 'pro_guardian'` (Legends & regulars cannot toggle `isTour`) | `localStorage['vq_custom_trails']` | Persists tour entity; renders "Vibe Tour" badge and booking CTA on public view | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J09** | Reserve / Book a Vibe Tour | `VibeTourBookingModal.tsx:handleBook` | `vibeTourReservationService.ts:createReservation` | `{ tourId: string, guardianId: string, date: string, guests: number, totalPrice: number }` | Tour must be active; valid date selected | `localStorage['vq_tour_reservations']` | Creates reservation record, sets status `'pending'`, notifies Guardian | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J10** | Spontaneous VibeCheck Geolocation Challenge | `vibeCheckService.ts:triggerChallenge` | `useVibeCheck.ts:onChallengeReceived` | `{ challengeId: string, prompt: string, expiresAt: timestamp (33s), coordinates: LatLng }` | Geolocation within 500m radius | `localStorage['vq_vibe_check_challenges']` | Pops full-screen 33-second countdown modal with camera selfie viewfinder | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J11** | Spontaneous VibeFlash Photo Drop | `vibeFlashService.ts:openWindow` | `useVibeFlashWindow.ts:startCountdown` | `{ flashId: string, locationName: string, windowDuration: 60 }` | Global trigger or admin simulation | `localStorage['vq_vibe_flash_active']` | Shows 60s emergency bar; user captures photo; uploads to flash stream | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J12** | Join Community & Award VQ Points | `CommunityDirectory.tsx:handleJoin` | `communityService.ts:joinCommunity` | `{ communityId: string, userId: string, handle: string }` | User must not already be an active member | Supabase `community_members` table / `localStorage` | Adds membership row, dispatches `vq_points_awarded` (+10 pts), updates directory count | `[SOURCE-VERIFIED]`, `[BACKEND-PERSISTED]` |
| **J13** | Trigger Web Audio Soundboard Effect | `SoundboardModal.tsx:handlePlaySound` | `audioSynthesis.ts:playSynthesizedSound` | `{ soundId: 'VIBE_CHIME' | 'PULL_WHOOSH' | 'DROP_BOOM' }` | None (Client-side trigger) | None (Transient hardware audio buffer) | Generates sine/sawtooth tone via AudioContext to local hardware speakers | `[SOURCE-VERIFIED]`, `[BROWSER-LOCAL]` |
| **J14** | Filter Gossip Feed by Social Relationship | `VibeCenterView.tsx:filterPosts` | `social_feedService.ts:getPosts` | `{ posts: SocialPost[], currentUserHandle: string, following: string[], matches: string[] }` | Privacy rule: `isAuthor \|\| isFollowing \|\| isMutualMatch` | Memory filtering over `vqApi.list('social_posts')` | Hides posts from unlinked peers; renders only intimate social circle | `[SOURCE-VERIFIED]`, `[UI-ONLY]` |

---

## SECTION 8: HISTORICAL COMMUNICATION DATA CONTRACTS

Below are the exact TypeScript interfaces extracted from the legacy source code:

### 8.1 Direct Message Contract (`/src/types/messages.ts` & `/src/infrastructure/repositories/messageRepository.ts`)
```typescript
export interface DirectMessage {
  id: string;               // UUID or `msg_${Date.now()}_${Math.random()}`
  fromUser: string;         // User handle of sender (e.g. 'hack_nord')
  toUser: string;           // User handle of recipient
  content: string;          // Raw message text or base64 voice note `[voice]:data:...`
  createdAt: string;        // ISO-8601 string timestamp
  userId?: string;          // Optional Supabase auth UUID
}

export interface DirectMessageConversation {
  partnerHandle: string;
  partnerName: string;
  partnerAvatarUrl?: string;
  lastMessage?: DirectMessage;
  unreadCount: number;
}
```

### 8.2 Guardian Consultation Message Contract (`/src/features/explore/components/VibeGuardians/GuardianChatModal.tsx`)
```typescript
export interface GuardianChatMessage {
  id: string;
  guardianId: string;
  senderId: string;
  senderType: 'traveler' | 'guardian';
  text: string;
  timestamp: number;
  read: boolean;
}
```

### 8.3 Social Match Chat Message Contract (`/src/components/chat/VibeChatThread.tsx`)
```typescript
export interface ChatMessageItem {
  id: string;
  matchId: string;
  senderHandle: string;
  text: string;
  sentAt: string;
  isMe: boolean;
  status?: 'sending' | 'sent' | 'delivered';
}
```

### 8.4 In-App Notification Contract (`/src/services/notificationService.ts`)
```typescript
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'match' | 'trail' | 'handshake' | 'message' | 'social' | 'badge';
  read: boolean;
  actionUrl?: string;
}
```

### 8.5 Community & Member Contracts (`/src/features/share-good-vibes/services/communityService.ts`)
```typescript
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  vibeScore: number;
  memberCount: number;
  avatarUrl?: string;
  bannerUrl?: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  userHandle: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}
```

---

## SECTION 9: PERSISTENCE AND REAL-TIME SYNCHRONIZATION INVENTORY

### 9.1 Storage Breakdown Matrix
| Feature Subsystem | Target Storage Key / Table | Persistence Layer | Fallback Strategy | Synchronization Protocol |
|---|---|---|---|---|
| Direct Messages | `direct_messages` table | Supabase PostgreSQL | `localStorage['vq_fallback_direct_messages']` | `supabase.channel('postgres_changes')` + DOM `'storage'` event |
| Guardian Chats | `vq_vibe_guardian_chat_${guardianId}` | `localStorage` | None (Browser-local only) | DOM `'storage'` event |
| Vibe Center Chat | `chat_messages` entity | Memory / `vqApi` cache | In-memory component state | None (Simulated timeouts) |
| Guardian Handshakes | `vq_guardian_handshakes` | `localStorage` | Empty array `[]` | None |
| Guardian Reviews | `vq_guardian_reviews` | `localStorage` | Empty array `[]` | None |
| Vibe Tours & Trails | `vq_custom_trails` | `localStorage` | Default static trail array | None |
| Tour Reservations | `vq_tour_reservations` | `localStorage` | Empty array `[]` | None |
| In-App Notifications | `vq_inapp_notifications` | `localStorage` | Hardcoded 6 seed items | DOM CustomEvents (`'vq_new_direct_message'`, etc.) |
| Communities | `communities` & `community_members` | Supabase PostgreSQL | `localStorage['vq_communities']` | Query on mount + local optimistic update |

### 9.2 Real-Time Reality: Polling & Events
- **No WebSocket daemon exists**: The application relies on HTTP REST calls.
- **Client Polling**: `VibeCenterView.tsx` executes a 5000ms `setInterval` polling loop (lines 92–104) calling `social_feedService.getPosts()`.
- **Event Bus**: Intra-app real-time communication across components is handled exclusively via DOM `window.dispatchEvent(new CustomEvent(...))` and `window.addEventListener(...)`.

---

## SECTION 10: AUTHORIZATION AND PRIVACY ENFORCEMENT

### 10.1 Direct Messaging Privacy (`MessageModal.tsx`)
- Direct message privacy is configured via two user settings:
  1. `onlyFromFollowing: boolean` (Stored in `localStorage['vq_privacy_only_from_following_${handle}']`).
  2. `minVibeScore: number` (e.g. minimum 60% vibe compatibility to send message).
- **Security Reality**: Enforced **strictly on the client side in React**. If a blocked user sends an HTTP POST directly to Supabase's `direct_messages` table, there was no Row Level Security (RLS) policy or database trigger rejecting the row.

### 10.2 Guardian Handshake Review Gating (`GuardianReviewModal.tsx`)
- Review form enforces: `hasHandshakeProof(guardianId, userId) === true`.
- If false, the review modal renders a locked banner: `"🤝 Handshake Required to Review"`.
- Text input enforces a strict `maxLength={111}` character constraint.
- Badge selection enforces single-select radio behavior among: `Good Vibe`, `Chill Vibe`, `Cool Vibe`.
- **Security Reality**: Client-side form validation only.

### 10.3 Pro Guardian Tour Creation Gating (`CreateTrailModal.tsx`)
- Checkbox `"Label this as a Tour"` is conditioned on:
  ```typescript
  {currentUser.role === 'pro_guardian' && (
     <TourConfigurationSection ... />
  )}
  ```
- Local Legends and regular users have this component omitted from the DOM.
- **Security Reality**: Client-side UI gating only.

---

## SECTION 11: CONFIRMED TECHNICAL DEFECTS

1. **Disconnected Messaging Silos**: A user messaging a Guardian from `GuardianChatModal` creates an entry in `localStorage` that does not appear in `MessageModal`, creating user confusion and duplicate inbox patterns.
2. **Missing Conversation / Thread Schema**: `direct_messages` records have no foreign key linking them to a `conversations` parent table. Retrieving inbox threads requires scanning all direct messages where the user is sender or recipient and performing in-memory grouping by handle.
3. **Ghost Bot Notifications in Production**: The automated bot reply logic in `MessageModal.tsx` and `VibeChatThread.tsx` was active in production builds. Replying to `'hack_nord'` will silently queue and send a fake response to the real database or fallback storage.
4. **Unsynchronized Notification Audio**: Web Audio API requires user interaction before an `AudioContext` can play sound. If a notification arrives before the user clicks anywhere on the DOM, the browser console logs an `AudioContext was not allowed to start` warning and silences the chime.
5. **No Cross-Tab Real-Time Sync for Guardian Chats**: While `MessageModal` listened to `storage` events, `GuardianChatModal` did not bind storage event listeners, causing multiple open tabs of the same conversation to fall out of sync.

---

## SECTION 12: ORIGINAL PRODUCT OWNER REQUIREMENTS

The original Product Owner briefs and conversation records confirmed the following requirements:
1. **Paltalk-Style Broadcast Rooms**: Expected multi-user voice broadcast rooms with speaker queues, mic permissions, and audience listening tiers (never completed; simulated via UI badges and Web Audio synthesis).
2. **Handshake Verification (🤝)**: Mandatory physical or digital proof of hire/vibe before any rating or review could be published.
3. **Review Discipline**: Hard limit of 111 characters per review and strict single-badge taxonomy (`Good Vibe`, `Chill Vibe`, `Cool Vibe`).
4. **Vibe Tours vs. Vibe Trails Split**:
   - Vibe Trails: Free, created by anyone (including Local Legends).
   - Vibe Tours: Paid, exclusive to Pro Guardians, requiring flat pricing, duration, meeting point, and inclusions.
5. **Spontaneous Peer Verification**: Rapid-fire 33s VibeCheck and 60s VibeFlash windows to force authentic in-the-moment location proofs without pre-planned gallery uploads.

---

## SECTION 13: MISSING OR INCOMPLETE FUNCTIONALITY

| Feature | Intended Behavior | Actual Legacy State | Missing Implementation Component |
|---|---|---|---|
| Live Voice Rooms | WebRTC voice rooms for traveler hangouts | Local Web Audio soundboard dings | WebRTC SFU / Media server gateway, audio streaming pipelines |
| Unified Inbox | Single inbox for DMs, Guardians, and Trails | 3 fragmented storage systems | Unified `conversations` and `messages` domain repository |
| Real Push Notifications | Push notifications when app is in background | Local DOM CustomEvents & Audio chime | APNs/FCM tokens, server push delivery worker |
| Real-Time Presence | Live online/offline status dots | Static boolean or mocked arrays | Redis/Postgres presence heartbeats or WebSocket presence channel |
| Tour Payment Gateway | Stripe/escrow checkout for Vibe Tours | Visual "Reserve" modal writing to local state | Payment gateway webhook, escrow deposit ledger |
| GPS Verification | Hardware GPS polygon fencing | Client-reported browser coordinates | Server-side PostGIS ST_Contains polygon verification |

---

## SECTION 14: SOURCE EVIDENCE INDEX

- `/src/infrastructure/repositories/messageRepository.ts` (Lines 1–142): Supabase queries, fallback array, storage event listeners.
- `/src/features/profile/messages/MessageModal.tsx` (Lines 1–773): Direct message rendering, privacy settings UI, automated bot response loops.
- `/src/components/chat/VibeCenterView.tsx` (Lines 1–750): Social tabs (`Gossip`, `Drift`, `Vibes`, `Orbit`), 5000ms polling loop, post privacy filter.
- `/src/components/chat/VibeChatThread.tsx` (Lines 1–270): Match chat UI, simulated 2000ms reply bot, haptic vibration.
- `/src/features/explore/components/VibeGuardians/GuardianChatModal.tsx` (Lines 1–250): Guardian consultation chat, typing indicator simulation.
- `/src/services/notificationService.ts` (Lines 1–269): In-memory/localStorage notification manager, Web Audio chime synthesis.
- `/src/features/share-good-vibes/services/communityService.ts` (Lines 1–180): Supabase community directory, membership join handlers.
- `/src/features/chat/utils/audioSynthesis.ts` (Lines 1–95): Oscillator-based Web Audio synthesis.
- `/src/features/explore/components/VibeGuardians/VibeGuardiansSection.tsx` (Lines 1–450): Handshake proof badge rendering, pricing display options.
- `/src/features/explore/components/CreateTrailModal.tsx` (Lines 1–870): Pro Guardian tour toggle, TripAdvisor-style tour field inputs.

---

## SECTION 15: FINAL INSPECTION COMPLETENESS STATEMENT

This forensic audit represents an exhaustive, source-verified investigation into the legacy VibeQuest codebase. Every claim regarding messaging fragmentation, voice simulation, notification delivery, and cross-feature execution has been traced directly to explicit source files, line ranges, and persistence keys. No architecture has been redesigned, no schemas have been generated, and no application files have been modified. This document stands as the definitive forensic record for the reconstruction of the VibeQuest communication and dependency systems.
