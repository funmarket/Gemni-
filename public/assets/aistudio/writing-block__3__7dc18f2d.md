# VibeQuestGuardians — Requirements.md

**Document ID:** VQ-REQ-001  
**Edition:** 0.3 — Product Owner Review Candidate  
**Date:** 2026-10-30  
**Target:** `funmarket/VibeQuestGuardians`  
**Integration branch:** `vibefoundation`  
**Status:** REVIEW CANDIDATE — NOT YET APPROVED OR PUBLISHED  
**Product:** VibeQuest  
**Scope:** Complete initial application, all 28 candidate business domains, cross-domain user journeys and operational capabilities.

---

## 1. Purpose and authority

This document specifies the intended user-visible behavior, functional scope, access principles, interaction requirements, operational capabilities and acceptance expectations for the new VibeQuest application.

VibeQuestGuardians is a clean new implementation of the VibeQuest product. The previous Gemini-built application, historical source archives, `funmarket/VibeQuest`, Manus materials and HOOMA are reference sources. They may supply useful product knowledge or engineering lessons, but are not automatically implementation authority.

The product shall be designed as a complete, interconnected system before application implementation begins.

### 1.1 Documentation boundaries

This document defines **what the product must do**.

- `Structure.md` defines how the approved product is organized into application components, domain contracts, services, communication and deployment responsibilities.
- `Database.md` defines canonical data ownership, entities, relationships, integrity, authorization and persistence requirements.
- `Plan.md` defines the approved implementation sequence and verification/release gates.
- `docs/product-design/` retains source baselines, decision history, domain-ownership research, historical feature extraction and other supporting information.
- `AGENTS.md` and VibeBehaviorGate provide mandatory agent operating discipline.

These documents must be consistent. A change to one product requirement must be checked against every affected governing contract.

### 1.2 Requirement status terminology

- **DIRECTED:** Explicit current Product Owner direction.
- **LOCKED:** Explicitly accepted and bounded decision.
- **REVISED:** Earlier decision superseded by a newer direction, with its history preserved.
- **HISTORICAL CANDIDATE:** Recoverable intended behavior from the previous application, pending confirmation against current product policy.
- **PROPOSED:** Recommended functionality or safety behavior not yet accepted as product policy.
- **OPEN:** Genuine product-policy choice not established by available authoritative evidence.
- **UNKNOWN:** Evidence unavailable or insufficient to establish a factual implementation or historical claim.

Historical code presence, mock screens and demonstration values do not prove a working production capability.

### 1.3 Completeness requirements

Every significant feature must be traceable to:

1. Product requirement and user journey.
2. Triggering action and participating roles.
3. Eligible visibility, consent and permissions.
4. State changes and their business owner.
5. Success, failure, cancellation, expiry and retry behavior.
6. Dependencies on other product capabilities.
7. Relevant acceptance criteria and test evidence.

The historical register of 215 scoped records must be reconciled without assuming that it represents 215 working features or the entire scope of the new application.

The complete initial product includes all 28 candidate domains. Development may be staged; no domain is silently excluded from the complete product.

---

## 2. Product vision and audience

VibeQuest is a location-aware discovery, culture, social interaction, travel and experiences application.

It connects people to places, local culture, travelers, Guardians, Local Legends, activities, events, communities, challenges and meaningful real-world experiences.

The product combines:

- Real places and cultural discovery.
- Personal and community-created Vibe Trails.
- Professional Guardian services and free Local Legend participation.
- Guided Vibe Tours and reservations.
- User-organized Activities and organizer-published Events.
- Social publishing, communities, matching, messaging and live rooms.
- Live media and time-limited challenges.
- Recognition, reputation and VQ rewards.
- Marketplace, advertising, subscriptions, payments and independent ticketing.
- Administrative controls and safety systems.

### 2.1 Primary audiences

The complete product supports visitors, registered explorers, travelers, ordinary community members, Local Legends, Pro Guardians, businesses, organizations, event organizers, artists, community administrators, marketplace participants, moderators and authorized platform operators.

Roles and entitlements are separate concepts. One user may participate in multiple capacities when authorized.

### 2.2 Guest-first experience

Public content shall be discoverable without compulsory registration.

Guests may browse accessible Places, Trails, Guardian profiles, public Activities and Events, public social content, advertised offers and other content designated public.

Actions requiring an account—such as publishing, messaging, joining private groups, booking, earning VQ or receiving tickets—shall invoke appropriate authentication.

Where feasible and secure, the application shall preserve the guest's intended destination or unfinished action after sign-in.

---

## 3. Application shell and navigation

**REQ-SHELL-001 — Five primary destinations.**

The main navigation shall contain:

**HOME · EXPLORE · SHARE · VIBE · PURSE**

All five items shall use consistent sizing, alignment and baseline presentation. Share remains centrally positioned with its recognizable heart identity but is not elevated, enlarged or floating.

This requirement reflects the newer Product Owner direction and supersedes the historical elevated Share presentation.

**REQ-SHELL-002 — Top application controls.**

The top bar shall provide appropriate product branding/home navigation, location or exploration-area context, notifications access and user/profile access.

The notification bell belongs in the top application bar.

Ordinary account preferences and personal settings belong in the profile menu.

**REQ-SHELL-003 — Responsive experience.**

The application shall be designed primarily for phone use while remaining usable on compatible desktop and tablet browsers.

Navigation, menus, modal dialogs, forms, media tools, maps and transactional experiences must accommodate narrow screens, virtual keyboards, safe areas and accessibility scaling.

**REQ-SHELL-004 — Global preferences.**

Language, appearance and accessibility preferences shall initially respect available device or host settings, with user override where supported.

Supported locales, RTL requirements and cross-device synchronization details remain subject to the approved localization policy.

**REQ-SHELL-005 — Navigation consistency.**

Deep links and notifications shall open the actual referenced object and appropriate screen, subject to authentication and privacy.

Changing destinations shall not fabricate records, reset confirmed business transactions or unnecessarily discard legitimate drafts.

**REQ-SHELL-006 — Honest application states.**

All major experiences shall distinguish loading, empty, permission denied, offline, unavailable, expired, rejected and failed states.

A visually responsive control is not proof that the underlying action succeeded.

---

## 4. Web and Telegram access

**REQ-PLATFORM-001 — One product.**

Web browsers and Telegram Mini App users shall access the same canonical VibeQuest product, features and business rules, subject to host capabilities.

**REQ-PLATFORM-002 — Shared backend authority.**

Both entry methods shall use the same authoritative backend/API, canonical user identity and application data authority.

Browser and Telegram use must not create independent competing users, balances, messages, bookings or other business records.

**REQ-PLATFORM-003 — Host-aware presentation.**

The Telegram context shall support appropriate Telegram launch authentication, viewport, safe-area, theme, navigation and BackButton behavior where applicable.

Browser access shall provide an equivalent ordinary Web experience.

**REQ-PLATFORM-004 — Secure account resolution.**

Telegram launch information requires server-side validation. Linking Telegram identity to an existing account shall be deliberate and authorized.

Conflicting identities shall not be silently merged.

**REQ-PLATFORM-005 — Delivery topology boundary.**

The product requires working Web and Telegram entry points using shared product/backend authority. The Product Owner has explicitly allowed consideration of HOOMA's shared frontend delivery approach.

A decision to use one frontend server, a Telegram redirect or separately serving frontend deployments is a Structure/hosting decision and shall not be inferred from this requirement alone. Any adopted approach must preserve genuine Telegram Mini App behavior.

---

## 5. HOME — local discovery, networks and activity

**REQ-HOME-001 — Home composition.**

Home shall provide the user's exploration context, relevant discoveries, accessible social feeds, live opportunities, Activities, Events and meaningful access to Trails and cultural experiences.

**REQ-HOME-002 — Feed separation.**

Preserve three distinct feed contexts:

- **My Network:** Authorized content from followed accounts, confirmed relationships and the user's own eligible posts.
- **Local Vibes:** Accessible locally relevant content and moments.
- **For You:** Content discovery informed by approved interests and preference rules.

The feeds must not be generated as fictional community activity. A single canonical social post may appear in multiple authorized feeds without becoming separate publications.

**REQ-HOME-003 — Editorial presentation.**

Preserve the historical magazine-style feed presentation, including an initially compact set of posts and an Expand/Collapse action. The historical five-post initial layout remains a candidate display preference.

**REQ-HOME-004 — Flash Event alert.**

A live Flash Event alert shall expose relevant nearby temporary gatherings and link to the actual Event/Secret detail.

Its availability, time remaining and eligibility must reflect authoritative event state.

Flash Events are distinct from the 33-second VibeFlash camera challenge.

**REQ-HOME-005 — Activities.**

Present live and upcoming user-organized Activities with host, location, schedule, participation and real attendance information.

Users shall be able to open details and complete authorized participation actions.

**REQ-HOME-006 — Events.**

Present organizer/business/artist Events separately from ordinary Activities.

Provide Event detail, scheduling, admission status, RSVP and eligible independent ticketing entry.

**REQ-HOME-007 — Local discovery.**

Home shall offer access to Radar, Find Hub, local Places, hidden gems, cultural landmarks and Vibe Trails.

References must resolve to the same underlying Place or Trail represented elsewhere in the product.

**REQ-HOME-008 — Personal progress.**

Expose daily participation, streaks, discoveries and cultural achievements where supported by approved rules.

A display animation, button tap or local client counter must not independently establish verified participation or award VQ.

**REQ-HOME-009 — Check-in presentations.**

Display authorized personal and network check-ins with appropriate place and timing information.

Privacy, eligibility and actual check-in authority must be respected.

**REQ-HOME-010 — Cultural guidance.**

Preserve the historical VIBE Guide/handbook concept, learning journeys and optional quiz or cultural progression experiences.

Awarding VQ for education requires an approved qualifying reward rule.

---

## 6. EXPLORE — geographic discovery and Places

**REQ-EXP-001 — Map and search.**

Explore shall support map-based and list-based discovery of real Places, neighborhoods, streets, landmarks and relevant experiences.

Users may select a city or exploration area manually without granting device location access.

**REQ-EXP-002 — Categories.**

Preserve the historical category filters:

All, Food, Cafés, Culture, Art, Venues and Hidden.

Categories filter genuine Place results. They are not automatically independent business entities, tables or API operations.

**REQ-EXP-003 — Radar discovery.**

Radar shall refresh or surface relevant nearby discoveries using real eligible content.

Any geographic radius, rarity level, ranking or scan charge requires an approved policy. Historical demonstrations such as a 10 km radius do not establish an authoritative threshold.

**REQ-EXP-004 — Place detail.**

Place detail shall expose authentic identity, address/location, media, descriptions, category, relevant contributions, practical information, and actions such as save or navigate where supported.

**REQ-EXP-005 — Contributions and verification.**

Authorized users may submit Places, propose updates, add reviews and report changes.

Historical concepts such as “Yes, matching” and “No, changed” shall be preserved as candidate community-contribution actions.

A community response, factual correction, verified physical visit and VQ-eligible contribution are distinct business outcomes.

**REQ-EXP-006 — Check-ins and place evidence.**

Verified visit claims must use the authorized evidence policy. Simply showing an on-screen map pin or measuring device GPS distance client-side is not sufficient proof of a genuine visit.

Exact thresholds, spoofing controls and reward eligibility must be defined before acceptance.

**REQ-EXP-007 — Secrets Board.**

Preserve temporary local discoveries and Flash/Secret gatherings with real countdowns, host context, location-disclosure rules, participation states and expiry behavior.

Creation and claiming require approved eligibility and safety rules.

Historical 50 m evidence thresholds, event durations and bounty amounts remain candidates, not automatic product defaults.

---

## 7. Vibe Trails — creation, discovery and lineage

**REQ-TRAIL-001 — Trail creation.**

Eligible travelers, Local Legends and other authorized creators may create multi-stop Vibe Trails.

A Trail shall have meaningful identity, description/story, searchable Places or waypoints, ordered stops, location context, personal notes and optional media.

**REQ-TRAIL-002 — Trail lifecycle.**

Creators shall be able to prepare, edit, publish, view, share and retire their own Trails according to permissions.

A change in visibility shall be reflected wherever the Trail appears.

**REQ-TRAIL-003 — Trail discovery.**

Public Trails may be discovered through Explore, Home, relevant profiles, Guardian cards, social content and shared links.

**REQ-TRAIL-004 — Save and adopt.**

Saving/bookmarking a Trail shall be distinct from adopting it as a personal itinerary.

**REQ-TRAIL-005 — Remix.**

An eligible user may create an attributable derivative Trail. The source Trail remains intact and its creator attribution is preserved.

**REQ-TRAIL-006 — Remix Tree.**

Preserve the historical lineage experience showing relationships between source and derivative Trails where visibility permits.

**REQ-TRAIL-007 — Progress and completion.**

Viewing, saving, navigating, following stops and verified physical completion must remain distinguishable actions.

No false Trail-completion badges or VQ awards may be created through presentation-only progress.

---

## 8. Guardians and Local Legends

**REQ-GRD-001 — Guardian directory.**

Preserve distinct directory contexts:

Top Vibes, Pro Guardians, Local Legends and Suggested.

Suggested discovery may filter appropriate Guardian categories.

**REQ-GRD-002 — Guardian profiles.**

Guardian profiles may display identity/presentation details, service area, languages, interests, experience, appropriate badges, eligible offers and public Trails.

Private information must not be disclosed merely because a profile is discoverable.

**REQ-GRD-003 — Pro Guardian versus Local Legend.**

Preserve the historical distinction between paid professional Guardian services and free Local Legend participation.

The exact eligibility, verification and subscription rules must be reconciled before implementation.

**REQ-GRD-004 — Guardian onboarding.**

Eligible members shall have role-specific onboarding covering relevant local knowledge, experience, languages and service information.

**REQ-GRD-005 — Selfie freshness.**

Preserve the historical requirement for a current in-app Guardian selfie, with a seven-day refresh expectation for directory visibility.

An in-app photograph is not automatically independent liveness or legal identity verification.

**REQ-GRD-006 — Linked Trails.**

Guardian cards shall support up to five featured linked Trails under the historical design, with actual Trail navigation and without cloning the Trail record.

**REQ-GRD-007 — Consultation.**

Eligible users may open a genuine contextual Guardian conversation.

A message does not automatically create a booking or prove agreement.

**REQ-GRD-008 — Commercial offers.**

Pro Guardian offers may use eligible hourly or flat-rate pricing in the appropriate context.

The customer must see the actual quoted terms before committing to a chargeable service.

**REQ-GRD-009 — Review.**

Preserve the historical 111-character review concept and the Good Vibe, Chill Vibe and Cool Vibe badges.

Publishing rights must follow an approved qualifying interaction and moderation policy.

---

## 9. Vibe Tours and Guardian reservations

**REQ-TOUR-001 — Tour offers.**

Eligible Pro Guardians may create guided Vibe Tour offers with title, description, duration, meeting/pickup arrangements, languages, inclusions, relevant accessibility details, price, terms and availability.

**REQ-TOUR-002 — Real availability.**

Check Availability/Check Dates shall expose actual reservable periods.

Expired slots, full capacity and unavailable Guardians shall not appear reservable.

**REQ-TOUR-003 — Pending request.**

Submitting a reservation/Hire request creates a pending request, not an automatically confirmed engagement.

**REQ-TOUR-004 — Acceptance.**

The receiving party may accept or decline according to the approved role and booking rules.

Both parties shall see the same authoritative status.

**REQ-TOUR-005 — Lifecycle.**

Reservations shall distinguish requested, accepted, declined, cancelled, completed and disputed states as relevant.

Holds, expiry, cancellation fees, refunds and payment sequencing require a separately approved lifecycle.

**REQ-TOUR-006 — Distinct commercial records.**

A Tour offer, Guardian reservation, payment, Handshake and review are separate business records or states. No one of these automatically proves the others.

---

## 10. Handshake and encounter recognition

**REQ-HS-001 — Current directed rule.**

When a user selects Hire, a pending request is initiated.

When the other party accepts the job, the application records the qualifying Handshake interaction for the involved pair.

Clicking Hire alone shall not issue the Handshake.

**REQ-HS-002 — Meaning.**

The current Handshake indicates an accepted-job interaction.

It does not independently certify physical co-presence, payment, Tour completion or location evidence.

**REQ-HS-003 — Duplicate protection.**

The same qualifying acceptance shall not issue duplicate Handshake records or duplicate downstream recognition.

**REQ-HS-004 — Review relationship.**

Handshake-based Guardian review eligibility shall follow the approved interaction and review policies. Publishing a review must not create a second Handshake.

**REQ-HS-005 — Remaining policy.**

Free Local Legend Vibe/meetup Handshakes, revocation, disputes, expiry and separately verified in-person encounters require explicit lifecycle definitions. These are not silently inferred from historical Gemini narratives.

---

## 11. SHARE — publishing and live moments

**REQ-SHR-001 — Share Studio.**

Share opens a unified publishing experience for appropriate text, photographs, video, live moments and eligible contextual contributions.

**REQ-SHR-002 — Historical mood groupings.**

Preserve Pure Heart, Friendly Spark and Shared Moments as historical emotional categories for product review.

**REQ-SHR-003 — Genuine capture.**

Live camera functionality shall reflect actual device permissions and captured media.

Where supported, front/back or sequential dual-camera experiences may be provided with preview and retake.

A synthetic image cannot be represented as live camera proof.

**REQ-SHR-004 — Ordinary versus proof media.**

Ordinary posts, Trail covers and eligible social attachments may have different upload policies from time-sensitive live-proof content.

**REQ-SHR-005 — Media lifecycle.**

Publishing must indicate actual upload, processing, permission, publication and failure states.

The feature owner determines visibility and attachment authority; Global Media manages the underlying asset lifecycle.

**REQ-SHR-006 — Nearby moments.**

Provide eligible location-related ephemeral moments with privacy controls, user interaction and authoritative expiry.

Historical 24-hour presentation behavior remains a candidate until its exact content policy is approved.

**REQ-SHR-007 — Join/Echo interactions.**

Preserve contextual response, joining and aesthetic discovery experiences where supported by the relevant feature's approved interaction rules.

**REQ-SHR-008 — Community entry.**

Share may expose Circles and community interactions without taking over the authoritative ownership of memberships, content or conversations.

---

## 12. VibeCheck and VibeFlash

**REQ-CH-001 — Distinct native experiences.**

VibeCheck and VibeFlash are separate challenge types with independent invitation, participation, evidence and outcome rules.

**REQ-CH-002 — VibeCheck timing.**

The response window is **180 seconds**.

The authoritative server determines start, deadline and acceptance eligibility.

**REQ-CH-003 — VibeCheck interaction.**

Preserve the historical peer challenge concept: invitation, recipient decision, fresh media response, outcome/reveal and meaningful result.

Exact eligibility, response-proof standards, reuse restrictions and cooldowns must be defined.

**REQ-CH-004 — VibeFlash timing.**

The response window is **33 seconds**, controlled by the server.

**REQ-CH-005 — VibeFlash experience.**

Preserve the synchronized live-moment concept and the historical Flash Mosaic candidate, subject to audience, visibility, capture and scheduling rules.

**REQ-CH-006 — Expiry.**

Late responses shall not be silently accepted, even when a client clock or delayed network request appears to show remaining time.

**REQ-CH-007 — Distinct from Events.**

Neither VibeCheck nor VibeFlash is a Flash Event or Secret gathering.

---

## 13. VIBE — social discovery and relationships

**REQ-VIBE-001 — Six historical contexts.**

Preserve and reconcile the historical Vibe experience:

Gossip, Drift, Vibes, Orbit, Echo and Pulls.

These represent distinct functions and shall not be collapsed into generic messaging.

**REQ-VIBE-002 — Gossip publishing.**

Eligible users can publish text, image/media and contextual social posts.

One published post shall have one authoritative identity across Gossip, Home My Network and eligible Local Vibes projections.

**REQ-VIBE-003 — Post interactions.**

Support authorized likes, comments, threaded replies, links/shares, editing or deletion where permitted, and privacy-consistent notifications.

**REQ-VIBE-004 — Drift.**

Drift provides discovery of eligible real people through their voluntarily disclosed interests or wavelength categories.

Preserve the historical twelve-category concept and review its exact labels against the legacy evidence register.

No fabricated users, compatibility percentages or artificial conversations may be presented as real.

**REQ-VIBE-005 — Orbit.**

Orbit represents accounts followed by the user and supports permitted follow/unfollow actions.

**REQ-VIBE-006 — Echo.**

Echo represents eligible followers and appropriate follow-back actions.

Follower status is not identical to an accepted match.

**REQ-VIBE-007 — Pulls.**

Pulls presents incoming connection invitations with accurate pending and action states.

**REQ-VIBE-008 — Confirmed Vibes.**

A qualified accepted invitation creates a confirmed Vibe connection according to the approved connection rule.

A unilateral follow does not silently become a confirmed relationship.

**REQ-VIBE-009 — Communication.**

Eligible relationships may gain messaging access, subject to explicit permissions, blocking and privacy restrictions.

**REQ-VIBE-010 — Polar Romance.**

Preserve the historical separately opted-in complementary matching concept, including explanations, Accept/Pass and a roughly quarterly cycle.

Age, consent, sensitive data usage, eligibility, cooldown and mutual confirmation require approved policy.

**REQ-VIBE-011 — Social & Activity matching.**

Preserve the separate shared-interest/activity matching concept and approximately monthly historical cycle.

It shall not reuse Polar Romance assumptions or disclose protected precise location.

**REQ-VIBE-012 — Matching integrity.**

Automated recommendations are proposals, not automatically confirmed interpersonal relationships.

---

## 14. Social graph, messaging and communities

**REQ-SOC-001 — Following and blocking.**

Users may establish permitted follow relationships and apply block/restriction controls.

Blocked users must not retain unauthorized access through search, messaging, notifications or alternate frontend entry points.

**REQ-MSG-001 — Direct messaging.**

Authorized participants may exchange genuine durable messages, with truthful send, failure and appropriate delivery/read states.

**REQ-MSG-002 — Guardian consultation.**

Guardian chat shall retain its Guardian/service context without independently confirming a booking.

**REQ-MSG-003 — Media and voice.**

Messaging may support authorized photographs, video and voice notes, governed by Global Media handling and conversation access.

**REQ-MSG-004 — Conversation separation.**

Preserve distinctions among ordinary DMs, Guardian consultations, community live sessions, Marketplace negotiation and Event discussion.

These may share technical capabilities without collapsing their product-level permissions and ownership.

**REQ-COM-001 — Communities and Circles.**

Users can discover eligible communities, inspect their purpose and access policy, request/join membership, leave, and participate according to roles.

**REQ-COM-002 — Membership and governance.**

Community creators/administrators may manage permitted roles, membership, invitations and moderation.

Private content must not become public through a shared search projection.

**REQ-ROOM-001 — Live rooms.**

Live rooms shall support genuine room lifecycle, authorized membership, participant/speaker roles and appropriate realtime behavior.

**REQ-ROOM-002 — Live-room safeguards.**

Disconnected participants, closed rooms, revoked permissions and media failures must be represented accurately.

---

## 15. PURSE — VQ rewards and history

**REQ-VQ-001 — Sole reward unit.**

VQ is the only new in-app reward unit. Legacy Points shall not be introduced as a second balance.

VQ is an internal non-crypto reward credit under the presently directed policy.

**REQ-VQ-002 — Purse.**

Purse displays actual authorized VQ balance, earning history, adjustments and relevant activity references.

Balance must reconcile with the authoritative reward ledger.

**REQ-VQ-003 — Earning.**

Only approved qualifying activity events may trigger VQ awards.

The relevant feature establishes the qualifying business outcome; the reward owner determines eligibility and posts VQ.

**REQ-VQ-004 — Configurable amounts.**

Authorized administrators shall be able to configure VQ earning amounts dynamically for supported qualifying activities.

No historical example amount is an automatic product default.

**REQ-VQ-005 — Manual grants.**

Support authorized manual/custom-labeled VQ grants to individual eligible users, selected groups, Guardian/Legend categories and eligible platform-wide recipients.

**REQ-VQ-006 — Corrections.**

Corrections to VQ history must be traceable and preserve auditability. A displayed balance must not be edited as an independent substitute for a ledger event.

**REQ-VQ-007 — Anti-duplication.**

Repeated requests, retries, duplicate notifications and client refreshes must not award the same qualifying activity multiple times.

**REQ-VQ-008 — Recognition separation.**

Badges, social status, trust and Guardian qualification do not automatically equal VQ credit.

**REQ-VQ-009 — Transfers and commercial utility.**

Member-to-member VQ transfers, purchases, exchange, cash conversion, spending and future promotional utility remain unapproved product-policy areas.

Historical Send/Receive and P2P examples are reference concepts, not permission to implement those transactions.

---

## 16. Administration and VQ rule management

**REQ-ADM-001 — Administrative console.**

Provide a secured, phone-usable Admin Control Panel distinct from ordinary user preferences.

**REQ-ADM-002 — Administrative navigation.**

The console shall cover appropriate operational functions including users, permissions, content, Places, Activities, Events, challenges, Guardians, subscriptions, rewards, reports and moderation.

Individual administrative sections may be organized according to the final approved scope, without creating duplicate domain owners.

**REQ-ADM-003 — VQ rules catalog.**

Authorized administrators may review configured qualifying activities, effective reward amounts, eligibility conditions, activation state and historical versions.

**REQ-ADM-004 — Rule editing.**

Changes to reward rules shall be validated, authorized, traceable and reflected consistently in the rule list and editor.

**REQ-ADM-005 — Cap and cooldown policies.**

The rule system may support approved limits, cooldowns, verification requirements, geographic conditions and eligibility restrictions.

Cap units, time boundaries and precedence must be defined; no contradictory rule displays are permitted.

**REQ-ADM-006 — Grant workflow.**

Administrators may initiate eligible manual and bulk grants with recipient scope, reason, amount and traceable result.

Additional approval requirements for high-impact grants remain subject to policy.

**REQ-ADM-007 — Preview.**

A rule/grant preview may show expected recipients and outcomes without issuing real VQ.

**REQ-ADM-008 — Auditability.**

Administrative changes shall expose appropriate actor, action, time, affected record and outcome information.

**REQ-ADM-009 — User controls.**

Administrators may perform authorized identity, trust or moderation tasks without turning Admin into a competing writer for domain records.

**REQ-ADM-010 — Analytics.**

Dashboards shall show genuine measured activity, not hardcoded demonstration figures or fabricated operational metrics.

---

## 17. Recognition, reputation, trust and moderation

**REQ-REP-001 — Recognition.**

Support meaningful badges, achievements, profile standing and cultural participation records based on qualifying source activity.

**REQ-REP-002 — Distinct reputation.**

Trust indicators, professional Guardian eligibility, earned recognition and VQ reward balance remain distinct.

**REQ-REP-003 — Revocation.**

Recognition and eligibility affected by verified abuse or policy changes must follow clear authorized lifecycle rules.

**REQ-TRUST-001 — Reporting.**

Users can report eligible accounts, posts, Places, messages and other supported resources.

**REQ-TRUST-002 — Moderation.**

Authorized moderators may review and resolve cases with appropriate evidence, reason and auditability.

**REQ-TRUST-003 — Enforcement.**

Restrictions may affect posting, contact, listings, rewards or participation according to the specific approved enforcement policy.

**REQ-TRUST-004 — Appeals.**

Where applicable, users shall be able to challenge moderation outcomes through a defined, genuine review path.

---

## 18. Notifications

**REQ-NOT-001 — Global bell.**

Notifications shall be accessible from the top bar and shall reflect actual unread state.

**REQ-NOT-002 — Product events.**

Eligible events may include Pulls, messages, Guardian requests, reservations, Handshakes, challenge invitations, community interactions, Event reminders, content reactions and VQ awards.

**REQ-NOT-003 — Genuine origin.**

A notification represents an existing originating business event and never independently creates that event.

**REQ-NOT-004 — Delivery.**

Notifications shall distinguish persisted inbox records, queued delivery, delivered channel messages and failed attempts where such states are available.

**REQ-NOT-005 — Preferences.**

Users shall have applicable notification preferences and privacy controls.

**REQ-NOT-006 — Deep links.**

Opening a notification shall navigate to its genuine source object when access is still permitted, otherwise show an accurate unavailable/restricted state.

---

## 19. Businesses, organizations and commercial capabilities

**REQ-BIZ-001 — Business identity.**

Eligible businesses and organizations may create or claim authorized public profiles and manage their own permitted information.

**REQ-BIZ-002 — Membership and roles.**

Organization operators receive explicit permissions for actions affecting their organization.

**REQ-BIZ-003 — Sponsored presence.**

Businesses may participate in approved advertising and promotion offerings without obtaining unauthorized control over Places, personal content or reputation.

**REQ-ADS-001 — Advertising.**

Clearly labeled advertising may appear on Home, Explore and Share according to approved placement policy.

**REQ-ADS-002 — Campaigns.**

Authorized advertisers and operators may create, manage and evaluate eligible campaigns and promotions.

**REQ-ADS-003 — Honest measurement.**

Impressions, responses and performance reports must reflect defined, genuine measured activity.

**REQ-SUB-001 — Subscriptions.**

Subscription plans and entitlements shall provide explicit rights tied to actual current subscription state.

**REQ-SUB-002 — Trust separation.**

A paid subscription must not automatically establish verified identity, trustworthiness or a professional Guardian qualification.

**REQ-MKT-001 — Marketplace.**

Support an independently governed Marketplace with genuine listings, offers, negotiation, visibility and lifecycle states.

**REQ-MKT-002 — Historical P2P behavior.**

Preserve the historical P2P Local Meetup Market as a research candidate. It does not authorize VQ brokerage, foreign-currency exchange, financial custody or fake settlement outcomes.

**REQ-PAY-001 — Payments.**

Approved real-money purchase flows shall have genuine provider-authorized status, price/terms, cancellation/refund behavior, transaction records and reconciliation.

**REQ-PAY-002 — Financial integrity.**

A pending payment, chat agreement, client confirmation or Handshake is not proof of settled funds.

Commercial provider choices, jurisdiction requirements, taxation and supported transaction types require separate approval.

---

## 20. Events, Activities and independent Ticketing

**REQ-ACT-001 — Activities.**

Ordinary eligible users may organize Activities, manage appropriate participation and communicate activity-specific details.

**REQ-ACT-002 — Real participation.**

Joining, expressing interest, physically attending and completing an Activity shall remain distinct states.

**REQ-EVT-001 — Events.**

Eligible organizers, artists and businesses may publish Events with accurate host, schedule, venue, admission, audience and availability.

**REQ-EVT-002 — Event participation.**

Events may support eligible RSVP, attendance communication, updates and discussion without automatically issuing tickets.

**REQ-TKT-001 — Independent Ticketing.**

Ticketing is an independent product domain. Tickets may be offered with or without association to an Event listing.

**REQ-TKT-002 — Ticket lifecycle.**

Eligible ticket products shall have explicit inventory, purchase or allocation terms, issuance, ownership, admission validation and cancellation status.

**REQ-TKT-003 — Separation.**

Ticket ownership is not equivalent to Event RSVP, actual attendance, Activity participation or Guardian reservation acceptance.

**REQ-TKT-004 — Protection.**

Admission must not be authorized through a forged screenshot, duplicate redeemed ticket or unsupported client-only proof.

Transferability, refunds and resale policy require explicit Product Owner decisions.

---

## 21. Global Media and user information

**REQ-MEDIA-001 — Shared global capability.**

The product shall have a coherent Global Media capability supporting authorized images, video and audio across all relevant domains.

**REQ-MEDIA-002 — Separate media and user-record responsibilities.**

User information and business records shall be held under canonical application data authority. Actual media files shall use appropriately controlled object storage.

The product database shall retain the relevant media identity, ownership, state and authorized references rather than relying on client-local files.

**REQ-MEDIA-003 — Consumer permissions.**

Each consuming domain determines whether a media attachment is permitted for the associated content or business action.

Global Media controls asset processing and storage, not the business meaning of a Guardian selfie, social post, Trail cover or verification submission.

**REQ-MEDIA-004 — Processing lifecycle.**

Uploads shall expose real pending, accepted, processing, ready, failed and removed conditions where applicable.

Private attachments shall not become public solely because a generated asset URL exists.

**REQ-MEDIA-005 — Retention.**

Media deletion, replacement, access expiry and orphan cleanup must follow approved privacy and retention rules.

**REQ-DATA-001 — Canonical user information.**

One canonical User shall connect authentication identities, profile presentation, privacy preferences and authorized relationships.

**REQ-DATA-002 — Protected information.**

Personal credentials, private messages, precise location, sensitive media, payment information and private administrative data shall not leak through public projections or Telegram/browser differences.

---

## 22. Cross-domain requirements

**REQ-XD-001 — One authoritative outcome.**

A business action must have one responsible source of truth. Multiple screens may display that outcome but may not independently generate competing authoritative copies.

**REQ-XD-002 — Shared identity.**

All applicable features refer to the same authenticated participant across Web and Telegram.

**REQ-XD-003 — Consistent visibility.**

Changes to privacy, moderation, expiry and deletion shall be reflected in all applicable searches, feeds, profiles, notifications and shared links.

**REQ-XD-004 — Cross-domain effects.**

Secondary outcomes such as notifications, media cleanup, reward eligibility and search projection updates shall not falsely imply success of their initiating business action.

**REQ-XD-005 — Retry safety.**

Duplicate user submission, client refresh, network retry and background replay must not produce duplicate authoritative bookings, rewards, Handshakes, admissions or other protected effects.

**REQ-XD-006 — Authenticity.**

No simulated people, fake messages, invented GPS evidence, fabricated live media, false completed payments, client-controlled rewards or demo success states may be presented as genuine production activity.

---

## 23. Nonfunctional product requirements

**REQ-NF-001 — Accessibility.**

The product shall support accessible navigation, controls, keyboard access, readable typography, appropriate contrast and assistive-technology semantics.

**REQ-NF-002 — Mobile usability.**

All primary and administrative workflows shall be usable at supported phone screen sizes and account for virtual keyboards, scrolling, safe areas and touch inputs.

**REQ-NF-003 — Performance.**

Core navigation, search, feeds, maps, communication and media use shall have measurable performance acceptance targets defined before release.

No latency or throughput guarantee is invented in this draft.

**REQ-NF-004 — Availability and recovery.**

Users shall receive truthful failures and recovery paths when dependencies, network, media processing, payments or real-time systems are unavailable.

**REQ-NF-005 — Security and privacy.**

Protected actions shall enforce authentication, authorization, record ownership and relevant consent at a trusted server boundary.

**REQ-NF-006 — Data lifecycle.**

Sensitive records and media shall have defined visibility, retention, deletion and recovery policies appropriate to their purpose.

**REQ-NF-007 — Localization.**

Supported languages, formats and RTL behavior shall follow approved locale requirements and host capabilities.

**REQ-NF-008 — Observability.**

Operational failure, processing delay and business-event inconsistencies shall be diagnosable without exposing confidential user information.

**REQ-NF-009 — Release compatibility.**

Before an approved release is accepted, actual application versions, installed database migrations and relevant Worker/media dependencies must be compatible and verified.

A green CI result, present migration file or old healthy deployment is not proof that a new release is working.

**REQ-NF-010 — Cross-entry acceptance.**

Important journeys shall be verified through the supported browser and Telegram experiences, rather than assuming that success in one host proves the other.

---

## 24. Complete initial domain scope

The current candidate domain inventory comprises all 28 business responsibilities:

| ID | Domain | Principal product requirement coverage |
|---|---|---|
| D01 | Identity & Authentication | Account/session identity and Web/Telegram linking |
| D02 | Profiles & Personal Preferences | Presentation, preferences and privacy |
| D03 | Social Graph | Follow, block and social relations |
| D04 | Geo & Presence | Consent, location context and presence evidence |
| D05 | Places & Contributions | Place identity, updates, reviews and check-ins |
| D06 | Vibe Trails | Trail creation, publication and remix |
| D07 | Guardians & Local Legends | Guardian eligibility and service profile |
| D08 | Tours & Guardian Reservations | Tour offers and reservation lifecycle |
| D09 | Businesses & Organizations | Organization records and authorized operation |
| D10 | Activities | User Activities and participation |
| D11 | Events | Organizer Events and RSVP |
| D12 | Social Content | Gossip, posts, comments and reactions |
| D13 | Global Media | Images, video, audio and asset lifecycle |
| D14 | Messaging | Authorized durable conversations |
| D15 | Live Rooms | Live room sessions and participants |
| D16 | Communities & Circles | Communities, membership and roles |
| D17 | Matching & Connections | Drift, Pulls and confirmed Vibes |
| D18 | Challenges & Live Vibes | VibeCheck, VibeFlash and ephemeral participation |
| D19 | Recognition & Reputation | Badges, standing and earned recognition |
| D20 | VQ Rewards & Ledger | Admin-configured VQ and authoritative history |
| D21 | Moderation & Trust | Reports, safety decisions and appeals |
| D22 | Encounter / Handshake Verification | Qualifying Handshake interactions |
| D23 | Notifications | Inbox, preferences and delivery |
| D24 | Advertising & Promotions | Campaigns and sponsored placement |
| D25 | Subscriptions & Entitlements | Plans, status and privileges |
| D26 | Marketplace | Listings, offers and negotiation |
| D27 | Payments & Billing | Real-money payment lifecycle |
| D28 | Ticketing | Independent ticket lifecycle |

These domain names remain a final candidate pending the stated ownership approval and historical feature cross-check. They do not imply 28 microservices or 28 databases.

Search, global Admin, application shell, infrastructure and analytics are necessary cross-domain capabilities, not additional domain writers.

---

## 25. Critical end-to-end acceptance journeys

The application shall demonstrate the following journeys when the relevant product rules and implementations are approved.

| ID | Journey | Essential acceptance outcome |
|---|---|---|
| J-01 | Guest → Explore → Place/Trail → protected action | Public discovery succeeds without sign-in; protected action prompts account resolution |
| J-02 | Web account → Telegram entry | Authorized shared identity; no duplicate User |
| J-03 | Place proposal → validation → published contribution | One canonical Place/contribution history |
| J-04 | Create Trail → publish → share → remix | Stable identity and preserved source attribution |
| J-05 | Guardian onboarding → valid selfie → directory | Only eligible visible Guardian listings |
| J-06 | Hire → pending request → other party accepts | One accepted request and one qualifying Handshake |
| J-07 | Tour offer → availability → request → decision | Consistent reservation state without fake payment |
| J-08 | Share/Gossip publish → Home feeds | Same canonical post and authorized reactions |
| J-09 | Drift → Pull → acceptance → confirmed Vibe | Relationship only after qualifying acceptance |
| J-10 | VibeCheck invitation → media response | Server-authoritative 180-second deadline |
| J-11 | VibeFlash occasion → response → mosaic | Server-authoritative 33-second deadline and privacy |
| J-12 | Verified activity → VQ eligibility → ledger | One auditable award and consistent Purse balance |
| J-13 | Admin changes VQ rule → real qualifying event | Authorized rule version used consistently |
| J-14 | Community join → room participation → leave/block | Permissions enforced throughout |
| J-15 | Event RSVP → optional ticket purchase → validation | Distinct Event, payment and ticket outcomes |
| J-16 | Media upload → publish → revoke/delete | Asset and attachment state remain consistent |
| J-17 | Notification → source deep link | Opens actual authorized originating object |
| J-18 | Browser/Telegram release acceptance | Both entry methods function through compatible canonical API |

These are acceptance journey definitions, not assertions that the features are currently implemented.

---

## 26. Outstanding policy and evidence gates

The following are not silently decided by this document:

1. Complete reconciliation of all 215 historical feature IDs against the current requirements and 28-domain candidate.
2. Final acceptance of the exact domain-ownership register.
3. Guardian verification/vetting and the details of paid service eligibility.
4. Handshake cancellation, revocation, Local Legend free interaction and physical-encounter proof.
5. Tour scheduling, holds, refunds, payment sequence and disputes.
6. Place and encounter proximity proof, GPS accuracy, privacy retention and fraud safeguards.
7. Exact VQ qualifying catalog, caps, cooldowns, grants and transfer/spend policy.
8. Romance matching consent, age eligibility, cooldown interpretation and sensitive-data protection.
9. Complete public/private permission matrix, community governance and messaging access.
10. Media expiration and private/public content lifetimes.
11. Marketplace financial boundaries, providers and transaction settlement policy.
12. Ticket transferability, refunds, validation and resale.
13. Supported locales, notification channels, accessibility and measurable performance targets.
14. Final frontend delivery topology, preserving one shared product/API/backend and functional Telegram host experience.
15. Full independent semantic verification against the original source material, including portions of the legacy master plan not successfully retrieved.

Existing approved decisions shall not be reopened merely because they are connected to these remaining questions.

---

## 27. Requirements acceptance criteria

This document may be submitted for approval only after:

- Every substantive requirement has an accurate current decision status.
- Previously accepted directions are preserved, and superseded descriptions are identified.
- All relevant historical feature IDs have an independently checked disposition.
- Product journeys and domains have no unjustified missing or duplicate ownership.
- Contradictions with governing documents are explicitly reconciled.
- Genuine unresolved business choices are isolated without inventing defaults.
- A second semantic review checks high-risk feature interactions.
- Mechanical integrity checks confirm unique requirement IDs, section completeness and valid references.
- The Product Owner reviews and explicitly approves the complete intended content.

Only after approval may the exact approved document be published to the agreed GitHub location.

**Current status:** Candidate requirements draft. No implementation, migration, database creation, provider integration or deployment is authorized by this document.

---

**End of Requirements.md — Review Candidate**