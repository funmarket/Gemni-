# VibeQuest — Domain Ownership Register (Lean Final Candidate)

**Date:** 2026-10-29 (Africa/Tunis)  
**Status:** FINAL CANDIDATE — awaiting Product Owner approval and full 215-feature ownership cross-check.  
**Scope:** Entire **new** VibeQuest application; legacy repositories, ZIPs and generated contracts are reference evidence, not implementation authority.

## Decision: 28 domains, all in the initial application

**Total: 28. Initial-product scope: 28. Deferred domains: 0.**

All 28 must be accounted for in the initial product architecture and implementation plan. Development can be sequenced, but no domain is excluded from the agreed complete initial application. **Ticketing is independent of Events and Guardian Reservations; tickets may be sold without an Event listing.** Product scope does not itself approve a provider, pricing, payment processor, ticket-transfer policy or release date.

## Canonical domain register

| ID | Domain | Sole authoritative responsibility |
|---|---|---|
| D01 | Identity & Authentication | Users, sessions, login methods, linking and recovery. |
| D02 | Profiles & Personal Preferences | Public profiles, personal settings, language, theme and accessibility overrides. |
| D03 | Social Graph | Following, blocking and their relationship rules. |
| D04 | Geo & Presence | Location consent/evidence, precision, proximity assertions and temporary presence. |
| D05 | Places & Contributions | Place identity/facts; submission, review, check-in evidence and approved corrections. |
| D06 | Vibe Trails | Trail creation, stops, versions, publication, remix and attribution. |
| D07 | Guardians & Local Legends | Status, qualification, offers and service eligibility. |
| D08 | Tours & Guardian Reservations | Booking slots, holds, capacity, reservations, cancellation and completion. |
| D09 | Businesses & Organizations | Business/organization accounts, claims, operator membership and authority. |
| D10 | Activities | User-created activities, participation and activity completion. |
| D11 | Events | Organizer/business/artist-created events, publication, venues, schedules and RSVPs. |
| D12 | Social Content | Posts, social modes, comments, reactions, audiences and content state. |
| D13 | Global Media | Audio/image/video assets, uploads, processing, variants, secure delivery and retention. |
| D14 | Messaging | Conversations, messages, authorized membership and message delivery/read state. |
| D15 | Live Rooms | Live sessions, speakers/participants and room lifecycle. |
| D16 | Communities & Circles | Communities, circles, invitations, roles and membership. |
| D17 | Matching & Connections | Match/Pull proposals, acceptance and connection lifecycle. |
| D18 | Challenges & Live Vibes | Challenge rules, VibeCheck (180 s), VibeFlash (33 s), participation and outcomes. |
| D19 | Recognition & Reputation | Badges, standing, qualifications, recognition and revocation; **not currency**. |
| D20 | VQ Rewards & Ledger | Admin-controlled VQ earning rules, manual/group/all-user awards, immutable entries, reversals and balances. **No legacy Points.** |
| D21 | Moderation & Trust | Reports, safety decisions, enforcement, restrictions and appeals. |
| D22 | Encounter / Handshake Verification | Encounter claims, mutual evidence, confirmation, expiry and disputes. |
| D23 | Notifications | Inbox, unread state, preferences, templates, channel delivery, retries and deduplication. |
| D24 | Advertising & Promotions | Ad inventory/placements (Home, Explore, Share), campaigns, frequency, sponsorship and performance. |
| D25 | Subscriptions & Entitlements | Plans, subscription lifecycle and access privileges for Pro Guardians, Place Owners and other services. |
| D26 | Marketplace | Listings, offers and negotiated exchanges, separately from sponsored ads. |
| D27 | Payments & Billing | Real-money charges, provider reconciliation, invoices, fees, refunds and payment disputes. |
| D28 | Ticketing | Ticket products with **optional** Event link, inventory, issuance, ownership, validation, admission and ticket-specific lifecycle. |

## Non-domain platform and control capabilities

These are required but **do not increase the 28 business-domain count**:

- **Search & Discovery:** Read/index projections across source domains; Home/Explore and guest public browsing. Cannot modify canonical business records.
- **Administration & Operations:** Permission-scoped control panel, domain-command orchestration, audit, analytics and global configuration. Cannot bypass domain write authorities.
- **Application Shell:** Home / Explore / central Share / Vibe / Purse, notification bell in the top bar, profile/settings dropdown, accessible guest-first UX, responsive Web/Telegram experiences.
- **Shared technical infrastructure:** PostgreSQL/PostGIS, migration validation, outbox/worker, realtime transport, media storage adapters, caching, security, localization and observability.

## Ownership rules and important separations

1. **One authoritative writer per business fact.** Shared UI, notifications, admin and search consume or invoke domain contracts; they do not take over business data.
2. **Events != Activities != Ticketing.** Events and Tickets can exist independently. Guardian Reservations remain independently bookable; common availability utilities do not merge their ownership.
3. **VQ != Reputation != fiat money.** VQ is the only in-app reward unit; admins configure amounts and grants. Reputation cannot be spent; Payments owns fiat transactions. A future crypto scheme is not silently included.
4. **Media owns files; consumer domains own attachment meaning and access.** Notifications own delivery state, not the business event that triggered it.
5. **Subscriptions own entitlements, not trust/identity.** Paying cannot automatically establish verified Guardian status or legitimate Place ownership.
6. **Advertising owns campaigns, not advertised Places/Trails/Events.** Ads remain limited, clearly marked and controlled by placement policy.
7. **Guest-first:** public browsing does not require registration; publishing, messaging and protected participation do. Access policy follows each domain's actual public/private records.
8. **All 28 included at launch.** No deferred domains. Exact functional rules, billing providers, ticketing policies and feature acceptance tests are specified before implementation, not invented by coding agents.

## Closure gate — not falsely marked complete

- [x] Reconcile 26 historical candidate names with new requirements into **28 distinct domain identities**.
- [x] Remove the contradictory `DEFERRED`, `COMMERCIAL-PLAN` and `CORE` labels: **all 28 initial application scope**.
- [x] State key ownership exclusions and cross-domain rules.
- [ ] Product Owner approval of the **exact 28-row domain register**.
- [ ] Independent one-by-one mapping of all **215 recovered feature records** to one owner; flag and resolve unowned/duplicate-owner records.
- [ ] Resolve any material ownership conflict found during that cross-check and record approval.

**No code, migrations, GitHub/Railway changes or new repository creation are authorized by this register.** The register is concise and reconciled, but **not locked** until its outstanding approval and coverage gates pass.